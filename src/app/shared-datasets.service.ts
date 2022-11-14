
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'
import { BucketDetails } from './models/dashboard.model';
import { ContinousColors, ColorObject } from './dashboard-constants';

@Injectable({
    providedIn: 'root',
})

export class SharedDatasetService {

    public currAus: number[] = [];
    public colorCollections: ColorObject[] = ContinousColors;

    public bucketDetails: BucketDetails[] = [
        { letter: 'A', fare: 289, modifiedFare: null, protections: 0, multiplier: 1, Aus: 189, Sa: 189, bookings: 0 },
        { letter: 'B', fare: 249, modifiedFare: null, protections: 0, multiplier: 1, Aus: 189, Sa: 189, bookings: 0 },
        { letter: 'C', fare: 219, modifiedFare: null, protections: 0, multiplier: 1, Aus: 189, Sa: 189, bookings: 0 },
        { letter: 'D', fare: 194, modifiedFare: null, protections: 0, multiplier: 1, Aus: 188, Sa: 188, bookings: 0 },
        { letter: 'E', fare: 169, modifiedFare: null, protections: 0, multiplier: 1, Aus: 187, Sa: 187, bookings: 0 },
        { letter: 'F', fare: 149, modifiedFare: null, protections: 0, multiplier: 1, Aus: 186, Sa: 186, bookings: 0 },
        { letter: 'G', fare: 129, modifiedFare: null, protections: 0, multiplier: 1, Aus: 185, Sa: 185, bookings: 0 },
        { letter: 'H', fare: 114, modifiedFare: null, protections: 0, multiplier: 1, Aus: 180, Sa: 180, bookings: 0 },
        { letter: 'I', fare: 99, modifiedFare: null, protections: 0, multiplier: 1, Aus: 170, Sa: 170, bookings: 0 },
        { letter: 'J', fare: 86, modifiedFare: null, protections: 0, multiplier: 1, Aus: 160, Sa: 160, bookings: 0 },
        { letter: 'K', fare: 74, modifiedFare: null, protections: 0, multiplier: 1, Aus: 150, Sa: 150, bookings: 0 },
        { letter: 'L', fare: 64, modifiedFare: null, protections: 0, multiplier: 1, Aus: 140, Sa: 140, bookings: 0 },
        { letter: 'M', fare: 54, modifiedFare: null, protections: 0, multiplier: 1, Aus: 120, Sa: 120, bookings: 0 },
        { letter: 'N', fare: 44, modifiedFare: null, protections: 0, multiplier: 1, Aus: 100, Sa: 100, bookings: 0 },
        { letter: 'O', fare: 34, modifiedFare: null, protections: 0, multiplier: 1, Aus: 85, Sa: 85, bookings: 0 },
        { letter: 'P', fare: 29, modifiedFare: null, protections: 0, multiplier: 1, Aus: 70, Sa: 70, bookings: 0 },
        { letter: 'Q', fare: 24, modifiedFare: null, protections: 0, multiplier: 1, Aus: 60, Sa: 60, bookings: 0 },
        { letter: 'R', fare: 20, modifiedFare: null, protections: 0, multiplier: 1, Aus: 50, Sa: 50, bookings: 0 },
        { letter: 'S', fare: 17, modifiedFare: null, protections: 0, multiplier: 1, Aus: 40, Sa: 40, bookings: 0 },
        { letter: 'T', fare: 15, modifiedFare: null, protections: 0, multiplier: 1, Aus: 30, Sa: 30, bookings: 0 },

    ];

    public totalProtections: number = 0;

    public selectedColorRange: ColorObject = this.colorCollections[0];

    public selectedColorRangeBehaviorSubject$ = new BehaviorSubject<ColorObject>(this.colorCollections[0])

    public bucketDetailsBehaviorSubject$ = new BehaviorSubject<boolean>(true);

    public bookingUpdateBehaviorSubject$ = new BehaviorSubject<number>(0);

    public influenceInput$ = new BehaviorSubject<[number, string, number]>([null, '', null]);

    public dynamicBidPrices: number[] = [];
    public interpolateBidPriceCurvePoints: any[] = [];

    static roundMultiplierDecimals = 4;

    static roundFactor = Math.pow(10, SharedDatasetService.roundMultiplierDecimals);

    public totalBookingsCollector: number = 0;

    public totalLoadFactor: string = '';
    public maxAuValue: number = 0;
    public activeBookingElement = this.bucketDetails.length - 1;


    public getMaxAu(): number {
        const AuList = this.bucketDetails.map(object => {
            return object.Aus;
        });

        return Math.max(...AuList)
    }


    public applyDataChanges() {
        this.calculateAus();
    }

    // Returns Derived AU breakpoints
    public calculateAus() {
        this.currAus = [];

        this.bucketDetails.forEach((a, i) => {

            if (a.Aus >= 0) {
                this.currAus.push(a.Aus);
            }
        })
        //this.currAus = this.calculateBucketBands();

        // console.log('currAus ', this.currAus)

    }


    public selectColorRange(ev: ColorObject): any {
        const rangeIdx = this.colorCollections.findIndex(r => r.key === ev.key);
        this.selectedColorRangeBehaviorSubject$.next(this.colorCollections[rangeIdx])
    }



    public generateBucketValues() {


        this.bucketDetails.forEach((a, i) => {

            if (this.bucketDetails[i + 1]) {
                this.bucketDetails[i].protections = a.Aus - this.bucketDetails[i + 1].Aus;

            } else {
                this.bucketDetails[i].protections = a.Aus;
            }
            // console.log('protections ', this.bucketDetails[i].protections)
        })


        this.generateSeatsAvailable()
        this.bucketDetailsBehaviorSubject$.next(true)
    }


    public currFareValue(bucketInfo: BucketDetails) {
        return (bucketInfo.modifiedFare !== null) ? bucketInfo.modifiedFare : bucketInfo.fare;
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
    public protectionLevel(idx: number) {
        //console.log('idx ', idx)
        const nextBucketValue = (idx === (this.currAus.length - 1)) ? 0 : this.currAus[idx + 1];
        const diff = this.currAus[idx] - nextBucketValue;
        //console.log('     |||| diff ', diff)
        return (diff > 0) ? diff : 0;
    }



    public calculateBucketBands(): number[] {

        const arr = new Array<number>();
        this.bucketDetails.forEach((d, i) => {
            arr.push(0);
            //console.log('bucketInfo ', arr)
        });
        arr[0] = this.dynamicBidPrices.length;

        this.dynamicBidPrices.forEach((d, i) => {

            const bidPrice = this.dynamicBidPrices[i];
            for (let bucketIdx = 1; bucketIdx < this.bucketDetails.length; bucketIdx++) {
                const bucketInfo = this.bucketDetails[bucketIdx];
                //console.log('bucketInfo ', bucketInfo)
                const fareValue = (bucketInfo.modifiedFare !== null) ? bucketInfo.modifiedFare : bucketInfo.fare;
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

        // console.log('MAX ', this.maxAuValue, ' targetAu ', targetAu, ' currAu ', currAu)

        let remainder = 0;
        let range = 0;

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
                    range = this.bucketDetails.length;
                    //console.log(' ****  UP bucketIdx ', bucketInfo.letter)
                    remainder = this.maxAuValue - bucketInfo.Aus;
                    this.justifyAusFromDrag(remainder, bucketIdx, range)
                    bucketInfo.Aus = targetAu;
                    bucketInfo.Sa = targetAu;
                }
            }


        } else {

            for (let i = bucketIdx; i < this.bucketDetails.length; i++) {
                const bucketInfo = this.bucketDetails[i];
                if (bucketInfo.fare >= targetBp) {
                    range = 0;
                    //console.log(' *****  DOWN bucketIdx ', bucketInfo.letter)
                    remainder = bucketInfo.Aus;
                    this.justifyAusFromDrag(remainder, bucketIdx, range)
                    bucketInfo.Aus = targetAu;
                    bucketInfo.Sa = targetAu;
                }
            }

        }


    }

    public justifyAusFromDrag(active, bucketIdx, range) {
        let divider = 0;

        //console.log('               bucketIdx ', bucketIdx, ' range ', range, ' active ', active)
        //console.log('justify ', this.maxAuValue, ' active  ', active, ' bucketIdx ', bucketIdx, ' range ', range)

        if (range > bucketIdx) {
            divider = range - bucketIdx;
            //console.log(' UP  >>>>>>>>>>  d ', range - bucketIdx)


        } else {
            divider = range + bucketIdx;
            //console.log(' DOWN <<<<<<<<<< d ', (range + bucketIdx))

        }

        //console.log(' divider ', divider, ' active / divider ', active / divider)

        this.bucketDetails.forEach((d, i) => {

            //console.log('bucketInfo ', arr)

        });

    }

    private setBucketInfoToBidPrice(bucketInfo: BucketDetails, targetBp) {
        const newMult = Math.round(targetBp / bucketInfo.fare * SharedDatasetService.roundFactor) / SharedDatasetService.roundFactor;
        bucketInfo.multiplier = newMult;
        applyModifiedFare(this.bucketDetails, bucketInfo);
    }



}

function applyModifiedFare(bucketData: BucketDetails[], val: any) {
    for (const item of bucketData) {
        if (val.letter === item.letter) {
            //console.log('applyModifiedFare ', item, ' VAL ', val)
            //item.Aus = val.Aus;
            item.modifiedFare = Math.round(val.multiplier * item.fare);
        }
    }
}


