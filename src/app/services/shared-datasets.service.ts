
import { Injectable } from '@angular/core';
import { BucketDetails, InverseFareDetails } from '../models/dashboard.model';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { debounceTime, pairwise, map } from 'rxjs/operators';
import { distinctUntilChanged, tap, filter, scan } from 'rxjs/operators';
import { DragPointDistributionService } from '../services/drag-point-distribution';

import { FlightClientDetails, BarSeries, BidPriceInfluencers } from '../models/dashboard.model';
import { ColorManagerService } from './color-manager-service';

@Injectable({
    providedIn: 'root',
})


export class SharedDatasetService {

    public allFlightValues: any[] = []

    public bucketDetails: BucketDetails[] = [];

    public storedAus: number[][] = []

    static roundMultiplierDecimals = 4;

    static roundFactor = Math.pow(10, SharedDatasetService.roundMultiplierDecimals);

    public bucketDetailsBehaviorSubject$ = new BehaviorSubject<boolean>(false);

    // Boolean from trigger
    public resetDefaultSubject$ = new BehaviorSubject<boolean>(false);

    public influenceInput = new Subject<any[]>();

    public totalBookingsCollector: number = 0;

    public maxAuValue: number = 0;

    public selectedMetric = 0;

    // Stepped(Fixed) BidPrices
    public dynamicBidPrices: number[] = [];
    // Interpolated Prices
    public interpolateBidPriceCurvePoints: number[] = [];
    // Influence based curve 
    // public adjustedCurvePoints: number[] = [];

    public competitorsCurvePoints: any[][] = [];

    public activeCurve: number[] = [];

    public metricGroupSubject$ = new BehaviorSubject<any>([]);

    public inverseFareValues: InverseFareDetails[] = [];

    public showCompetitorsFlag = false;



    public multiSelectedNodeSubject$ = new BehaviorSubject<number[]>([]);



    public modifierObj = { mult: 1.00, addSub: 0, partialMax: '' } as BidPriceInfluencers;

    public staticModifiers = { mult: 1.00, addSub: 0, partialMax: '' } as BidPriceInfluencers;

    // From Influence setter
    public modifierCollection = [];

    public selectedElement: any[] = [];

    public nonDiscreteBuckets: BucketDetails[] = [];

    public dragPointCalculations: DragPointDistributionService;

    public colorRange: string[] = [];

    public currAus: number[] = [];

    public currIndex$ = new BehaviorSubject<number>(null);

    public updatedClientFlight$ = new BehaviorSubject<FlightClientDetails>(null);

    public apiActiveBucketsSubject$ = new BehaviorSubject<BucketDetails[]>([]);

    //public apiFlightActiveSubject$ = new BehaviorSubject<boolean>(false);

    // Simple string array for less overhead
    public buckets: string[] = [];

    public allBuckets: string[] = [];

    public allColors: any[] = [];

    // Activates deselect button
    public pointsOnn$ = new BehaviorSubject<boolean>(false);

    public cabinOptions: any = [
        { name: 'Business', id: 0, state: false },
        { name: 'Prem Econ', id: 1, state: false },
        { name: 'Economy', id: 2, state: true },
    ];


    public dragGrouping: any = [
        { name: 'Single', id: 0, active: true, multiple: false, disabled: false },
        { name: 'Existing AU %', id: 1, active: false, multiple: false, disabled: false },
        { name: 'Linear Protection', id: 2, active: false, multiple: false, disabled: false },
        { name: 'Inverse Fare %', id: 3, active: false, multiple: false, disabled: false }
    ];

    public apiBucketDetails: BucketDetails[][];

    public selectedColorRange = 0;

    public colorRangeSelection$ = new BehaviorSubject<any>({});

    public dynamicChartObject: BarSeries[] = [];

    constructor(private colorManagerService: ColorManagerService) {

        this.dragPointCalculations = new DragPointDistributionService();

        this.allColors = this.colorManagerService.allColorRanges;


        // Triggered every selected point or deselectAll points from Grid component
        // Add a pairwise pipe element
        this.multiSelectedNodeSubject$
            .subscribe((node) => {
                // console.log('node single ', node);
                if (node.length) {
                    this.setGroupingMethod(0);
                    this.dragGrouping[0].name = 'Multiple';
                } else {

                    this.setGroupingMethod(this.selectedMetric);
                    this.dragGrouping[0].name = 'Single';
                }
                this.metricGroupSubject$.next(this.dragGrouping);
            })
        /////////////////////////////////////////

        this.resetDefaultSubject$
            .subscribe(response => {

                if (response) {
                    this.modifierObj = { mult: 1.00, addSub: 0, partialMax: '' };
                    this.totalBookingsCollector = 0;
                    this.selectedMetric = 0;
                    this.setGroupingMethod(0);
                    this.metricGroupSubject$.next(this.dragGrouping);
                }
            });


        this.influenceInput.pipe(
            filter(Boolean),
            debounceTime(900),
            distinctUntilChanged(),
            tap(([event, item, id]) => {
                //  console.log('influenceInput event ', event, ' item ', item, ' id ', id)
                Object.entries(this.modifierObj).map((d: any, i) => {

                    if (event === null || d[1] === null) {
                        event = this.staticModifiers[d[0]];
                        this.modifierObj[d[0]] = event
                    }
                })

                this.modifierObj[item] = event;
                const staticModifierObj = { mult: 1.00, addSub: 0, partialMax: '' };
                Object.entries(staticModifierObj).forEach((d: any, i) => {
                    if (staticModifierObj[item] !== this.modifierObj[item]) {
                        if (!this.modifierCollection.some(influence => influence.key === item)) {

                            this.modifierCollection.push({ key: item, value: this.modifierObj[item] });
                        } else {
                            const index = this.modifierCollection.findIndex(r => r.key === item);
                            if (this.modifierCollection[index].value !== event) {
                                this.modifierCollection[index].value = event;
                            }
                        }
                    } else {
                        this.modifierCollection.splice(this.modifierCollection.findIndex(idx => idx === idx), 1);
                    }
                });

                if (this.modifierCollection.length > 0) {
                    // console.log('sharedDatasetService modifierObj ', this.modifierObj, '   this.modifierCollection ', this.modifierCollection)
                    this.bucketDetailsBehaviorSubject$.next(true);
                }

            })
        )
            .subscribe();
    }



    // From Color Dropdown and at app start
    public getColorValues(choice): any {

        //console.log('getColorValues ', choice)
        this.selectedColorRange = choice.id;
        this.colorRange = this.allColors[choice.id].value;
        this.colorRangeSelection$.next(this.allColors[choice.id])

    }



    // Removes Discrete buckets for AU Visualization Chart
    public setConcatedBucketDetails(): any {

        this.nonDiscreteBuckets = [];
        this.buckets = [];

        this.bucketDetails.forEach((d, i) => {
            if (!d.discrete) {
                this.buckets.push(d.letter)
                this.nonDiscreteBuckets.push(d)
                //  console.log(' this.colorRange. ', d.color)
            }
        })

        this.nonDiscreteBuckets.map((d, i) => {
            //console.log(' this.colorRange. ', this.colorRange[i])
            return d.color = this.colorRange[i];
        })
        //console.log(' this.nonDiscreteBuckets ', this.nonDiscreteBuckets)


        // console.log(' this.nonDiscreteBuckets ', this.nonDiscreteBuckets)
        return this.nonDiscreteBuckets;
        // this.apiFlightActiveSubject$.next(true);
    }




    public setGroupingMethod(idx: number) {

        this.selectedMetric = idx;
        let state = false;

        if (this.selectedElement.length > 0) {
            state = true;
            this.dragGrouping.forEach((dg, i) => {
                if (i === 0) {
                    this.dragGrouping[i].disabled = false;
                    this.dragGrouping[i].active = true;
                } else {
                    this.dragGrouping[i].active = false;
                    this.dragGrouping[i].disabled = true;
                }
            })
        } else {
            state = false;
            this.dragGrouping.forEach((dg, i) => {
                this.dragGrouping[i].disabled = false;
                this.dragGrouping[this.selectedMetric].active = true;
            })
        }

        setTimeout(() => {
            this.pointsOnn$.next(state);
        }, 0);
    }



    // Updates Flight Behavior Subject and triggers return FlightClient with setting cabin to Economy(Y)
    public setFlightClient(idx: number): void {

        const tempSavedCollection = JSON.parse(window.localStorage.getItem('savedBucketCollection'));
        this.bucketDetails = tempSavedCollection[idx];
        this.maxAuValue = this.bucketDetails[0].Aus;
        this.getColorValues(this.allColors[1])

        this.apiActiveBucketsSubject$.next(this.setConcatedBucketDetails());

        this.inverseFareValues = this.generateInverseDetails();
        this.applyDataChanges();
    }


    //  Reset Default button press -- buctDetails set from here, Subject in Components take care of 
    public resetFromArchivedBuckets(idx: number) {
        const tempCollection = JSON.parse(window.localStorage.getItem('archivedBucketCollection'));
        this.bucketDetails = tempCollection[idx];
        console.log('this.bucketDetails ', this.bucketDetails)
        this.setConcatedBucketDetails()
        this.resetDefaultSubject$.next(true);
    }



    //  Save changes button press
    public saveBucketSet(idx: number) {
        const tempSavedCollection = JSON.parse(window.localStorage.getItem('savedBucketCollection'));
        tempSavedCollection[idx] = this.bucketDetails;
        window.localStorage.setItem('savedBucketCollection', JSON.stringify(JSON.parse(JSON.stringify(tempSavedCollection))));
    }



    public applyDataChanges() {
        //  console.log('applyDataChanges')
        this.calculateAus();
    }



    // Returns Derived AU breakpoints
    public calculateAus() {
        //console.log('calculateAus ', this.nonDiscreteBuckets.length)
        if (this.nonDiscreteBuckets.length) {
            // setTimeout(() => {
            this.generateBucketValues();
            // }, 0);

        }
    }



    // // Set up bar colors 
    public adjustPieceColorAndValue(buckets): any[] {
        let test = [];
        for (let e = 0; e < buckets.protections; e++) {
            this.dynamicBidPrices.push(buckets.fare)
            const chartObj = {
                value: buckets.fare,
                itemStyle: {
                    color: buckets.color
                }
            }
            test.push(chartObj)
        }
        return test;
    }



    public returnProtectionValues(set): any {

        let colorSeries = [];

        let chartObj = {
            value: 0,
            itemStyle: {
                color: ''
            }
        };

        for (let p = 0; p < set.protections; p++) {

            return chartObj = {
                value: set.fare,
                itemStyle: {
                    color: set.color
                }
            }

        }
        //console.log('colorSeries ', chartObj)
        return chartObj
    }


    public adjustPieceColorForBookingUpdates() {
        this.dynamicBidPrices = [];
        this.dynamicChartObject = [];
        this.nonDiscreteBuckets.map((pc, i) => {
            pc.color = this.colorRange[i];
            const fareHolder = this.adjustPieceColorAndValue(pc)
            this.dynamicChartObject.push(...fareHolder)
        })
    }


    // Generates protections from Aus
    public generateBucketValues() {

        this.nonDiscreteBuckets.map((a, i) => {
            //  console.log('diff   ', this.protectionMyLevel(i), ' Letter', a.letter)
            return a.protections = this.protectionMyLevel(i);
        })

        this.adjustPieceColorForBookingUpdates();
        setTimeout(() => {
            this.bucketDetailsBehaviorSubject$.next(true);
        }, 0);

    }



    // Returns Bucket Seat count for protection
    public protectionMyLevel(idx: number): number {

        const nextBucketValue = (idx === (this.nonDiscreteBuckets.length - 1)) ? 0 : this.nonDiscreteBuckets[idx + 1].Aus;
        //  console.log('idx ', idx, ' nextBucketValue. ', nextBucketValue, ' LETTER ', this.nonDiscreteBuckets[idx].letter)
        const diff = this.nonDiscreteBuckets[idx].Aus - nextBucketValue;
        /// console.log('diff   ', diff, ' Letter', this.nonDiscreteBuckets[idx].letter)
        //this.renderProtectionColors(diff)
        return (diff > 0) ? diff : 0;
    }



    public showCompetitors() {
        this.showCompetitorsFlag = !this.showCompetitorsFlag;
        this.nonDiscreteBuckets = JSON.parse(window.localStorage.getItem('archivedBuckets'));
        this.resetDefaultSubject$.next(true)
    }



    public resetInverseDetailsFromBookings() {
        this.inverseFareValues = this.generateInverseDetails();
    }


    // Builds Inverse Fare % values, called onInit and Booking slider changes
    public generateInverseDetails(): any[] {

        const inverseFareValues = [];
        let remainingSeats = this.nonDiscreteBuckets[0].Aus - this.totalBookingsCollector;
        //console.log('generateInverseDetails Length ', this.nonDiscreteBuckets.length, ' remainingSeats ', remainingSeats)
        let percentOfTop = [];
        let inverseDistribution = 0;
        let theTop = this.nonDiscreteBuckets[0].Aus;
        let totalIFV = 0;

        this.nonDiscreteBuckets.map((d: any, i) => {
            // console.log('Letter ', d)
            percentOfTop.push(+((d.fare / theTop) * 100).toFixed(0));
            inverseDistribution = 1 / (percentOfTop[i] * 100);
            totalIFV = totalIFV + inverseDistribution;
            const remain = (((inverseDistribution / totalIFV)));
            const protections = +(remainingSeats * remain).toFixed(2);
            inverseFareValues.push({ inverseDistribute: inverseDistribution, protections: protections })
        })

        let newArray = [];

        inverseFareValues.forEach((iv, i) => {
            // console.log('inverseFareValues ', i)
            const remain = (((iv.inverseDistribute / totalIFV)));
            const protections = +(remainingSeats * remain).toFixed(2);
            newArray.push({ protections: protections });
        })

        //console.log('generateInverseDetails newArray ', newArray)
        return newArray;
    }


    // From Au bar scale drag up or down
    public calculateBidPriceForAu(currAu: number, bucketIdx: number, targetAu: number) {

        let targetBp: number;
        if (targetAu === 0) {
            targetBp = 0;
        } else {

            targetBp = targetAu > this.dynamicBidPrices.length ? this.dynamicBidPrices[0] : this.dynamicBidPrices[this.dynamicBidPrices.length - targetAu];
        }

        // How many handles to bring along on the way up -->

        if (targetAu >= currAu) {
            console.log(' targetAu  ', targetAu, ' currAu ', currAu)

            for (let i = bucketIdx; i > 0; i--) {
                console.log(' Up  ')
                // console.log('Letter ', this.nonDiscreteBuckets[i].letter, ' UP targetAu  ', this.nonDiscreteBuckets[i].Aus)
                const bucketInfo = this.nonDiscreteBuckets[i];

                if (bucketInfo.fare < targetBp) {

                    // console.log('       UP:  bucketInfo.fare  ', bucketInfo.fare, ' fare ', targetBp, ' Letter ', this.nonDiscreteBuckets[i].letter)
                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        //   console.log('UP: bucketInfo bucketIdx ', bucketIdx, ' Letter ', bucketInfo.letter, ' I letter ', this.nonDiscreteBuckets[i].letter, ' targetAu ', targetAu)

                        this.justifyDistributionFromDrag(bucketIdx, targetAu, 'up');
                        bucketInfo.Aus = targetAu;
                        this.applyDataChanges();

                        // console.log(' Up: dragSelectedNodes ', bucketIdx, ' bucketInfo ', this.nonDiscreteBuckets[i + 1].letter, ' Aus ', this.nonDiscreteBuckets[i + 1].Aus)
                    } else if (this.selectedElement.length > 0) {
                        if (this.selectedElement.includes(bucketIdx)) {
                            this.dragPointCalculations.dragSelectedNodes(this.selectedElement, this.nonDiscreteBuckets, 'up', targetAu);
                            this.applyDataChanges();
                        }
                    }
                    else {
                        bucketInfo.Aus = targetAu;
                        this.applyDataChanges();
                        //  console.log('Up: (((((((((((((((((((((((((( ELSE  ', bucketInfo.letter, ' Target Au ', targetAu)

                    }
                }
            }
        } else {
            // console.log(' DOWN targetAu  ', targetAu, ' currAu ', currAu)
            // console.log('            ******************\n\n\n Joining: targetAu ', targetAu, ' targetBp ', targetBp)
            for (let i = bucketIdx; i < this.nonDiscreteBuckets.length; i++) {

                const bucketInfo = this.nonDiscreteBuckets[i];
                // console.log('**************************\n\n\n Down: dragSelectedNodes ', bucketInfo.fare, ' targetBp ', targetBp)
                if (bucketInfo.fare >= targetBp) {
                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        //console.log('Down: bucketInfo bucketIdx ', bucketIdx, ' Letter ', this.nonDiscreteBuckets[i].letter, ' targetAu ', targetAu)
                        //bucketInfo.Aus = targetAu;
                        this.applyDataChanges();
                        this.justifyDistributionFromDrag(bucketIdx, targetAu, 'down');
                    } else if (this.selectedElement.length > 0) {
                        if (this.selectedElement.includes(bucketIdx)) {
                            this.dragPointCalculations.dragSelectedNodes(this.selectedElement, this.nonDiscreteBuckets, 'down', targetAu);
                            this.applyDataChanges();
                        }
                    }
                    else {
                        bucketInfo.Aus = targetAu;
                        this.applyDataChanges();
                        //console.log('Down: (((((((((((((((((((((((((( ELSE  ', bucketInfo.letter, ' Target Au ', targetAu)
                    }
                }
            }
        }
    }



    public justifyDistributionFromDrag(bucketIdx, targetAu, direction) {
        console.log('justifyDistributionFromDrag ', bucketIdx, ' targetAu ', targetAu, ' direction ', direction)

        if (this.selectedMetric === 1) {
            this.distributeFromExistingAus(bucketIdx, targetAu, direction);
        } else if (this.selectedMetric === 2) {
            //console.log('direction ', direction, ' idx ', bucketIdx, ' letter ', this.nonDiscreteBuckets[bucketIdx].letter, '  targetAu ', targetAu, ' Au ', this.nonDiscreteBuckets[bucketIdx].Aus, ' selectedMetric ', this.selectedMetric)
            this.distributeFromLinearScale(bucketIdx, targetAu, direction);
        } else if (this.selectedMetric === 3) {
            this.distributeFromInverseFareValues(bucketIdx, targetAu, direction)
        }

    }


    public distributeFromExistingAus(bucketIdx, targetAu, direction) {

        let groupValueAuPercentage = 0;
        if (direction === 'up') {
            for (let i = bucketIdx; i >= 0; i--) {

                if (this.nonDiscreteBuckets[i].Aus < this.maxAuValue) {
                    groupValueAuPercentage = this.nonDiscreteBuckets[bucketIdx].Aus / (targetAu / bucketIdx) / bucketIdx;
                    const bucketInfo = this.nonDiscreteBuckets[i];
                    bucketInfo.Aus = bucketInfo.Aus += groupValueAuPercentage;
                    // console.log('   Au % ', this.nonDiscreteBuckets[i].letter, ' idx ', i, ' Modifier ', groupValueAuPercentage.toFixed(2), ' Aus ', this.nonDiscreteBuckets[i].Aus.toFixed(2))
                }
                else {
                    this.nonDiscreteBuckets[i].Aus = this.maxAuValue;
                }
            }
        } else {
            for (let i = bucketIdx; i < this.nonDiscreteBuckets.length; i++) {
                let groupValueAuPercentage = 0;
                if (this.nonDiscreteBuckets[i].Aus > 0) {
                    groupValueAuPercentage = this.nonDiscreteBuckets[i].Aus / (targetAu / bucketIdx) / bucketIdx;
                    const bucketInfo = this.nonDiscreteBuckets[i];
                    bucketInfo.Aus = bucketInfo.Aus -= groupValueAuPercentage;
                    // console.log('   Au % ', this.nonDiscreteBuckets[i].letter, ' idx ', i, ' Modifier ', groupValueAuPercentage.toFixed(2), ' Aus ', this.nonDiscreteBuckets[i].Aus.toFixed(2))
                } else {
                    this.nonDiscreteBuckets[i].Aus = 0;
                }
            }

        }
    }



    public distributeFromLinearScale(bucketIndex, targetAu, dir) {

        let val;
        let mult;
        let accum = 0;

        if (dir === 'down') {

            val = this.nonDiscreteBuckets.length - bucketIndex;

            // console.log('LINEAR Down Val', val)
            mult = targetAu / val;
            // console.log('LINEAR Down mult', mult)
            for (let i = (this.nonDiscreteBuckets.length - 1); i >= bucketIndex; i--) {
                //  console.log('           LINEAR Down gdistributeFromLinearScale ', this.nonDiscreteBuckets[i].letter, ' direction ', dir, ' bucketIndex ', bucketIndex, ' targetAu ', targetAu)
                accum += mult
                this.nonDiscreteBuckets[i].Aus = accum;
            }

        } else {

            val = this.nonDiscreteBuckets.length - bucketIndex;

            // console.log('LINEAR Up Val', val, ' targetAu ', targetAu)

            accum = 0;

            //mult = ((this.maxAuValue - targetAu) / (bucketIndex));

            mult = (this.maxAuValue - targetAu) / bucketIndex;

            // console.log('LINEAR UP  mult ', mult)

            for (let i = 0; i < bucketIndex; i++) {

                /// if (this.nonDiscreteBuckets[i].Aus <= this.maxAuValue) {

                this.nonDiscreteBuckets[i].Aus = (this.maxAuValue - accum);
                //  console.log('LINEAR UP  gdistributeFromLinearScale ', this.nonDiscreteBuckets[i].letter, ' accum ', accum)
                // } else {

                //    this.nonDiscreteBuckets[i].Aus = this.maxAuValue;
                // }

                accum += mult;
                //  console.log('           LINEAR UP  accum ', accum)
            }
        }
    }


    public distributeFromInverseFareValues(bucketIdx, targetAu, direction) {

        //console.log('\n\n\n generateInverseFareValues ', this.nonDiscreteBuckets[bucketIdx].letter, ' direction ', direction, ' bucketIdx ', bucketIdx, ' targetAu ', targetAu)
        let groupValueAuPercentage = 0;

        if (direction === 'up') {

            //console.log('UP nonDiscreteBuckets ', this.nonDiscreteBuckets[bucketIdx].letter)
            for (let i = bucketIdx; i >= 0; i--) {

                if (this.nonDiscreteBuckets[i].Aus < this.maxAuValue) {
                    groupValueAuPercentage = this.nonDiscreteBuckets[i].Aus / (targetAu / this.inverseFareValues[i].protections) / bucketIdx;
                    const bucketInfo = this.nonDiscreteBuckets[i];
                    bucketInfo.Aus = bucketInfo.Aus += groupValueAuPercentage;
                    console.log('    Inverse Fare % ', this.nonDiscreteBuckets[i].letter, ' idx ', i, ' Modifier ', groupValueAuPercentage.toFixed(2), ' Aus ', this.nonDiscreteBuckets[i].Aus.toFixed(2))
                }
                else {
                    this.nonDiscreteBuckets[i].Aus = this.maxAuValue;
                }
            }

        } else {
            //console.log('Down  letter ', this.nonDiscreteBuckets[bucketIdx].letter)
            let increment = bucketIdx + 1;
            for (let i = bucketIdx; i < this.nonDiscreteBuckets.length; i++) {
                //console.log('i ', i, '   Down  letter ', this.nonDiscreteBuckets[i].letter, ' ip: ', targetAu / this.inverseFareValues[i].protections)
                if (this.nonDiscreteBuckets[i].Aus > 0) {
                    // console.log('i ', i)
                    console.log(' Down Inverse Fare % ', this.nonDiscreteBuckets[i].letter, ' idx ', i, ' Modifier ', groupValueAuPercentage.toFixed(2), ' Aus ', this.nonDiscreteBuckets[i].Aus.toFixed(2))
                    groupValueAuPercentage = this.nonDiscreteBuckets[i].Aus / (targetAu / this.inverseFareValues[i].protections) / increment;
                    const bucketInfo = this.nonDiscreteBuckets[i];
                    bucketInfo.Aus = bucketInfo.Aus < 0 ? 0 : bucketInfo.Aus -= groupValueAuPercentage;
                } else {
                    this.nonDiscreteBuckets[i].Aus = 0;
                }
            }

        }
    }


}