
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

    public inverseFareValues: any[] = [];


    public dragGrouping: any = [
        { name: 'Single', id: 0 },
        { name: 'Existing AU %', id: 1 },
        { name: 'Linear Protection', id: 2 },
        { name: 'Inverse Fare %', id: 3 }
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

        this.resetInverseDetailsFromBookings()
    }


    public resetInverseDetailsFromBookings() {
        this.inverseFareValues = this.generateInverseDetails();
    }


    // Builds Inverse Fare % values, called onInit and Booking slider changes
    public generateInverseDetails(): any[] {

        const inverseFareValues = [];
        let remainingSeats = this.bucketDetails[0].Aus - this.totalBookingsCollector;
        //console.log('generateInverseDetails totalBookingsCollector ', this.totalBookingsCollector, ' remainingSeats ', remainingSeats)
        let percentOfTop = [];
        let inverseDistribution = 0;
        let theTop = this.bucketDetails[0].Aus;
        let totalIFV = 0;

        this.bucketDetails.map((d: any, i) => {
            percentOfTop.push(+((d.fare / theTop) * 100).toFixed(0));
            inverseDistribution = 1 / (percentOfTop[i] * 100);
            totalIFV = totalIFV + inverseDistribution;
            const remain = (((inverseDistribution / totalIFV)));
            const protections = +(remainingSeats * remain).toFixed(2);
            inverseFareValues.push({ inverseDistribute: inverseDistribution, protections: protections })
        })
        let newArray = [];

        inverseFareValues.forEach((iv, i) => {
            const remain = (((iv.inverseDistribute / totalIFV)));
            const protections = +(remainingSeats * remain).toFixed(2);
            newArray.push({ protections: protections });
        })
        return newArray;
    }


    public setGroupingMethod(model) {
        this.selectedMetric = model;
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
            // console.log('p ', a.protections)
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
                    //console.log('Down currAu ', currAu, ' targetAu ', targetAu, ' letter ', this.bucketDetails[bucketIdx].letter, ' Aus ', this.bucketDetails[bucketIdx].Aus)
                    if (this.dragGrouping[this.selectedMetric] !== undefined && this.dragGrouping[this.selectedMetric].id !== 0) {
                        this.justifyDistributionFromDrag(bucketIdx, targetAu, 'down')
                    } else {
                        bucketInfo.Aus = targetAu;
                    }
                }
            }
        }
    }



    public justifyDistributionFromDrag(bucketIdx, targetAu, direction) {

        if (direction === 'up') {

            if (this.selectedMetric === 1) {
                this.distributeFromExistingAus(bucketIdx, targetAu, 'up')
            } else if (this.selectedMetric === 2) {
                this.distributeFromLinearScale(bucketIdx, targetAu, 'up');
            } else if (this.selectedMetric === 3) {
                this.distributeFromInverseFareValues(targetAu, bucketIdx, 'up')
            }

        } else {
            // console.log('       Down ', bucketIdx, ' letter ', this.bucketDetails[bucketIdx].letter, '  targetAu ', targetAu, ' Au ', this.bucketDetails[bucketIdx].Aus)
            if (this.selectedMetric === 1) {
                this.distributeFromExistingAus(bucketIdx, targetAu, 'down')
            } else if (this.selectedMetric === 2) {
                this.distributeFromLinearScale(bucketIdx, targetAu, 'down');
            } else if (this.selectedMetric === 3) {
                this.distributeFromInverseFareValues(targetAu, bucketIdx, 'down')
            }
        }
    }

    public distributeFromExistingAus(bucketIdx, targetAu, direction) {

        let groupValueAuPercentage = 0;
        if (direction === 'up') {
            for (let i = bucketIdx; i >= 0; i--) {

                if (this.bucketDetails[i].Aus < this.maxAuValue) {
                    groupValueAuPercentage = this.bucketDetails[bucketIdx].Aus / (targetAu / bucketIdx) / bucketIdx;
                    const bucketInfo = this.bucketDetails[i];
                    bucketInfo.Aus = bucketInfo.Aus += groupValueAuPercentage;
                    //console.log('   Au % ', this.bucketDetails[i].letter, ' idx ', i, ' Modifier ', groupValueAuPercentage.toFixed(2), ' Aus ', this.bucketDetails[i].Aus.toFixed(2))
                }
                else {
                    this.bucketDetails[i].Aus = this.maxAuValue;
                }
            }
        } else {
            for (let i = bucketIdx; i < this.bucketDetails.length; i++) {
                let groupValueAuPercentage = 0;
                if (this.bucketDetails[i].Aus > 0) {
                    groupValueAuPercentage = this.bucketDetails[i].Aus / (targetAu / bucketIdx) / bucketIdx;
                    const bucketInfo = this.bucketDetails[i];
                    bucketInfo.Aus = bucketInfo.Aus -= groupValueAuPercentage;
                    // console.log('   Au % ', this.bucketDetails[i].letter, ' idx ', i, ' Modifier ', groupValueAuPercentage.toFixed(2), ' Aus ', this.bucketDetails[i].Aus.toFixed(2))
                } else {
                    this.bucketDetails[i].Aus = 0;
                }
            }

        }
    }

    public distributeFromInverseFareValues(targetAu, bucketIdx, direction) {

        //console.log('generateInverseFareValues ', direction, ' bookings ', bookings, ' bucketIdx ', bucketIdx)
        let groupValueAuPercentage = 0;

        if (direction === 'up') {

            //console.log('UP bucketDetails ', this.bucketDetails[bucketIdx].letter)
            for (let i = bucketIdx; i >= 0; i--) {
                if (this.bucketDetails[i].Aus < this.maxAuValue) {
                    groupValueAuPercentage = this.bucketDetails[bucketIdx].Aus / (targetAu / this.inverseFareValues[i].protections) / bucketIdx;
                    const bucketInfo = this.bucketDetails[i];
                    bucketInfo.Aus = bucketInfo.Aus += groupValueAuPercentage;
                    //console.log('   Au % ', this.bucketDetails[i].letter, ' idx ', i, ' Modifier ', groupValueAuPercentage.toFixed(2), ' Aus ', this.bucketDetails[i].Aus.toFixed(2))
                }
                else {
                    this.bucketDetails[i].Aus = this.maxAuValue;;
                }
            }

        } else {
            // console.log('Down  letter ', this.bucketDetails[bucketIdx].letter)
            let increment = bucketIdx + 1
            for (let i = bucketIdx; i < this.bucketDetails.length; i++) {
                //console.log('Down  letter ', this.bucketDetails[i].letter, ' ip: ', targetAu / this.inverseFareValues[i].protections)
                if (this.bucketDetails[i].Aus > 0) {
                    groupValueAuPercentage = (targetAu / this.inverseFareValues[i].protections) / increment;
                    //console.log('L', this.bucketDetails[i].letter, ' GP: ', groupValueAuPercentage.toFixed(2), ' prots ', this.inverseFareValues[i].protections)
                    const bucketInfo = this.bucketDetails[i];
                    bucketInfo.Aus = bucketInfo.Aus < 0 ? 0 : bucketInfo.Aus -= groupValueAuPercentage;
                    //console.log('L', this.bucketDetails[i].letter, ' i ', i,  ' protections ', this.inverseFareValues[i].protections, ' Aus ', this.bucketDetails[i].Aus.toFixed(2))

                } else {
                    this.bucketDetails[i].Aus = 0;
                }
            }

        }
    }


    public distributeFromLinearScale(values, targetAu, dir) {
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
            }
        }
    }
}