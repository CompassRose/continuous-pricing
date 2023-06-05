
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { distinctUntilChanged, tap, filter } from 'rxjs/operators';
import { DragPointDistributionService } from '../services/drag-point-distribution';
import { FlightClientDetails, BarSeries, CabinContinuousFares, InverseFareDetails, BidPriceInfluencers, FlightObject, CompetitiveFareDetails, BucketStructure } from '../models/dashboard.model';
import { ColorManagerService } from './color-manager-service';

@Injectable({
    providedIn: 'root',
})


export class SharedDatasetService {

    public allFlightValues: any[] = []

    //public bucketDetails: BucketDetails[] = [];

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

    public dragPointCalculations: DragPointDistributionService;

    public colorRange: string[] = [];

    public currAus: number[] = [];

    public allAus: number[] = [];

    public updatedClientFlight$ = new BehaviorSubject<FlightClientDetails>(null);

    public apiActiveBucketsSubject$ = new BehaviorSubject<BucketStructure[]>([]);

    //public apiFlightActiveSubject$ = new BehaviorSubject<boolean>(false);

    public buckets: string[] = [];

    public allColors: any[] = [];

    public lastDataIndex = 0;

    public dragDirection: string = '';

    public allNewFlightValues: FlightObject;

    // Activates deselect button
    public pointsOnn$ = new BehaviorSubject<boolean>(false);

    public cabinOptions: CabinContinuousFares[] = [];

    public selectedCabinIndex: number;

    public dragGrouping: any = [
        { name: 'Single', id: 0, active: true, disabled: false },
        { name: 'Existing AU %', id: 1, active: false, disabled: false },
        { name: 'Linear Protection', id: 2, active: false, disabled: false },
        { name: 'Inverse Fare %', id: 3, active: false, disabled: false }
    ];



    public bucketDetailsFromApi: BucketStructure[] = [];

    public discreteBucketsFromApi: BucketStructure[] = [];

    public selectedColorRange = 0;

    public colorRangeSelection$ = new BehaviorSubject<any>({});

    public dynamicChartObject: BarSeries[] = [];

    public competitiveFareValues: CompetitiveFareDetails[];


    constructor(private colorManagerService: ColorManagerService) {

        this.dragPointCalculations = new DragPointDistributionService();

        this.allColors = this.colorManagerService.allColorRanges;

        this.getColorValues(this.allColors[1]);

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
                    console.log('RESET RESET')
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


    public changeCabinSelection(idx: number) {

        this.competitiveFareValues = this.cabinOptions[idx].competitiveFares;
        const bucketArray = [];
        this.discreteBucketsFromApi = [];

        this.cabinOptions[idx].bucketStructure.map((bd, i) => {

            if (bd.letter !== 'G' && !bd.isDiscrete) {
                bucketArray.push(bd);
            }

            if (bd.isDiscrete) {
                this.discreteBucketsFromApi.push(bd)
            }
        })

        console.log('getBucketColors ', bucketArray)
        this.setFlightClient(bucketArray);
    }



    // From Color Dropdown and at app start
    public getColorValues(choice: any): void {
        this.selectedColorRange = choice.id;
        this.colorRange = this.allColors[choice.id].value;
        this.colorRangeSelection$.next(this.allColors[choice.id])
    }


    public setGroupingMethod(idx: number) {

        this.selectedMetric = idx;
        let state = false;
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
    public setFlightClient(buckets): void {

        this.bucketDetailsFromApi = buckets;

        console.log('this.bucketDetailsFromApi ', this.bucketDetailsFromApi);

        this.maxAuValue = this.bucketDetailsFromApi[0].adjustedAu;

        this.inverseFareValues = this.generateInverseDetails();

        setTimeout(() => {
            this.applyDataChanges(1);
            this.apiActiveBucketsSubject$.next(this.bucketDetailsFromApi);
        }, 0);
    }


    //  Reset Default button press -- buctDetails set from here, Subject in Components take care of 
    public resetFromArchivedBuckets(idx: number) {

        const tempCollection = JSON.parse(window.localStorage.getItem('bucketDetailsFromApi'));

        const tempCabinCollection = JSON.parse(window.localStorage.getItem('savedCabinCollection'));

        console.log('this.bucketDetailsFromApi ', tempCollection, ' tempCabinCollection ', tempCabinCollection)

        this.bucketDetailsFromApi = tempCollection;

        this.resetDefaultSubject$.next(true);
    }



    //  Save changes button press
    public saveBucketSet(idx: number) {

        let savedCabinValuesPh;

        if (JSON.parse(window.localStorage.getItem('savedCabinValues'))) {
            savedCabinValuesPh = JSON.parse(window.localStorage.getItem('savedCabinValues'));
        } else {
            savedCabinValuesPh = window.localStorage.setItem('savedCabinCollection', JSON.stringify(JSON.parse(JSON.stringify(this.cabinOptions))));
        }
        console.log('savedCabinValuesPh ', savedCabinValuesPh)

        //tempSavedCollection[idx] = this.bucketDetailsFromApi;

        let concat = [];

        if (this.discreteBucketsFromApi.length) {
            concat = [...this.bucketDetailsFromApi, ...this.discreteBucketsFromApi]
        }

        window.localStorage.setItem('bucketDetailsFromApi', JSON.stringify(JSON.parse(JSON.stringify(concat))));
        //  window.localStorage.setItem('savedBucketCollection', JSON.stringify(JSON.parse(JSON.stringify(tempSavedCollection))));
    }



    public adjustPieceColorForBookingUpdates() {
        // console.log('\n\n***************************\n\n adjustPieceColorForBookingUpdates StARTED ')
        this.dynamicBidPrices = [];
        this.dynamicChartObject = [];

        this.bucketDetailsFromApi.map((pc, i) => {

            // if (!pc.isDiscrete) {

            pc.color = this.colorRange[i];
            const fareHolder = this.adjustPieceColorAndValue(pc);
            this.dynamicChartObject.push(...fareHolder);

            // }
            // console.log(' pc ', pc.letter, ' protections ', pc.protections)
        })
    }

    // // Set up bar colors 
    public adjustPieceColorAndValue(bucket): any[] {

        let tempHolderAry = [];
        let setMyGroupColors = this.setSeatColors(bucket);
        // console.log('letter ', bucket.letter, ' protections ', bucket.protections)

        for (let e = 0; e < bucket.protections; e++) {
            this.dynamicBidPrices.push(bucket.fare);
            const chartObj = {
                value: bucket.fare,
                itemStyle: {
                    color: setMyGroupColors[e]
                }
            }

            tempHolderAry.push(chartObj)
            //console.log('chartObj ', chartObj, ' tempHolderAry ', tempHolderAry.length)
        }
        //console.log('DYN length ', this.dynamicBidPrices.length, ' dynamicChartObject ', tempHolderAry.length)
        return tempHolderAry;
    }


    private setSeatColors(bucket): string[] {
        let returnGroupColors = [];
        for (let b = bucket.protections; b > 0; b--) {
            let returnColor;
            returnColor = bucket.color
            returnGroupColors.push(returnColor)
        }
        return returnGroupColors
    }


    public applyDataChanges(idx: number) {

        if (idx === 1 || idx < this.currAus.length) {
            // console.log(' Not Discrete  applyDataChanges ', idx, ' letter ', this.bucketDetailsFromApi[idx].letter)
            this.generateBucketValues(idx);
        }
    }


    // Generates protections from Aus
    public generateBucketValues(idx: number) {

        this.currAus = [];

        //  && bs.letter !== 'G'
        this.bucketDetailsFromApi.map((bs, i) => {

            let myTest = 0;

            if (!bs.isDiscrete) {
                this.currAus.push(bs.adjustedAu);
                myTest = this.protectionMyLevel(i);
            } else {
                myTest = 0;

            }

            //console.log('idx ', i, ' bs ', bs.letter, 'myTest ', myTest)
            return bs.protections = myTest;
        })

        if (idx < this.currAus.length) {
            //  console.log('idx ', idx, ' this.currAus.length ', this.currAus.length)
            this.adjustPieceColorForBookingUpdates();
        }

        setTimeout(() => {
            this.bucketDetailsBehaviorSubject$.next(true);
        }, 0);
    }



    // Returns Bucket Seat count for protection
    public protectionMyLevel(idx: number): number {
        let diff

        if (idx < this.currAus.length) {
            //  console.log(' Set Protections ', this.bucketDetailsFromApi[idx].letter, '  --idx ', idx, ' length ', this.currAus[idx])

            let tester = 0;
            if (idx === (this.bucketDetailsFromApi.length - 1)) {
                tester = 0;
            } else {
                tester = this.bucketDetailsFromApi[idx + 1].adjustedAu
            }

            //const nextBucketValue = (idx === (this.bucketDetailsFromApi.length - 1)) ? 0 : this.bucketDetailsFromApi[idx + 1].adjustedAu;

            diff = Math.round(this.bucketDetailsFromApi[idx].adjustedAu - tester);


        } else {

            diff = this.bucketDetailsFromApi[idx].adjustedAu;
            // console.log('Active ', this.bucketDetailsFromApi[idx].letter, '  --idx ', idx, ' diff ', diff)
        }

        return (diff > 0) ? diff : 0;
    }


    public showCompetitors() {
        this.showCompetitorsFlag = !this.showCompetitorsFlag;
        this.bucketDetailsFromApi = JSON.parse(window.localStorage.getItem('archivedBuckets'));
        this.resetDefaultSubject$.next(true)
    }



    public resetInverseDetailsFromBookings() {
        this.inverseFareValues = this.generateInverseDetails();
    }


    // Multiple nodes selected
    public dragSelectedNodes(selected, dir: any): number {
        // console.log('dragSelectedNodes ', selected, ' dir ', dir)
        return dir === 'down' ? this.bucketDetailsFromApi[selected].adjustedAu -= 1 : this.bucketDetailsFromApi[selected].adjustedAu += 1;

    }


    // From Au bar scale drag up or down
    public calculateBidPriceForAu(bucketIdx: number, targetAu: number, direction: string) {

        // console.log('\n  PRE targetAu ', targetAu, ' bucketIdx ', bucketIdx, ' length ', this.dynamicBidPrices.length)

        let targetBp: number;

        if (targetAu === 0) {
            targetBp = 0;

        } else {
            targetBp = targetAu > this.dynamicBidPrices.length ? this.maxAuValue : this.dynamicBidPrices[this.dynamicBidPrices.length - targetAu];
        }

        // How many handles to bring along on the way up -->
        // console.log('>===  --------- targetAu ', targetAu, ' auMetric ', this.currAus[bucketIdx], ' targetBp ', targetBp)

        if (targetAu >= this.currAus[bucketIdx]) {

            for (let i = bucketIdx; i > 0; i--) {

                const bucketInfo = this.bucketDetailsFromApi[i];

                if (bucketInfo.adjustedAu <= this.bucketDetailsFromApi[bucketIdx - 1].adjustedAu && bucketInfo.adjustedAu < targetAu) {

                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        this.justifyDistributionFromDrag(bucketIdx, targetAu, 'up');
                    }
                    else {

                        if (this.selectedElement.length > 1) {
                            targetBp = this.bucketDetailsFromApi[this.selectedElement[0] - 1].fare;
                            this.selectedElement.forEach((se: number) => {
                                this.bucketDetailsFromApi[se].adjustedAu = this.dragSelectedNodes(se, 'up');
                            })
                        } else {
                            // console.log('UP  ELSE')
                            if (!bucketInfo.isDiscrete) {
                                //    console.log('UP ELSE ', bucketInfo.letter)
                                bucketInfo.adjustedAu = targetAu;
                            }

                        }
                    }
                }
            }

        } else {
            // console.log('\n DOWN targetAu ', targetAu, ' <<< ', this.currAus[bucketIdx], ' targetBp ', targetBp)

            for (let i = bucketIdx; i < this.bucketDetailsFromApi.length; i++) {

                const bucketInfo = this.bucketDetailsFromApi[i];

                if (bucketInfo.fare >= targetBp && !bucketInfo.isDiscrete) {
                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        this.justifyDistributionFromDrag(bucketIdx, targetAu, 'down');
                    }
                    else {
                        if (this.selectedElement.length > 1) {
                            targetBp = this.bucketDetailsFromApi[this.selectedElement.length - 1].fare;
                            this.selectedElement.forEach((se: number, i: number) => {
                                //     console.log(' Down     Aus ', this.bucketDetailsFromApi[se].adjustedAu, ' FC ', this.bucketDetailsFromApi[se].letter)
                                this.bucketDetailsFromApi[se].adjustedAu = this.dragSelectedNodes(se, 'down');
                            })
                        } else {
                            //      console.log('Down ELSE ', bucketInfo.letter)
                            bucketInfo.adjustedAu = targetAu;
                        }
                    }
                }
            }
        }
        // console.log('\n DOWN targetAu ', targetAu, ' <<< ', this.currAus, ' targetBp ', targetBp)
        this.applyDataChanges(bucketIdx);
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

        let groupValueAuPercentage = 0;

        if (direction === 'up') {
            console.log('  \n')

            for (let i = bucketIdx; i >= 0; i--) {
                //for (let i = 0; i <= bucketIdx; i++) {

                let newTarget = this.maxAuValue - this.bucketDetailsFromApi[bucketIdx].adjustedAu

                //if (this.bucketDetailsFromApi[i].adjustedAu <= this.maxAuValue) {

                // groupValueAuPercentage = this.bucketDetailsFromApi[i].adjustedAu / (newTarget / bucketIdx) / bucketIdx;

                const bucketInfo = this.bucketDetailsFromApi[i];

                groupValueAuPercentage = +(bucketInfo.adjustedAu / (newTarget / bucketIdx) / bucketIdx).toFixed(2);

                console.log('newTarget / bucketIdx ', groupValueAuPercentage)

                bucketInfo.adjustedAu = bucketInfo.adjustedAu > this.maxAuValue ? this.maxAuValue : Math.round(bucketInfo.adjustedAu += groupValueAuPercentage);

                console.log('  Au UP  ', bucketIdx, '  ', this.bucketDetailsFromApi[i].letter, ' idx ', i, ' newTarget ', newTarget, ' targetAu ', targetAu, ' GVP', groupValueAuPercentage, ' Aus ', Math.round(this.bucketDetailsFromApi[i].adjustedAu))
            }
            // else {
            //     this.bucketDetailsFromApi[i].adjustedAu = this.maxAuValue;
            // }


            // for (let i = 1; i <= bucketIdx; i++) {
            //     let newTarget = this.maxAuValue - targetAu;
            //     mult = (newTarget / bucketIdx);
            //     const bucketInfo = this.bucketDetailsFromApi[i];
            //     // groupValueAuPercentage = bucketInfo.Aus / (targetAu / increment) / bucketIdx;
            //     groupValueAuPercentage = this.bucketDetailsFromApi[i].adjustedAu / (newTarget / bucketIdx) / increment;
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

            let val = this.bucketDetailsFromApi.length - bucketIdx;
            console.log('  \n')

            for (let i = bucketIdx; i < this.bucketDetailsFromApi.length; i++) {

                groupValueAuPercentage = 0;

                const bucketInfo = this.bucketDetailsFromApi[i];

                groupValueAuPercentage = +(bucketInfo.protections / (targetAu / val)).toFixed(2);

                bucketInfo.adjustedAu = bucketInfo.adjustedAu < 0 ? 0 : Math.round(bucketInfo.adjustedAu -= groupValueAuPercentage);

                // console.log('DOWN   i ', i, ' letter ', bucketInfo.letter,
                //     ' increment ', increment,
                //     ' val ', val,
                //     ' targetAu ', targetAu,
                //     // ' protect ', this.bucketDetailsFromApi[i].protections,
                //     ' bucketInfo.Aus ', bucketInfo.adjustedAu,
                //     // ' groupValueAuPercentage ', groupValueAuPercentage
                // )
            }
        }
    }





    public distributeFromExistingAuValues(bucketIdx, targetAu, direction) {
        let groupValueAuPercentage = 0;
        console.log('  \n\n ')
        if (direction === 'up') {
            console.log('bucketIdx ', bucketIdx)

            for (let i = bucketIdx; i >= 0; i--) {

                if (this.bucketDetailsFromApi[i].adjustedAu < this.maxAuValue) {

                    groupValueAuPercentage = +(this.bucketDetailsFromApi[i].protections * this.auPercentagesValues[i]).toFixed(2);

                    const bucketInfo = this.bucketDetailsFromApi[i];

                    bucketInfo.adjustedAu = Math.round(Math.ceil(bucketInfo.adjustedAu += groupValueAuPercentage));

                    console.log(' -- ', this.bucketDetailsFromApi[i].letter, '.Aus ', groupValueAuPercentage)
                }
                else {
                    this.bucketDetailsFromApi[i].adjustedAu = this.maxAuValue;
                }
                console.log(' UP  -- ', this.bucketDetailsFromApi[i].letter, '.Aus ', this.bucketDetailsFromApi[i].adjustedAu, ' GVP ', groupValueAuPercentage)
            }

        } else {
            let increment = bucketIdx + 1;
            for (let i = bucketIdx; i < this.bucketDetailsFromApi.length; i++) {
                if (this.bucketDetailsFromApi[i].adjustedAu > 0) {
                    groupValueAuPercentage = this.bucketDetailsFromApi[i].adjustedAu / (targetAu / this.auPercentagesValues[i]) / increment;
                    const bucketInfo = this.bucketDetailsFromApi[i];
                    bucketInfo.adjustedAu = bucketInfo.adjustedAu < 0 ? 0 : Math.round(bucketInfo.adjustedAu -= groupValueAuPercentage);
                } else {
                    this.bucketDetailsFromApi[i].adjustedAu = 0;
                }
                console.log(' -- ', this.bucketDetailsFromApi[i].letter, '.Aus ', groupValueAuPercentage)
            }
        }
    }


    public distributeFromInverseFareValues(bucketIdx, targetAu, direction) {
        let groupValueAuPercentage = 0;

        if (direction === 'up') {
            for (let i = bucketIdx; i >= 0; i--) {

                if (this.bucketDetailsFromApi[i].adjustedAu < this.maxAuValue) {
                    groupValueAuPercentage = this.bucketDetailsFromApi[i].adjustedAu / (targetAu / this.inverseFareValues[i].protections) / bucketIdx;
                    const bucketInfo = this.bucketDetailsFromApi[i];
                    bucketInfo.adjustedAu = Math.round(bucketInfo.adjustedAu += groupValueAuPercentage);
                }
                else {
                    this.bucketDetailsFromApi[i].adjustedAu = this.maxAuValue;
                }

            }

        } else {
            let increment = bucketIdx + 1;
            for (let i = bucketIdx; i < this.bucketDetailsFromApi.length; i++) {
                if (this.bucketDetailsFromApi[i].adjustedAu > 0) {
                    groupValueAuPercentage = this.bucketDetailsFromApi[i].adjustedAu / (targetAu / this.inverseFareValues[i].protections) / increment;
                    const bucketInfo = this.bucketDetailsFromApi[i];
                    bucketInfo.adjustedAu = bucketInfo.adjustedAu < 0 ? 0 : Math.round(bucketInfo.adjustedAu -= groupValueAuPercentage);
                } else {
                    this.bucketDetailsFromApi[i].adjustedAu = 0;
                }
            }
        }
    }

    public setExistingAuPercent() {

        this.auPercentagesValues = []
        let total = 0
        this.bucketDetailsFromApi.map((nd, i) => {

            // console.log(' i ', i, ' letter ', this.bucketDetailsFromApi[i].letter, ' protections ', nd.protections, ' %%% ', ((nd.protections / this.maxAuValue)))
            total += nd.protections / this.maxAuValue
            this.auPercentagesValues.push(+(nd.protections / this.maxAuValue).toFixed(2))
        })

        // console.log(' auPercentages ', this.auPercentagesValues, ' total ', total)
    }


    // Builds Inverse Fare % values, called onInit and Booking slider changes
    public generateInverseDetails(): any[] {

        const inverseFareValues = [];
        let remainingSeats = this.bucketDetailsFromApi[0].adjustedAu - this.totalBookingsCollector;
        let percentOfTop = [];
        let inverseDistribution = 0;
        let theTop = this.bucketDetailsFromApi[0].adjustedAu;
        let totalIFV = 0;

        this.bucketDetailsFromApi.map((d: any, i) => {
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
            val = this.bucketDetailsFromApi.length - values;
            mult = targetAu / val;

            for (let i = (this.bucketDetailsFromApi.length - 1); i >= values; i--) {
                accum += mult;
                this.bucketDetailsFromApi[i].adjustedAu = Math.round(accum);
            }
        } else {

            mult = ((this.maxAuValue - targetAu) / values);

            for (let i = 0; i <= values; i++) {

                if (this.bucketDetailsFromApi[i].adjustedAu <= this.maxAuValue) {

                    this.bucketDetailsFromApi[i].adjustedAu = Math.round(this.maxAuValue - accum);
                    accum += mult;
                }
                else {
                    this.bucketDetailsFromApi[i].adjustedAu > this.maxAuValue ? this.bucketDetailsFromApi[i].adjustedAu = this.bucketDetailsFromApi[i].adjustedAu -= accum : this.maxAuValue;
                }

            }
        }
    }
}