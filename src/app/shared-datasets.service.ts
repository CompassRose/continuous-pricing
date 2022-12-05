
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs'
import { BucketDetails } from './models/dashboard.model';
import { ContinousColors, ColorObject } from './dashboard-constants';

@Injectable({
    providedIn: 'root',
})

export class SharedDatasetService {

    public bucketDetails: BucketDetails[] = [
        // { letter: 'A', fare: 289, protections: 0, Aus: 189, Sa: 189, bookings: 0 },
        // { letter: 'B', fare: 249, protections: 0, Aus: 189, Sa: 189, bookings: 0 },
        // { letter: 'C', fare: 219, protections: 0, Aus: 189, Sa: 189, bookings: 0 },
        { letter: 'D', fare: 194, protections: 0, Aus: 190, Sa: 190, bookings: 0 },
        { letter: 'E', fare: 169, protections: 0, Aus: 185, Sa: 185, bookings: 0 },
        { letter: 'F', fare: 149, protections: 0, Aus: 180, Sa: 180, bookings: 0 },
        { letter: 'G', fare: 129, protections: 0, Aus: 175, Sa: 175, bookings: 0 },
        { letter: 'H', fare: 114, protections: 0, Aus: 170, Sa: 170, bookings: 0 },
        { letter: 'I', fare: 99, protections: 0, Aus: 165, Sa: 165, bookings: 0 },
        { letter: 'J', fare: 86, protections: 0, Aus: 160, Sa: 160, bookings: 0 },
        { letter: 'K', fare: 74, protections: 0, Aus: 150, Sa: 150, bookings: 0 },
        { letter: 'L', fare: 64, protections: 0, Aus: 140, Sa: 140, bookings: 0 },
        { letter: 'M', fare: 54, protections: 0, Aus: 120, Sa: 120, bookings: 0 },
        { letter: 'N', fare: 44, protections: 0, Aus: 100, Sa: 100, bookings: 0 },
        { letter: 'O', fare: 34, protections: 0, Aus: 85, Sa: 85, bookings: 0 },
        { letter: 'P', fare: 29, protections: 0, Aus: 70, Sa: 70, bookings: 0 },
        { letter: 'Q', fare: 24, protections: 0, Aus: 60, Sa: 60, bookings: 0 },
        { letter: 'R', fare: 20, protections: 0, Aus: 50, Sa: 50, bookings: 0 },
        { letter: 'S', fare: 17, protections: 0, Aus: 40, Sa: 40, bookings: 0 },
        { letter: 'T', fare: 15, protections: 0, Aus: 30, Sa: 30, bookings: 0 },

    ];

    public currAus: number[] = [];
    public colorCollections: ColorObject[] = ContinousColors;
    public archivedBucketDetails: BucketDetails[] = [];
    static roundMultiplierDecimals = 4;
    static roundFactor = Math.pow(10, SharedDatasetService.roundMultiplierDecimals);
    public selectedColorRange: ColorObject = this.colorCollections[0];
    public selectedColorRangeBehaviorSubject$ = new BehaviorSubject<ColorObject>(this.colorCollections[0]);
    public bucketDetailsBehaviorSubject$ = new BehaviorSubject<boolean>(true);
    public resetDefaultSubject$ = new Subject<boolean>();
    public influenceInput$ = new BehaviorSubject<[number, string, number]>([null, '', null]);
    public dynamicBidPrices: number[] = [];
    public interpolateBidPriceCurvePoints: any[] = [];
    public totalBookingsCollector: number = 0;
    public totalLoadFactor: string = '';
    public totalProtections: number = 0;
    public maxAuValue: number = 0;
    public selectedMetric = 1;
    public metricSelectedSubject$ = new BehaviorSubject<any>([]);



    public dragGrouping: any = [
        { name: 'Single', id: 0, selected: false, disabled: false },
        { name: 'Existing AU %', id: 1, selected: true, disabled: false },
        { name: 'Linear Protection', id: 2, selected: false, disabled: false },
        { name: 'Inverse Fare %', id: 3, selected: false, disabled: true }
    ];


    constructor() {
        // Save clean copy for resetting to default
        this.archivedBucketDetails = JSON.parse(JSON.stringify(this.bucketDetails));


        this.metricSelectedSubject$.next(this.dragGrouping);

        this.resetDefaultSubject$
            .subscribe(response => {
                this.setGroupingMethod(1);
            });
    }


    public setGroupingMethod(model) {
        console.log('True', model, ' this.selected ', this.selectedMetric)

        this.dragGrouping.map(s => {
            return s.selected = false;
        })
        this.dragGrouping[model].selected = true;
        this.selectedMetric = model;


        console.log('setGroupingMethod model', model, ' dragGrouping ', this.dragGrouping)
    }


    public resetFromArchivedBuckets() {
        this.bucketDetails = JSON.parse(JSON.stringify(this.archivedBucketDetails));
        this.resetDefaultSubject$.next(true)
    }


    public getMaxAu(): number {

        const AuList = this.bucketDetails.map(object => {
            return object.Aus;
        });

        return Math.max(...AuList)
    }


    public applyDataChanges() {
        this.calculateAus();
        this.generateBucketValues();
    }


    // Returns Derived AU breakpoints
    public calculateAus() {
        this.currAus = [];

        this.bucketDetails.forEach((a, i) => {
            if (a.Aus > this.maxAuValue) {
                a.Aus = this.maxAuValue;
            }
            if (a.Aus >= 0) {
                this.currAus.push(Math.round(Math.floor(a.Aus)));
            }
        })
        this.maxAuValue = this.currAus[0];
        //this.currAus = this.calculateBucketBands();
        // console.log('currAus ', this.currAus, ' this.maxAuValue  ', this.maxAuValue)

    }


    public selectColorRange(ev: ColorObject): any {
        const rangeIdx = this.colorCollections.findIndex(r => r.key === ev.key);
        this.selectedColorRangeBehaviorSubject$.next(this.colorCollections[rangeIdx])
    }



    public generateBucketValues() {

        let totalProt = 0;
        this.bucketDetails.forEach((a, i) => {
            this.bucketDetails[i].protections = this.protectionMyLevel(i);
            totalProt += this.bucketDetails[i].protections;
        })

        // console.log('totalProt ', totalProt)
        //this.generateSeatsAvailable()
        this.bucketDetailsBehaviorSubject$.next(true)
    }



    public generateBookingCounts(metric): number {
        let metricTemp = 0;
        for (let i = 0; i < this.bucketDetails.length; i++) {
            metricTemp += Number(this.bucketDetails[i][metric]);
        }
        return metricTemp;
    }




    public generateSeatsAvailable(): number {

        let seatTemp = 0;
        for (let i = 0; i < this.bucketDetails.length; i++) {
            //  console.log('bookings ', this.bucketDetails[i].bookings, ' totalBookingsCollector ', this.totalBookingsCollector)

            if (this.bucketDetails[i + 1]) {
                const tempBooks = this.bucketDetails[i].Sa - this.bucketDetails[i].bookings;
                seatTemp += (tempBooks - this.bucketDetails[i + 1].Sa);
            } else {
                seatTemp += this.bucketDetails[i].Sa
            }
        }
        //console.log('seatTemp ', seatTemp)
        return seatTemp
    }


    // Returns Bucket Seat count for protection
    public protectionMyLevel(idx: number) {
        const nextBucketValue = (idx === (this.currAus.length - 1)) ? 0 : this.currAus[idx + 1];
        const diff = this.currAus[idx] - nextBucketValue;
        //console.log('diff idx ', idx, ' diff ', diff)
        return (diff > 0) ? diff : 0;
    }



    // Returns Bucket Seat count for protection
    public protectionLevel(idx: number) {
        const nextBucketValue = (idx === (this.currAus.length - 1)) ? 0 : this.currAus[idx + 1];
        const diff = this.currAus[idx] - nextBucketValue;
        return (diff > 0) ? diff : 0;
    }



    public calculateBucketBands(): number[] {
        const arr = new Array<number>();
        this.bucketDetails.forEach((d, i) => {
            arr.push(0);
        });

        arr[0] = this.dynamicBidPrices.length;
        this.dynamicBidPrices.forEach((d, i) => {
            const bidPrice = this.dynamicBidPrices[i];
            for (let bucketIdx = 1; bucketIdx < this.bucketDetails.length; bucketIdx++) {
                const bucketInfo = this.bucketDetails[bucketIdx];
                const fareValue = bucketInfo.fare;
                if (fareValue >= bidPrice) {
                    arr[bucketIdx]++;
                }
            }
        });
        //console.log('arr ', arr)
        return arr;
    }




    // From Au bar scale drag up or down
    public calculateBidPriceForAu(currAu: number, bucketIdx: number, targetAu: number) {
        // console.log('this.archivedBucketDetails ', this.archivedBucketDetails)
        // console.log(' totalBookingsCollector ', this.bucketDetails[bucketIdx - 1].letter, ' ', this.bucketDetails[bucketIdx - 1].Aus)
        //console.log('\n\nMAX ', this.maxAuValue, ' currAu ', currAu, ' targetAu ', targetAu)

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
                    //  console.log('\n****  UP bucketIdx ', bucketInfo.letter, ' bucketIdx  ', bucketIdx, ' currAu ', currAu, ' targetAu ', targetAu, ' dragGrouping ', this.dragGrouping[this.selectedMetric].name)

                    bucketInfo.Aus = targetAu;
                    // bucketInfo.Sa = targetAu;

                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        this.justifyAusFromDrag(bucketIdx, targetAu, 'up')
                    }
                }
            }

        } else {

            for (let i = bucketIdx; i < this.bucketDetails.length; i++) {
                const bucketInfo = this.bucketDetails[i];

                if (bucketInfo.fare >= targetBp) {

                    bucketInfo.Aus = targetAu;
                    //  bucketInfo.Sa = targetAu;

                    // console.log('\n***** DOWN bucketIdx ', bucketInfo.letter, ' bucketIdx  ', bucketIdx, ' currAu ', currAu, ' targetAu ', targetAu, ' dragGrouping ', this.dragGrouping[this.selectedMetric].name)
                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        this.justifyAusFromDrag(bucketIdx, targetAu, 'down')
                    }
                }
            }
        }
    }


    public justifyAusFromDrag(bucketIdx, targetAu, direction) {

        // console.log('bucketIdx ', bucketIdx, ' targetAu ', targetAu, ' direction ', direction)

        const groupValueLinearModifier = (targetAu / bucketIdx) / bucketIdx;

        if (direction === 'up') {

            if (this.dragGrouping[this.selectedMetric].id === 1) {

                for (let i = 0; i < bucketIdx; i++) {

                    let groupValueAuPercentage = 0;

                    if (this.bucketDetails[i].Aus < this.maxAuValue) {
                        groupValueAuPercentage = this.bucketDetails[i].Aus / (targetAu / bucketIdx) / bucketIdx;
                        const bucketInfo = this.bucketDetails[i];

                        bucketInfo.Aus = bucketInfo.Aus += groupValueAuPercentage;
                        //bucketInfo.Sa = bucketInfo.Sa += groupValueAuPercentage;
                        // console.log(' Au % ', this.bucketDetails[i].letter, ' idx ', i, ' Modifier ', this.bucketDetails[i].Aus.toFixed(2), ' Math ', (groupValueAuPercentage).toFixed(2))
                    } else {
                        this.bucketDetails[i].Aus = this.maxAuValue;
                        //this.bucketDetails[i].Sa = this.maxAuValue;
                    }

                }

            } else if (this.dragGrouping[this.selectedMetric].id === 2) {


                for (let i = 0; i < bucketIdx; i++) {

                    if (this.bucketDetails[i].Aus < this.maxAuValue) {
                        const bucketInfo = this.bucketDetails[i];
                        bucketInfo.Aus = bucketInfo.Aus += groupValueLinearModifier;
                        //bucketInfo.Sa = bucketInfo.Sa += groupValueLinearModifier;
                        // console.log(' Au % ', this.bucketDetails[i].letter, ' idx ', i, ' Modifier ', this.bucketDetails[i].Aus.toFixed(2), ' Math ', (groupValueLinearModifier).toFixed(2))
                    } else {
                        this.bucketDetails[i].Aus = this.maxAuValue;
                        // this.bucketDetails[i].Sa = this.maxAuValue;
                    }
                    //console.log(' Au % ', this.bucketDetails[i].letter, ' idx ', i, ' Modifier ', this.bucketDetails[i].Aus, ' Math ', (groupValueLinearModifier.toFixed(0)))
                }

            }

        } else {

            if (this.dragGrouping[this.selectedMetric].id === 1) {

                let increment = bucketIdx + 1

                for (let i = increment; i < this.bucketDetails.length; i++) {

                    //console.log('i ', i, 'bucketIdx ', test)
                    let groupValueAuPercentage = 0;

                    if (this.bucketDetails[i].Aus > 1) {

                        groupValueAuPercentage = this.bucketDetails[i].Aus / (targetAu / increment) / increment;

                        const bucketInfo = this.bucketDetails[i];
                        bucketInfo.Aus = bucketInfo.Aus -= groupValueAuPercentage;
                        //bucketInfo.Sa = bucketInfo.Sa -= groupValueAuPercentage;
                        // console.log('   Au % ', this.bucketDetails[i].letter, ' idx ', i, ' Modifier ', groupValueAuPercentage.toFixed(2), ' Aus ', this.currAus[i], ' Aus ', this.bucketDetails[i].Aus.toFixed(2))
                    } else {
                        this.bucketDetails[i].Aus = 1;
                        // this.bucketDetails[i].Sa = 1;
                    }
                }
            } else if (this.dragGrouping[this.selectedMetric].id === 2) {

                for (let i = bucketIdx + 1; i < this.bucketDetails.length; i++) {

                    if (this.bucketDetails[i].Aus > 1) {

                        const bucketInfo = this.bucketDetails[i];
                        bucketInfo.Aus = bucketInfo.Aus -= groupValueLinearModifier;
                        //bucketInfo.Sa = bucketInfo.Sa -= groupValueLinearModifier;
                        // console.log('   Au % ', this.bucketDetails[i].letter, ' idx ', i, ' Modifier ', groupValueLinearModifier.toFixed(0), ' Aus ', this.currAus[i], ' Aus ', this.bucketDetails[i].Aus.toFixed(0))
                    } else {
                        this.bucketDetails[i].Aus = 1;
                        // this.bucketDetails[i].Sa = 1;
                    }
                    //console.log('   Linear ', this.bucketDetails[i].letter, ' idx ', i, ' Modifier ', (groupValueLinearModifier).toFixed(2), '   Aus ', this.bucketDetails[i].Aus.toFixed(0))

                }
            }

        }

        //console.log('*** AUS ', this.generateSeatsAvailable())
    }


}



