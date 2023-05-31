
import { Injectable } from '@angular/core';
import { BucketDetails, InverseFareDetails } from '../models/dashboard.model';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { distinctUntilChanged, tap, filter } from 'rxjs/operators';
import { DragPointDistributionService } from '../services/drag-point-distribution';

import { FlightClientDetails, BarSeries, BidPriceInfluencers, CompetitiveFareDetails } from '../models/dashboard.model';
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

    public auPercentagesValues: number[] = [];

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
    public allAus: number[] = [];
    public currIndex$ = new BehaviorSubject<number>(null);

    public updatedClientFlight$ = new BehaviorSubject<FlightClientDetails>(null);

    public apiActiveBucketsSubject$ = new BehaviorSubject<BucketDetails[]>([]);

    //public apiFlightActiveSubject$ = new BehaviorSubject<boolean>(false);

    // Simple string array for less overhead
    public buckets: string[] = [];

    public allBuckets: string[] = [];

    public allColors: any[] = [];

    public lastDataIndex = 0;

    public dragDirection: string = '';

    // Activates deselect button
    public pointsOnn$ = new BehaviorSubject<boolean>(false);

    public cabinOptions: any = [
        { name: 'Business', id: 0, state: false },
        { name: 'Prem Econ', id: 1, state: false },
        { name: 'Economy', id: 2, state: true },
    ];


    public dragGrouping: any = [
        { name: 'Single', id: 0, active: true, disabled: false },
        { name: 'Existing AU %', id: 1, active: false, disabled: false },
        { name: 'Linear Protection', id: 2, active: false, disabled: false },
        { name: 'Inverse Fare %', id: 3, active: false, disabled: false }
    ];

    public apiBucketDetails: BucketDetails[][];

    public selectedColorRange = 0;

    public colorRangeSelection$ = new BehaviorSubject<any>({});

    public dynamicChartObject: BarSeries[] = [];

    public competitiveFareValues: CompetitiveFareDetails[] = [];

    constructor(private colorManagerService: ColorManagerService) {

        this.dragPointCalculations = new DragPointDistributionService();

        this.allColors = this.colorManagerService.allColorRanges;


        // Triggered every selected point or deselectAll points from Grid component
        // Add a pairwise pipe element
        this.multiSelectedNodeSubject$
            .pipe(
                debounceTime(40)
            )
            .subscribe((node) => {

                if (node.length > 1) {
                    this.setGroupingMethod(0);
                    this.dragGrouping[0].name = 'Multiple';
                } else {

                    this.setGroupingMethod(this.selectedMetric);
                    this.dragGrouping[0].name = 'Single';
                }
                // console.log('node  this.dragGrouping ', this.dragGrouping);
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
                    console.log('resetDefaultSubject ', this.dragGrouping)
                    this.metricGroupSubject$.next(this.dragGrouping);
                }
            });


        this.influenceInput.pipe(
            filter(Boolean),
            debounceTime(900),
            distinctUntilChanged(),
            tap(([event, item, id]) => {
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
                this.allAus.push(d.Aus)
                // this.buckets.push(d.letter)
                this.nonDiscreteBuckets.push(d)
            }
        })

        this.nonDiscreteBuckets.map((d, i) => {
            return d.color = this.colorRange[i];
        })

        //console.log('this.allAus ', this.allAus);

        return this.nonDiscreteBuckets;
    }





    public setGroupingMethod(idx: number) {

        this.selectedMetric = idx;
        let state = false;
        // console.log('this.selectedMetric ', this.selectedMetric)
        if (this.selectedElement.length > 1) {
            state = true;
            this.dragGrouping.forEach((dg, i) => {
                if (i === 0) {
                    this.dragGrouping[i].disabled = false;
                    this.dragGrouping[i].active = true;
                } else {
                    this.dragGrouping[i].active = false;
                    this.dragGrouping[i].disabled = true;
                }
                //      console.log('this.dragGrouping[i] ', this.dragGrouping[i])
            })
        } else {
            state = false;
            this.dragGrouping.forEach((dg, i) => {
                dg.disabled = false;
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

        this.getColorValues(this.allColors[1])
        this.apiActiveBucketsSubject$.next(this.setConcatedBucketDetails());
        this.maxAuValue = this.bucketDetails[0].Aus;
        this.inverseFareValues = this.generateInverseDetails();
        this.applyDataChanges();
    }


    //  Reset Default button press -- buctDetails set from here, Subject in Components take care of 
    public resetFromArchivedBuckets(idx: number) {
        const tempCollection = JSON.parse(window.localStorage.getItem('archivedBucketCollection'));
        this.bucketDetails = tempCollection[idx];
        //console.log('this.bucketDetails ', this.bucketDetails)
        this.setConcatedBucketDetails()
        this.resetDefaultSubject$.next(true);
    }



    //  Save changes button press
    public saveBucketSet(idx: number) {
        const tempSavedCollection = JSON.parse(window.localStorage.getItem('savedBucketCollection'));
        tempSavedCollection[idx] = this.nonDiscreteBuckets;
        window.localStorage.setItem('savedBucketCollection', JSON.stringify(JSON.parse(JSON.stringify(tempSavedCollection))));
    }




    public returnProtectionValues(set): any {
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
        return chartObj
    }






    public adjustPieceColorForBookingUpdates() {
        // console.log('\n\n***************************\n\n adjustPieceColorForBookingUpdates StARTED ')
        this.dynamicBidPrices = [];
        this.dynamicChartObject = [];
        this.nonDiscreteBuckets.map((pc, i) => {
            pc.color = this.colorRange[i];
            const fareHolder = this.adjustPieceColorAndValue(pc)
            //testNum += Math.round(pc.protections)
            // console.log('i ', i, '    pc ', pc.letter, ' pc prot ', Math.round(pc.protections))
            this.dynamicChartObject.push(...fareHolder)
        })
        //  console.log('DYN length ', this.dynamicBidPrices.length)
    }

    // // Set up bar colors 
    public adjustPieceColorAndValue(buckets): any[] {
        let tempHolderAry = [];
        let setMyGroupColors = this.setSeatColors(buckets)

        for (let e = 0; e <= buckets.protections - 1; e++) {
            this.dynamicBidPrices.push(buckets.fare)
            const chartObj = {
                value: buckets.fare,
                itemStyle: {
                    color: setMyGroupColors[e]
                }
            }
            // console.log('returnGroupColors ', chartObj)
            tempHolderAry.push(chartObj)
        }

        return tempHolderAry;
    }


    private setSeatColors(bucket): string[] {
        let returnGroupColors = [];
        for (let b = bucket.protections; b > 0; b--) {
            let returnColor;
            returnColor = b > bucket.bookings ? bucket.color : bucket.color
            returnGroupColors.push(returnColor)
        }
        return returnGroupColors
    }

    public applyDataChanges() {
        if (this.nonDiscreteBuckets.length) {
            this.generateBucketValues();
        }
    }



    // Generates protections from Aus
    public generateBucketValues() {
        this.currAus = [];
        this.allAus = [];

        this.nonDiscreteBuckets.map((a, i) => {
            this.currAus.push(a.Aus)
            return a.protections = this.protectionMyLevel(i);
        })

        this.allAus = [];
        this.bucketDetails.map((bd, i) => {
            if (i >= this.nonDiscreteBuckets.length) {
                this.allAus.push(bd.Aus)
            }
        })
        //console.log('this.allAus ', this.allAus)
        this.adjustPieceColorForBookingUpdates();

        setTimeout(() => {

            this.bucketDetailsBehaviorSubject$.next(true);
        }, 0);
    }



    // Returns Bucket Seat count for protection
    public protectionMyLevel(idx: number): number {
        const nextBucketValue = (idx === (this.nonDiscreteBuckets.length - 1)) ? 0 : this.nonDiscreteBuckets[idx + 1].Aus;
        //console.log('idx ', idx, ' nextBucketValue. ', Math.round(this.nonDiscreteBuckets[idx].Aus - nextBucketValue), ' LETTER ', this.nonDiscreteBuckets[idx].letter)
        const diff = Math.round(this.nonDiscreteBuckets[idx].Aus - nextBucketValue);

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


    // Multiple nodes selected
    public dragSelectedNodes(selected, dir: any): number {
        // console.log('dragSelectedNodes ', selected, ' dir ', dir)
        return dir === 'down' ? this.nonDiscreteBuckets[selected].Aus -= 1 : this.nonDiscreteBuckets[selected].Aus += 1;

    }


    // From Au bar scale drag up or down
    public calculateBidPriceForAu(bucketIdx: number, targetAu: number, direction: string) {

        let metric = 'nonDiscreteBuckets';
        let auMetric = 'currAus';

        if (bucketIdx > this.nonDiscreteBuckets.length) {
            metric = 'bucketDetails';
            auMetric = 'allAus';

        } else {
            metric = 'nonDiscreteBuckets';
            auMetric = 'currAus';
        }
        // console.log('\n     PRE  direction ', direction, ' bucketIdx ', bucketIdx, ' auMetric ', auMetric, ' metric ', metric)

        let targetBp: number;

        if (targetAu === 0) {
            targetBp = 0;

        } else {
            targetBp = targetAu > this.dynamicBidPrices.length ? this.maxAuValue : this.dynamicBidPrices[this.dynamicBidPrices.length - targetAu];
        }

        // How many handles to bring along on the way up -->

        if (targetAu >= this[auMetric][bucketIdx]) {

            // console.log(' ALONE SE >>> targetAu ', targetAu, ' this[auMetric][bucketIdx] ', this[auMetric][bucketIdx]);
            for (let i = bucketIdx; i > 0; i--) {
                const bucketInfo = this[metric][i];
                // if (this[metric][bucketIdx].protections > this[metric][bucketIdx].bookings) {
                if (bucketInfo.fare < targetBp) {
                    // console.log(' ALONE SE >>> targetAu ', targetAu, ' this[auMetric][bucketIdx] ', this[auMetric][bucketIdx], ' direction ', direction);
                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        this.justifyDistributionFromDrag(bucketIdx, targetAu, 'up');
                    }
                    else {
                        bucketInfo.Aus = targetAu;
                        if (this.selectedElement.length > 1) {
                            this.selectedElement.forEach((se: number, i: number) => {
                                if (se !== bucketIdx) {
                                    this.nonDiscreteBuckets[se].Aus = this.dragSelectedNodes(se, 'up');
                                }
                            })
                        }
                    }
                }
            }

        } else {

            // if (this[metric][bucketIdx].protections > this[metric][bucketIdx].bookings) {
            for (let i = bucketIdx; i < this[metric].length; i++) {

                const bucketInfo = this[metric][i];
                if (bucketInfo.fare >= targetBp) {
                    // console.log(' - Along For the ride i ', i, ' bucketIdx ', bucketIdx, ' auMetric][bucketIdx] ', this[auMetric][i]);
                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        this.justifyDistributionFromDrag(bucketIdx, targetAu, 'down');
                    }
                    else {
                        bucketInfo.Aus = targetAu;
                        if (this.selectedElement.length > 1) {
                            this.selectedElement.forEach((se: number, i: number) => {
                                if (se !== bucketIdx) {
                                    this.nonDiscreteBuckets[se].Aus = this.dragSelectedNodes(se, 'down');
                                }
                            })
                        }
                    }
                }
            }
        }
        this.applyDataChanges();
    }


    public justifyDistributionFromDrag(bucketIdx, targetAu, direction) {
        //console.log('justifyDistributionFromDrag ', bucketIdx, ' targetAu ', targetAu, ' direction ', direction)
        if (this.selectedMetric === 1) {
            this.distributeFromInverseFareValues(bucketIdx, targetAu, direction);
            //this.distributeFromExistingAuValues(bucketIdx, targetAu, direction);
        } else if (this.selectedMetric === 2) {
            this.distributeFromLinearScale(bucketIdx, targetAu, direction);

            //this.setExistingAuPercent()
        } else if (this.selectedMetric === 3) {
            this.distributeFromInverseFareValues(bucketIdx, targetAu, direction);
            //this.setExistingAuPercent()
        }
    }


    public distributeFromExistingAus(bucketIdx, targetAu, direction) {
        let val;
        let mult;
        let accum = 0;

        let groupValueAuPercentage = 0;
        //console.log('this.nonDiscreteBuckets[bucketIdx].Aus  ', this.nonDiscreteBuckets[values].Aus, ' targetAu ', targetAu)
        let increment = bucketIdx + 1;

        if (direction === 'up') {
            console.log('  \n')



            for (let i = bucketIdx; i >= 0; i--) {
                //for (let i = 0; i <= bucketIdx; i++) {

                let newTarget = this.maxAuValue - this.nonDiscreteBuckets[bucketIdx].Aus


                //if (this.nonDiscreteBuckets[i].Aus <= this.maxAuValue) {

                // groupValueAuPercentage = this.nonDiscreteBuckets[i].Aus / (newTarget / bucketIdx) / bucketIdx;


                const bucketInfo = this.nonDiscreteBuckets[i];

                groupValueAuPercentage = +(bucketInfo.Aus / (newTarget / bucketIdx) / bucketIdx).toFixed(2);

                console.log('newTarget / bucketIdx ', groupValueAuPercentage)

                bucketInfo.Aus = bucketInfo.Aus > this.maxAuValue ? this.maxAuValue : Math.round(bucketInfo.Aus += groupValueAuPercentage);

                //bucketInfo.Aus = Math.round(bucketInfo.Aus += groupValueAuPercentage);

                console.log('  Au UP  ', bucketIdx, '  ', this.nonDiscreteBuckets[i].letter, ' idx ', i, ' newTarget ', newTarget, ' targetAu ', targetAu, ' GVP', groupValueAuPercentage, ' Aus ', Math.round(this.nonDiscreteBuckets[i].Aus))
            }
            // else {
            //     this.nonDiscreteBuckets[i].Aus = this.maxAuValue;
            // }


            // for (let i = 1; i <= bucketIdx; i++) {
            //     let newTarget = this.maxAuValue - targetAu;
            //     mult = (newTarget / bucketIdx);
            //     const bucketInfo = this.nonDiscreteBuckets[i];
            //     // groupValueAuPercentage = bucketInfo.Aus / (targetAu / increment) / bucketIdx;
            //     groupValueAuPercentage = this.nonDiscreteBuckets[i].Aus / (newTarget / bucketIdx) / increment;
            //     bucketInfo.Aus = bucketInfo.Aus > this.maxAuValue ? this.maxAuValue : Math.round(bucketInfo.Aus += groupValueAuPercentage);
            //     console.log('UP   i ', i, ' letter ', bucketInfo.letter,
            //         //' increment ', increment,
            //         '\n bucketIdx ', bucketIdx,
            //         ' Aus  ', bucketInfo.Aus,
            //         ' newTarget ', newTarget,
            //         ' mult ', mult,
            //         //' prot ', bucketInfo.protections,
            //         '\n groupAu ', groupValueAuPercentage
            //     )
            // }
        } else {
            let increment = bucketIdx + 1;

            let val = this.nonDiscreteBuckets.length - bucketIdx;
            console.log('  \n')

            for (let i = bucketIdx; i < this.nonDiscreteBuckets.length; i++) {

                groupValueAuPercentage = 0;

                const bucketInfo = this.nonDiscreteBuckets[i];

                groupValueAuPercentage = +(bucketInfo.protections / (targetAu / val)).toFixed(2);

                bucketInfo.Aus = bucketInfo.Aus < 0 ? 0 : Math.round(bucketInfo.Aus -= groupValueAuPercentage);

                console.log('DOWN   i ', i, ' letter ', bucketInfo.letter,
                    ' increment ', increment,
                    ' val ', val,
                    ' targetAu ', targetAu,
                    // ' protect ', this.nonDiscreteBuckets[i].protections,
                    ' bucketInfo.Aus ', bucketInfo.Aus,
                    // ' groupValueAuPercentage ', groupValueAuPercentage
                )
            }
        }
    }





    public distributeFromExistingAuValues(bucketIdx, targetAu, direction) {
        let groupValueAuPercentage = 0;
        console.log('  \n\n ')
        if (direction === 'up') {
            console.log('bucketIdx ', bucketIdx)

            for (let i = bucketIdx; i >= 0; i--) {

                if (this.nonDiscreteBuckets[i].Aus < this.maxAuValue) {

                    groupValueAuPercentage = +(this.nonDiscreteBuckets[i].protections * this.auPercentagesValues[i]).toFixed(2);

                    const bucketInfo = this.nonDiscreteBuckets[i];

                    bucketInfo.Aus = Math.round(Math.ceil(bucketInfo.Aus += groupValueAuPercentage));

                    console.log(' -- ', this.nonDiscreteBuckets[i].letter, '.Aus ', groupValueAuPercentage)
                }
                else {
                    this.nonDiscreteBuckets[i].Aus = this.maxAuValue;
                }
                console.log(' UP  -- ', this.nonDiscreteBuckets[i].letter, '.Aus ', this.nonDiscreteBuckets[i].Aus, ' GVP ', groupValueAuPercentage)
            }

        } else {
            let increment = bucketIdx + 1;
            for (let i = bucketIdx; i < this.nonDiscreteBuckets.length; i++) {
                if (this.nonDiscreteBuckets[i].Aus > 0) {
                    groupValueAuPercentage = this.nonDiscreteBuckets[i].Aus / (targetAu / this.auPercentagesValues[i]) / increment;
                    const bucketInfo = this.nonDiscreteBuckets[i];
                    bucketInfo.Aus = bucketInfo.Aus < 0 ? 0 : Math.round(bucketInfo.Aus -= groupValueAuPercentage);
                } else {
                    this.nonDiscreteBuckets[i].Aus = 0;
                }
                console.log(' -- ', this.nonDiscreteBuckets[i].letter, '.Aus ', groupValueAuPercentage)
            }
        }
    }


    public distributeFromInverseFareValues(bucketIdx, targetAu, direction) {
        let groupValueAuPercentage = 0;

        if (direction === 'up') {
            for (let i = bucketIdx; i >= 0; i--) {

                if (this.nonDiscreteBuckets[i].Aus < this.maxAuValue) {
                    groupValueAuPercentage = this.nonDiscreteBuckets[i].Aus / (targetAu / this.inverseFareValues[i].protections) / bucketIdx;
                    const bucketInfo = this.nonDiscreteBuckets[i];
                    bucketInfo.Aus = Math.round(bucketInfo.Aus += groupValueAuPercentage);
                }
                else {
                    this.nonDiscreteBuckets[i].Aus = this.maxAuValue;
                }

            }

        } else {
            let increment = bucketIdx + 1;
            for (let i = bucketIdx; i < this.nonDiscreteBuckets.length; i++) {
                if (this.nonDiscreteBuckets[i].Aus > 0) {
                    groupValueAuPercentage = this.nonDiscreteBuckets[i].Aus / (targetAu / this.inverseFareValues[i].protections) / increment;
                    const bucketInfo = this.nonDiscreteBuckets[i];
                    bucketInfo.Aus = bucketInfo.Aus < 0 ? 0 : Math.round(bucketInfo.Aus -= groupValueAuPercentage);
                } else {
                    this.nonDiscreteBuckets[i].Aus = 0;
                }
            }
        }
    }

    public setExistingAuPercent() {

        this.auPercentagesValues = []
        let total = 0
        this.nonDiscreteBuckets.map((nd, i) => {

            // console.log(' i ', i, ' letter ', this.nonDiscreteBuckets[i].letter, ' protections ', nd.protections, ' %%% ', ((nd.protections / this.maxAuValue)))
            total += nd.protections / this.maxAuValue
            this.auPercentagesValues.push(+(nd.protections / this.maxAuValue).toFixed(2))
        })

        // console.log(' auPercentages ', this.auPercentagesValues, ' total ', total)
    }


    // Builds Inverse Fare % values, called onInit and Booking slider changes
    public generateInverseDetails(): any[] {

        const inverseFareValues = [];
        let remainingSeats = this.nonDiscreteBuckets[0].Aus - this.totalBookingsCollector;
        let percentOfTop = [];
        let inverseDistribution = 0;
        let theTop = this.nonDiscreteBuckets[0].Aus;
        let totalIFV = 0;

        this.nonDiscreteBuckets.map((d: any, i) => {
            percentOfTop.push(+((d.fare / theTop) * 100).toFixed(0));

            inverseDistribution = 1 / (percentOfTop[i] * 100);
            // console.log(' i ', i, ' inverseDistribution ', inverseDistribution)
            totalIFV = totalIFV + inverseDistribution;
            // console.log(' i ', i, ' totalIFV ', totalIFV)
            const remain = (((inverseDistribution / totalIFV)));

            const protections = +(remainingSeats * remain).toFixed(2);
            // console.log(' i ', i, ' remainingSeats ', remainingSeats, ' remain ', remain)
            inverseFareValues.push({ inverseDistribute: inverseDistribution, protections: protections })
        })

        let newArray = [];

        inverseFareValues.forEach((iv, i) => {
            const remain = (((iv.inverseDistribute / totalIFV)));
            //  console.log(' iv ', iv, ' remain ', remain)
            const protections = +(remainingSeats * remain).toFixed(2);
            newArray.push({ protections: protections });
        })

        return newArray;
    }

    public distributeFromLinearScale(values, targetAu, dir) {
        let val;
        let mult;
        let accum = 0;

        if (dir === 'down') {
            val = this.nonDiscreteBuckets.length - values;
            mult = targetAu / val;

            for (let i = (this.nonDiscreteBuckets.length - 1); i >= values; i--) {
                accum += mult;
                this.nonDiscreteBuckets[i].Aus = Math.round(accum);
            }
        } else {

            mult = ((this.maxAuValue - targetAu) / values);

            for (let i = 0; i <= values; i++) {

                if (this.nonDiscreteBuckets[i].Aus <= this.maxAuValue) {

                    this.nonDiscreteBuckets[i].Aus = Math.round(this.maxAuValue - accum);
                    accum += mult;
                }
                else {
                    this.nonDiscreteBuckets[i].Aus > this.maxAuValue ? this.nonDiscreteBuckets[i].Aus = this.nonDiscreteBuckets[i].Aus -= accum : this.maxAuValue;
                }

            }
        }
    }
}