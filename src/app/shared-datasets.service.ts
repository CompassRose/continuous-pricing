
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs'
import { BucketDetails, InverseFareDetails } from './models/dashboard.model';
import { ContinousColors, ColorObject } from './dashboard-constants';

@Injectable({
    providedIn: 'root',
})

export class SharedDatasetService {

    public bucketDetails: BucketDetails[] = [
        // { letter: 'A', fare: 289, protections: 0, Aus: 189, Sa: 189, bookings: 0 },
        // { letter: 'B', fare: 249, protections: 0, Aus: 189, Sa: 189, bookings: 0 },
        // { letter: 'C', fare: 219, protections: 0, Aus: 189, Sa: 189, bookings: 0 },
        { letter: 'D', fare: 194, protections: 0, Aus: 190, bookings: 0 },
        { letter: 'E', fare: 169, protections: 0, Aus: 185, bookings: 0 },
        { letter: 'F', fare: 149, protections: 0, Aus: 180, bookings: 0 },
        { letter: 'G', fare: 129, protections: 0, Aus: 175, bookings: 0 },
        { letter: 'H', fare: 114, protections: 0, Aus: 170, bookings: 0 },
        { letter: 'I', fare: 99, protections: 0, Aus: 165, bookings: 0 },
        { letter: 'J', fare: 86, protections: 0, Aus: 160, bookings: 0 },
        { letter: 'K', fare: 74, protections: 0, Aus: 150, bookings: 0 },
        { letter: 'L', fare: 64, protections: 0, Aus: 140, bookings: 0 },
        { letter: 'M', fare: 54, protections: 0, Aus: 120, bookings: 0 },
        { letter: 'N', fare: 44, protections: 0, Aus: 100, bookings: 0 },
        { letter: 'O', fare: 34, protections: 0, Aus: 85, bookings: 0 },
        { letter: 'P', fare: 29, protections: 0, Aus: 70, bookings: 0 },
        { letter: 'Q', fare: 24, protections: 0, Aus: 60, bookings: 0 },
        { letter: 'R', fare: 20, protections: 0, Aus: 50, bookings: 0 },
        { letter: 'S', fare: 17, protections: 0, Aus: 30, bookings: 0 },
        { letter: 'T', fare: 14, protections: 0, Aus: 20, bookings: 0 },
        { letter: 'U', fare: 10, protections: 0, Aus: 10, bookings: 0 },

    ];

    public currAus: number[] = [];
    public colorCollections: ColorObject[] = ContinousColors;


    static roundMultiplierDecimals = 4;
    static roundFactor = Math.pow(10, SharedDatasetService.roundMultiplierDecimals);

    public bucketDetailsBehaviorSubject$ = new BehaviorSubject<boolean>(true);
    public resetDefaultSubject$ = new Subject<boolean>();
    public influenceInput$ = new BehaviorSubject<[number, string, number]>([null, '', null]);




    public totalBookingsCollector: number = 0;
    public maxAuValue: number = 0;
    public selectedMetric = 0;

    // Stepped(Fixed) BidPrices
    public dynamicBidPrices: number[] = [];
    // Interpolated Prices
    public interpolateBidPriceCurvePoints: any[] = [];

    public adjustedCurvePoints: any[] = [];
    public activeCurve: number[] = [];

    public metricGroupSubject$ = new BehaviorSubject<any>([]);

    public inverseFareValues: InverseFareDetails[] = [];


    public dragGrouping: any = [
        { name: 'Single', id: 0, selected: true, disabled: false },
        { name: 'Existing AU %', id: 1, selected: false, disabled: false },
        { name: 'Linear Protection', id: 2, selected: false, disabled: false },
        { name: 'Inverse Fare %', id: 3, selected: false, disabled: true }
    ];




    constructor() {

        this.metricGroupSubject$.next(this.dragGrouping);

        this.resetDefaultSubject$
            .subscribe(response => {
                this.totalBookingsCollector = 0;
                this.maxAuValue = this.getMaxAu();
                this.selectedMetric = 0;
                this.setGroupingMethod(0);
                this.metricGroupSubject$.next(this.dragGrouping);
            });

        this.generateInverseFareValues()

    }


    public generateInverseFareValues() {

        let percentOfTop = [];
        let inverseDistribution = 0;
        let inverseDistSum = 0;
        let theTop = this.bucketDetails[0].fare;


        this.bucketDetails.map((d: any, i) => {
            percentOfTop.push(+((d.fare / theTop) * 100).toFixed(0));
            inverseDistribution = +(1 / percentOfTop[i] * 100).toFixed(3);
            inverseDistSum = inverseDistSum + inverseDistribution
            this.inverseFareValues.push({ percentOfTop: percentOfTop[i], inverseDistribute: inverseDistribution, remaining: 0 })
        })

        let newArray = [];
        this.inverseFareValues.forEach((iv, i) => {
            const remain = +((iv.inverseDistribute / inverseDistribution) * 10).toFixed(1);
            newArray.push({ percentOfTop: iv.percentOfTop, inverseDistribute: iv.inverseDistribute, remaining: remain });
            // console.log(' ::: ', newArray[i])
        })
        this.inverseFareValues = newArray;
    }




    public setGroupingMethod(model) {
        //console.log('True', model, ' this.selected ', this.selectedMetric)

        this.dragGrouping.map(s => {
            return s.selected = false;
        })
        this.dragGrouping[model].selected = true;
        this.selectedMetric = model;

        //console.log('setGroupingMethod model', model, ' dragGrouping ', this.dragGrouping)
    }


    public resetFromArchivedBuckets() {
        this.bucketDetails = JSON.parse(window.localStorage.getItem('archivedBuckets'));
        // console.log('resetFromArchivedBuckets  bucketDetails  ', this.bucketDetails)
        this.resetDefaultSubject$.next(true)
    }



    public getMaxAu(): number {
        const AuList = this.bucketDetails.map(object => {
            return object.Aus;
        });

        return Math.max(...AuList)
    }


    public applyDataChanges() {
        this.currAus = [];
        this.calculateAus();
    }


    // Returns Derived AU breakpoints
    public calculateAus() {
        //console.log('calculateAus bucketDetails ', this.bucketDetails)
        this.bucketDetails.forEach((a, i) => {
            //console.log('a ', a.protections)
            if (a.Aus > this.maxAuValue) {
                a.Aus = this.maxAuValue;
            }
            if (a.Aus >= 0) {
                this.currAus.push(Math.round(Math.floor(a.Aus)));
            }
        })
        this.maxAuValue = this.currAus[0];
        this.generateBucketValues();
    }



    public generateBucketValues() {

        this.bucketDetails.map((a, i) => {
            return a.protections = this.protectionMyLevel(i);
        })
        this.bucketDetailsBehaviorSubject$.next(true);
    }



    // Returns Bucket Seat count for protection
    public protectionMyLevel(idx: number) {
        const nextBucketValue = (idx === (this.currAus.length - 1)) ? 0 : this.currAus[idx + 1];
        const diff = this.currAus[idx] - nextBucketValue;
        return (diff > 0) ? diff : 0;
    }




    // From Au bar scale drag up or down
    public calculateBidPriceForAu(currAu: number, bucketIdx: number, targetAu: number) {

        let targetBp: number;
        if (targetAu === 0) {
            targetBp = 0;
        } else {
            targetBp = targetAu >= this.dynamicBidPrices.length ? this.dynamicBidPrices[0] : this.dynamicBidPrices[this.dynamicBidPrices.length - targetAu];
        }

        // How many handles to bring along on the way up -->

        if (targetAu >= currAu) {
            for (let i = bucketIdx; i >= 0; i--) {
                const bucketInfo = this.bucketDetails[i];
                if (bucketInfo.fare < targetBp) {
                    //console.log('UP currAu ', currAu, ' targetAu ', targetAu, ' letter ', this.bucketDetails[bucketIdx].letter, ' Aus ', this.bucketDetails[bucketIdx].Aus)
                    bucketInfo.Aus = targetAu;
                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        this.justifyDistributionFromDrag(bucketIdx, targetAu, 'up')
                    }
                }
            }
        } else {
            for (let i = bucketIdx; i < this.bucketDetails.length; i++) {
                const bucketInfo = this.bucketDetails[i];

                if (bucketInfo.fare >= targetBp) {

                    bucketInfo.Aus = targetAu;
                    //console.log('Down currAu ', currAu, ' targetAu ', targetAu, ' letter ', this.bucketDetails[bucketIdx].letter, ' Aus ', this.bucketDetails[bucketIdx].Aus)
                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        this.justifyDistributionFromDrag(bucketIdx, targetAu, 'down')
                    }
                }
            }
        }
    }



    public justifyDistributionFromDrag(bucketIdx, targetAu, direction) {
        if (direction === 'up') {
            //console.log('       UP    targetAu ', targetAu, ' letter ', this.bucketDetails[bucketIdx].letter, ' Aus ', this.bucketDetails[bucketIdx].Aus)
            if (this.dragGrouping[this.selectedMetric].id === 1) {
                for (let i = 0; i < bucketIdx; i++) {
                    let groupValueAuPercentage = 0;
                    if (this.bucketDetails[i].Aus < this.maxAuValue) {
                        groupValueAuPercentage = this.bucketDetails[i].Aus / (targetAu / bucketIdx) / bucketIdx;
                        const bucketInfo = this.bucketDetails[i];
                        bucketInfo.Aus = bucketInfo.Aus += groupValueAuPercentage;
                        //console.log(' Au % ', this.bucketDetails[i].letter, ' idx ', i, ' Modifier ', this.bucketDetails[i].Aus.toFixed(2), ' Math ', (groupValueAuPercentage).toFixed(2))
                    } else {
                        this.bucketDetails[i].Aus = this.maxAuValue;
                    }
                }
            } else if (this.dragGrouping[this.selectedMetric].id === 2) {
                this.updateDragPositionForLinearScale(bucketIdx, targetAu, 'up')
            }

        } else {
            //console.log('       Down   targetAu ', targetAu, ' letter ', this.bucketDetails[bucketIdx].letter, ' Aus ', this.bucketDetails[bucketIdx].Aus)
            if (this.dragGrouping[this.selectedMetric].id === 1) {
                let increment = bucketIdx + 1
                for (let i = increment; i < this.bucketDetails.length; i++) {
                    let groupValueAuPercentage = 0;
                    if (this.bucketDetails[i].Aus > 0) {
                        groupValueAuPercentage = this.bucketDetails[i].Aus / (targetAu / increment) / increment;
                        const bucketInfo = this.bucketDetails[i];
                        bucketInfo.Aus = bucketInfo.Aus -= groupValueAuPercentage;
                        //console.log('   Au % ', this.bucketDetails[i].letter, ' idx ', i, ' Modifier ', groupValueAuPercentage.toFixed(2), ' Aus ', this.bucketDetails[i].Aus.toFixed(2))
                    } else {
                        this.bucketDetails[i].Aus = 0;
                    }
                }
            }
            else if (this.dragGrouping[this.selectedMetric].id === 2) {
                this.updateDragPositionForLinearScale(bucketIdx, targetAu, 'down')
            }
        }
    }


    // From Linear Protection
    public updateDragPositionForLinearScale(values, targetAu, dir) {
        let val;
        let mult;
        let accum = 0;

        if (dir === 'down') {
            val = this.bucketDetails.length - values;
            mult = targetAu / val;
            for (let i = (this.bucketDetails.length - 1); i >= values; i--) {
                accum += mult
                this.bucketDetails[i].Aus = accum;
            }

        } else {
            //val = values;
            mult = ((this.maxAuValue - targetAu) / values);
            for (let i = 0; i < values; i++) {

                if (this.bucketDetails[i].Aus < this.maxAuValue) {
                    this.bucketDetails[i].Aus = (this.maxAuValue - accum);
                } else {
                    this.bucketDetails[i].Aus > this.maxAuValue ? this.bucketDetails[i].Aus = this.bucketDetails[i].Aus -= accum : this.maxAuValue;
                }
                accum += mult;
                //console.log('accum ', accum)
            }
        }
    }
}



