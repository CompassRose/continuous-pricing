
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs'
import { BucketDetails } from './models/dashboard.model';
import { ContinousColors, ColorObject } from './dashboard-constants';

@Injectable({
    providedIn: 'root',
})

export class SharedDatasetService {

    public fareClass: string[] = ['Y', 'B', 'M', 'H', 'K', 'L', 'V', 'A', 'T', 'X'];
    public currAus: number[] = [];
    public colorCollections: ColorObject[] = ContinousColors;

    public bucketDetails: BucketDetails[] = [
        { letter: 'Y', fare: 300, modifiedFare: null, protections: 0, multiplier: 1, Aus: 150, Sa: 150, bookings: 0, active: true },
        { letter: 'B', fare: 280, modifiedFare: null, protections: 0, multiplier: 1, Aus: 140, Sa: 140, bookings: 0, active: true },
        { letter: 'M', fare: 250, modifiedFare: null, protections: 0, multiplier: 1, Aus: 130, Sa: 130, bookings: 0, active: true },
        { letter: 'H', fare: 200, modifiedFare: null, protections: 0, multiplier: 1, Aus: 110, Sa: 110, bookings: 0, active: true },
        { letter: 'K', fare: 150, modifiedFare: null, protections: 0, multiplier: 1, Aus: 90, Sa: 90, bookings: 0, active: true },
        { letter: 'L', fare: 130, modifiedFare: null, protections: 0, multiplier: 1, Aus: 65, Sa: 65, bookings: 0, active: true },
        { letter: 'V', fare: 120, modifiedFare: null, protections: 0, multiplier: 1, Aus: 50, Sa: 50, bookings: 0, active: true },
        { letter: 'A', fare: 90, modifiedFare: null, protections: 0, multiplier: 1, Aus: 30, Sa: 30, bookings: 0, active: true },
        { letter: 'T', fare: 60, modifiedFare: null, protections: 0, multiplier: 1, Aus: 25, Sa: 25, bookings: 0, active: true },
        { letter: 'X', fare: 50, modifiedFare: null, protections: 0, multiplier: 1, Aus: 10, Sa: 10, bookings: 0, active: true }
    ];

    public totalProtections: number = 0;

    public selectedColorRange: ColorObject = this.colorCollections[0];

    public selectedColorRangeBehaviorSubject$ = new BehaviorSubject<ColorObject>(this.colorCollections[0])

    public bucketDetailsBehaviorSubject$ = new BehaviorSubject<[BucketDetails[], boolean]>([this.bucketDetails, true]);

    public bookingUpdateBehaviorSubject$ = new BehaviorSubject<number>(0);

    public influenceInput$ = new BehaviorSubject<[number, string, number]>([null, '', null]);

    public dynamicBidPrices: number[] = [];

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
                this.currAus.push(a.Aus)
            }
        })
        //this.currAus = this.calculateBucketBands();
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
        })

        // console.log('this.activeBookingElement ', this.activeBookingElement)
        this.bucketDetailsBehaviorSubject$.next([this.bucketDetails, true])
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
        // console.log('seatTemp ', seatTemp)
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
                console.log('bucketInfo ', bucketInfo)
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

        let targetBp: number;
        if (targetAu === 0) {
            targetBp = 0;
        } else {
            targetBp = targetAu >= this.dynamicBidPrices.length ? this.dynamicBidPrices[0] : this.dynamicBidPrices[this.dynamicBidPrices.length - targetAu];
        }

        // How many handles to bring along on the way up -->
        if (targetAu > currAu) {
            for (let i = bucketIdx; i >= 0; i--) {
                const bucketInfo = this.bucketDetails[i];
                if (bucketInfo.fare < targetBp) {
                    bucketInfo.Aus = targetAu;
                    bucketInfo.Sa = targetAu;
                }
            }
        } else {
            for (let i = bucketIdx; i < this.bucketDetails.length; i++) {
                const bucketInfo = this.bucketDetails[i];
                if (bucketInfo.fare >= targetBp) {
                    bucketInfo.Aus = targetAu;
                    bucketInfo.Sa = targetAu;
                }
            }
        }
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
