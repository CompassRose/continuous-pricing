
import { Injectable, Inject } from '@angular/core';
import { BucketDetails, InverseFareDetails } from '../models/dashboard.model';
import { Observable, BehaviorSubject, Subject, of } from 'rxjs';
import { debounceTime, pairwise, map } from 'rxjs/operators';
import { distinctUntilChanged, tap, filter, scan } from 'rxjs/operators';
import { DragPointDistributionService } from '../services/drag-point-distribution';

import { BidPriceAspNetService } from '../api/au-visualization.service';

import { FlightClientDetails, ApiBucketDetails, BidPriceInfluencers } from '../models/dashboard.model';
import { ColorManagerService } from './color-manager-service';

@Injectable({
    providedIn: 'root',
})


export class SharedDatasetService {

    public mockFlightValues: any[] = [

        {
            airlineCode: "DE",
            arrivalDateTime: 'Thu Sep 22 2023',
            capacity: 314,
            departureDateTime: 'Thu Sep 22 2023',
            destination: "MAD",
            fullDestination: "Madrid",
            equipment: "332",
            flightNumber: 3317,
            lid: 314,
            masterKey: 1352309,
            origin: "ORL",
            fullOrigin: "Chicago",
        },

        {
            airlineCode: "DE",
            arrivalDateTime: 'Thu Sep 23 2023',
            capacity: 314,
            departureDateTime: 'Thu Sep 23 2023',
            destination: "MAD",
            fullDestination: "Madrid",
            equipment: "332",
            flightNumber: 3209,
            lid: 314,
            masterKey: 1294409,
            origin: "SEA",
            fullOrigin: "Sea-Tac",
        },
        {
            airlineCode: "DE",
            arrivalDateTime: 'Thu Sep 26 2023',
            capacity: 320,
            departureDateTime: 'Thu Sep 26 2023',
            destination: "LAX",
            fullDestination: "Los Angeles",
            equipment: "332",
            flightNumber: 4408,
            lid: 314,
            masterKey: 1293968,
            origin: "JFK",
            fullOrigin: "New York",
        }
    ]


    public bucketDetails: BucketDetails[] = [];

    public storedAus: number[][] = []

    static roundMultiplierDecimals = 4;

    static roundFactor = Math.pow(10, SharedDatasetService.roundMultiplierDecimals);

    public bucketDetailsConcatBehaviorSubject$ = new Subject<BucketDetails[]>();

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
    public adjustedCurvePoints: number[] = [];

    public competitorsCurvePoints: any[][] = [];

    public activeCurve: number[] = [];

    public metricGroupSubject$ = new BehaviorSubject<any>([]);

    public inverseFareValues: InverseFareDetails[] = [];

    public showCompetitorsFlag = false;

    public apiFlightClientSubject$ = new BehaviorSubject<FlightClientDetails>(null);

    public apiFlightActiveSubject$ = new BehaviorSubject<boolean>(false);

    public multiSelectedNodeSubject$ = new BehaviorSubject<number[]>([]);

    public updatedClientFlight$ = new BehaviorSubject<any>(null);

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

    // Simple string array for less overhead
    public buckets: string[] = [];

    public allBuckets: string[] = [];

    // Activates deselect button
    readonly pointsOnn$ = new BehaviorSubject<boolean>(false);

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


    constructor(private colorManagerService: ColorManagerService) {

        this.dragPointCalculations = new DragPointDistributionService();


        this.bucketDetailsConcatBehaviorSubject$
            .subscribe(buckets => {
                if (buckets.length) {
                    //console.log('|||||||||||||||||||||||||||||||||||||  bucketDetailsConcatBehaviorSubject$ buckets ', buckets)
                    this.nonDiscreteBuckets = buckets;
                    this.applyDataChanges();
                }
            })


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
                    this.maxAuValue = this.getMaxAu();
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



    public getColorValues(): string[] {
        return this.colorManagerService.genColors(this.nonDiscreteBuckets.length);
    }



    // Removes Discrete buckets for AU Visualization Chart
    public setConcatedBucketDetails() {

        this.nonDiscreteBuckets = [];
        this.buckets = [];

        this.bucketDetails.forEach((d, i) => {
            this.allBuckets.push(d.letter)
            if (!d.discrete) {
                this.buckets.push(d.letter)
                this.nonDiscreteBuckets.push(d)
            }
        })

        this.colorRange = this.getColorValues();
        this.bucketDetailsConcatBehaviorSubject$.next(this.nonDiscreteBuckets)
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
        // console.log('*************************************************************  setFlightClient ');
        // console.log(' tempSavedCollection ', tempSavedCollection)

        this.bucketDetails = tempSavedCollection[idx];

        this.setConcatedBucketDetails();
        this.inverseFareValues = this.generateInverseDetails();
        this.apiFlightActiveSubject$.next(true);

    }


    //  Reset Default button press -- buctDetails set from here, Subject in Components take care of 
    public resetFromArchivedBuckets(idx: number) {
        const tempCollection = JSON.parse(window.localStorage.getItem('archivedBucketCollection'));
        this.bucketDetails = tempCollection[idx];
        this.setConcatedBucketDetails();
        this.resetDefaultSubject$.next(true);
    }


    //  Save changes button press
    public saveBucketSet(idx: number) {
        const tempSavedCollection = JSON.parse(window.localStorage.getItem('savedBucketCollection'));
        tempSavedCollection[idx] = this.bucketDetails;
        window.localStorage.setItem('savedBucketCollection', JSON.stringify(JSON.parse(JSON.stringify(tempSavedCollection))));
    }


    public getMaxAu(): number {
        return this.bucketDetails[0].Aus
    }



    public applyDataChanges() {
        this.calculateAus();
    }



    // Returns Derived AU breakpoints
    public calculateAus() {
        //console.log('calculateAus ', this.nonDiscreteBuckets.length)
        if (this.nonDiscreteBuckets.length) {
            this.generateBucketValues();
        }
    }

    // Generates protections from Aus
    public generateBucketValues() {

        this.nonDiscreteBuckets.map((a, i) => {
            return a.protections = this.protectionMyLevel(i);
        })
        // console.log('\n\n\n\n nonDiscreteBuckets. ', this.nonDiscreteBuckets)
        this.bucketDetailsBehaviorSubject$.next(true);
    }


    // Returns Bucket Seat count for protection
    public protectionMyLevel(idx: number): number {

        const nextBucketValue = (idx === (this.nonDiscreteBuckets.length - 1)) ? 0 : this.nonDiscreteBuckets[idx + 1].Aus;
        // console.log('nextBucketValue. ', nextBucketValue)
        const diff = this.nonDiscreteBuckets[idx].Aus - nextBucketValue;
        // console.log('diff   ', diff)
        return (diff > 0) ? diff : 0;
    }




    // Returns Bucket Seat count for protection
    private protectionMyLevelPriorToUse(idx: number, i: number): number {
        const nextBucketValue = (idx === (this.storedAus[i].length - 1)) ? 0 : this.storedAus[i][idx + 1];
        const diff = this.storedAus[i][idx] - nextBucketValue;
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
        console.log('generateInverseDetails Length ', this.nonDiscreteBuckets.length, ' remainingSeats ', remainingSeats)
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

        // console.log('\n\n ^^^^ currAu ', currAu, ' targetAu ', targetAu, ' targetBp ', targetBp, '\n\n')

        //  console.log('calculateBidPriceForAu bucketIdx ', bucketIdx, ' Letter ', this.nonDiscreteBuckets[bucketIdx].letter, ' bucketIdx ', ' targetAu ', targetAu, ' targetBp ', targetBp)

        // How many handles to bring along on the way up -->

        if (targetAu >= currAu) {

            //  console.log('**************************\n\n\n Up: targetAu ', targetAu, ' targetBp ', targetBp)

            for (let i = bucketIdx; i >= 0; i--) {

                const bucketInfo = this.nonDiscreteBuckets[i];

                if (bucketInfo.fare < targetBp) {

                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        //console.log('UP: bucketInfo bucketIdx ', bucketIdx)
                        //bucketInfo.Aus = targetAu;
                        this.justifyDistributionFromDrag(bucketIdx, targetAu, 'up')


                    } else if (this.selectedElement.length > 0) {
                        // console.log('\n\n Up: dragSelectedNodes ',)

                        this.dragPointCalculations.dragSelectedNodes(this.selectedElement, this.nonDiscreteBuckets, 'up', targetAu)
                    }
                    else {
                        // console.log('Up: (((((((((((((((((((((((((( ELSE  ', bucketInfo.letter, ' Target Au ', targetAu)
                        bucketInfo.Aus = targetAu;
                    }
                }
            }
        } else {
            //   console.log('**************************\n\n\n Down: targetAu ', targetAu, ' targetBp ', targetBp)
            for (let i = bucketIdx; i < this.nonDiscreteBuckets.length; i++) {


                const bucketInfo = this.nonDiscreteBuckets[i];
                // console.log('**************************\n\n\n Down: dragSelectedNodes ', bucketInfo.fare, ' targetBp ', targetBp)
                if (bucketInfo.fare >= targetBp) {
                    //  console.log('D: bucketInfo ', bucketInfo, '  selectedElement ', this.selectedElement, ' dragGrouping ', this.dragGrouping[this.selectedMetric])
                    //console.log('Down currAu ', currAu, '\ntargetAu ', targetAu, '\nletter ', this.nonDiscreteBuckets[bucketIdx].letter, '\nAus ', this.nonDiscreteBuckets[bucketIdx].Aus)

                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        this.justifyDistributionFromDrag(bucketIdx, targetAu, 'down')
                        //  console.log('Down ,etric 2,3,4')
                    } else if (this.selectedElement.length > 0) {
                        //bucketInfo.Aus = targetAu;
                        this.dragPointCalculations.dragSelectedNodes(this.selectedElement, this.nonDiscreteBuckets, 'down', targetAu)
                    }
                    else {
                        //bucketInfo.Aus -= 1;

                        ////Old Pattern
                        bucketInfo.Aus = targetAu;
                    }
                }
            }
        }
    }


    public justifyDistributionFromDrag(bucketIdx, targetAu, direction) {


        if (this.selectedMetric === 1) {
            this.distributeFromExistingAus(bucketIdx, targetAu, direction)
        } else if (this.selectedMetric === 2) {
            //console.log('direction ', direction, ' idx ', bucketIdx, ' letter ', this.nonDiscreteBuckets[bucketIdx].letter, '  targetAu ', targetAu, ' Au ', this.nonDiscreteBuckets[bucketIdx].Aus, ' selectedMetric ', this.selectedMetric)
            this.distributeFromLinearScale(bucketIdx, targetAu, direction);
        } else if (this.selectedMetric === 3) {
            this.distributeFromInverseFareValues(bucketIdx, targetAu, direction)
        }

    }


    public distributeFromExistingAus(bucketIdx, targetAu, direction) {

        if (direction === 'up') {
            for (let i = bucketIdx; i >= 0; i--) {

                let groupValueAuPercentage = 0;

                if (this.nonDiscreteBuckets[i].Aus < this.maxAuValue) {
                    groupValueAuPercentage = this.nonDiscreteBuckets[bucketIdx].Aus / (targetAu / bucketIdx) / bucketIdx;

                    const bucketInfo = this.nonDiscreteBuckets[i];
                    bucketInfo.Aus += groupValueAuPercentage;
                    console.log('Up ', bucketIdx, ' bucketInfo.Aus  ', bucketInfo.Aus, ' letter ', bucketInfo.letter, ' groupValueAuPercentage ', groupValueAuPercentage)
                    //  console.log('   Au % ', this.nonDiscreteBuckets[i].letter, ' idx ', i, ' Modifier ', groupValueAuPercentage.toFixed(2), ' Aus ', this.nonDiscreteBuckets[i].Aus.toFixed(2))
                }
                else {
                    this.nonDiscreteBuckets[i].Aus = this.maxAuValue;
                }
            }
        } else {
            for (let i = bucketIdx; i < this.nonDiscreteBuckets.length; i++) {
                let groupValueAuPercentage = 0;
                if (this.nonDiscreteBuckets[i].Aus >= 0) {
                    groupValueAuPercentage = this.nonDiscreteBuckets[i].Aus / (targetAu / bucketIdx) / bucketIdx;

                    const bucketInfo = this.nonDiscreteBuckets[i];
                    bucketInfo.Aus -= groupValueAuPercentage;
                    console.log('Down ', bucketIdx, ' bucketInfo  ', bucketInfo.Aus, ' letter ', bucketInfo.letter, ' groupValueAuPercentage ', groupValueAuPercentage)
                    // console.log('   Au % ', this.nonDiscreteBuckets[i].letter, ' idx ', i, ' Modifier ', groupValueAuPercentage.toFixed(2), ' Aus ', this.nonDiscreteBuckets[i].Aus.toFixed(2))
                } else {
                    this.nonDiscreteBuckets[i].Aus = 0;
                }
            }

        }
    }




    public distributeFromLinearScale(bucketIndex, targetAu, dir) {

        console.log('\n\n\n gdistributeFromLinearScale ', this.nonDiscreteBuckets[bucketIndex].letter, '\nAus ', this.nonDiscreteBuckets[bucketIndex].Aus, '\ndirection ', dir, '\nvalues ', bucketIndex, '\ntargetAu ', targetAu, '\n\n')

        let val;
        let mult;
        let accum = 0;

        if (dir === 'down') {

            val = this.nonDiscreteBuckets.length - bucketIndex;
            console.log('Dowm val ', val)
            mult = targetAu / val;

            for (let i = (this.nonDiscreteBuckets.length - 1); i >= bucketIndex; i--) {
                console.log('Dowm ', i, ' letter ', this.nonDiscreteBuckets[i].letter, ' Aus ', this.nonDiscreteBuckets[i].Aus, ' ----  ', accum)
                accum += mult
                this.nonDiscreteBuckets[i].Aus = accum;
            }

        } else {

            val = this.nonDiscreteBuckets.length - bucketIndex;

            accum = 0;

            mult = ((this.maxAuValue - targetAu) / (bucketIndex + 1));

            let step = Math.round(Math.ceil(mult / bucketIndex));

            console.log('bucketIndex ', bucketIndex, ' mult ', mult, ' step ', step)

            for (let i = 0; i <= bucketIndex; i++) {

                if (this.nonDiscreteBuckets[i].Aus < this.maxAuValue) {
                    this.nonDiscreteBuckets[i].Aus = (this.maxAuValue - accum);
                    console.log('i ', i, ' letter ', this.nonDiscreteBuckets[i].letter, ' Aus ', this.nonDiscreteBuckets[i].Aus, ' ----  ', accum, ' targetAu ', targetAu)
                } else {
                    this.nonDiscreteBuckets[i].Aus > this.maxAuValue ? this.nonDiscreteBuckets[i].Aus = this.nonDiscreteBuckets[i].Aus -= accum : this.maxAuValue;
                }

                accum += mult;
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