
import { Injectable } from '@angular/core';
import { BucketDetails, InverseFareDetails } from './models/dashboard.model';
import { Observable, BehaviorSubject, Subject, of, combineLatest, throwError } from 'rxjs';
import { switchMap, debounceTime } from 'rxjs/operators';
import { distinctUntilChanged, tap, filter } from 'rxjs/operators';

//import { DashboardApi } from './api/dashboard.api.service';
import { FlightClientDetails, ApiBucketDetails, BidPriceInfluencers } from '../app/models/dashboard.model';

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

    public bucketCollection: BucketDetails[][] = [
        [
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
            { letter: 'S', fare: 17, protections: 0, Aus: 30, bookings: 0 }
        ],
        [
            { letter: 'C', fare: 219, protections: 0, Aus: 189, bookings: 0 },
            { letter: 'D', fare: 194, protections: 0, Aus: 184, bookings: 0 },
            { letter: 'E', fare: 169, protections: 0, Aus: 180, bookings: 0 },
            { letter: 'F', fare: 149, protections: 0, Aus: 175, bookings: 0 },
            { letter: 'G', fare: 129, protections: 0, Aus: 170, bookings: 0 },
            { letter: 'H', fare: 120, protections: 0, Aus: 165, bookings: 0 },
            { letter: 'I', fare: 110, protections: 0, Aus: 160, bookings: 0 },
            { letter: 'J', fare: 100, protections: 0, Aus: 150, bookings: 0 },
            { letter: 'K', fare: 86, protections: 0, Aus: 140, bookings: 0 },
            { letter: 'L', fare: 74, protections: 0, Aus: 130, bookings: 0 },
            { letter: 'M', fare: 64, protections: 0, Aus: 110, bookings: 0 },
            { letter: 'N', fare: 54, protections: 0, Aus: 95, bookings: 0 },
            { letter: 'O', fare: 44, protections: 0, Aus: 85, bookings: 0 },
            { letter: 'P', fare: 39, protections: 0, Aus: 70, bookings: 0 },
            { letter: 'Q', fare: 31, protections: 0, Aus: 60, bookings: 0 },
            { letter: 'R', fare: 14, protections: 0, Aus: 50, bookings: 0 },
            { letter: 'S', fare: 9, protections: 0, Aus: 30, bookings: 0 }
        ],
        [
            { letter: 'C', fare: 399, protections: 0, Aus: 199, bookings: 0 },
            { letter: 'D', fare: 294, protections: 0, Aus: 188, bookings: 0 },
            { letter: 'E', fare: 269, protections: 0, Aus: 175, bookings: 0 },
            { letter: 'F', fare: 249, protections: 0, Aus: 160, bookings: 0 },
            { letter: 'G', fare: 229, protections: 0, Aus: 155, bookings: 0 },
            { letter: 'H', fare: 220, protections: 0, Aus: 150, bookings: 0 },
            { letter: 'I', fare: 210, protections: 0, Aus: 145, bookings: 0 },
            { letter: 'J', fare: 196, protections: 0, Aus: 140, bookings: 0 },
            { letter: 'K', fare: 186, protections: 0, Aus: 130, bookings: 0 },
            { letter: 'L', fare: 174, protections: 0, Aus: 120, bookings: 0 },
            { letter: 'M', fare: 164, protections: 0, Aus: 110, bookings: 0 },
            { letter: 'N', fare: 154, protections: 0, Aus: 90, bookings: 0 },
            { letter: 'O', fare: 144, protections: 0, Aus: 80, bookings: 0 },
            { letter: 'P', fare: 139, protections: 0, Aus: 75, bookings: 0 },
            { letter: 'Q', fare: 131, protections: 0, Aus: 65, bookings: 0 },
            { letter: 'R', fare: 124, protections: 0, Aus: 50, bookings: 0 },
            { letter: 'S', fare: 119, protections: 0, Aus: 30, bookings: 0 }
        ]
    ];

    public bucketDetails: BucketDetails[] = [];

    public currAus: number[] = [];
    public storedAus: number[][] = []

    static roundMultiplierDecimals = 4;

    static roundFactor = Math.pow(10, SharedDatasetService.roundMultiplierDecimals);

    public bucketDetailsBehaviorSubject$ = new BehaviorSubject<boolean>(true);

    // Boolean from trigger
    public resetDefaultSubject$ = new Subject<boolean>();

    public influenceInput$ = new BehaviorSubject<[number, string, number]>([null, '', null]);

    public totalBookingsCollector: number = 0;

    public maxAuValue: number = 0;

    public maxFareValue: number = 0;

    public selectedMetric = 0;

    // Stepped(Fixed) BidPrices
    public dynamicBidPrices: number[] = [];
    // Interpolated Prices
    public interpolateBidPriceCurvePoints: any[] = [];

    public adjustedCurvePoints: any[] = [];

    public competitorsCurvePoints: any[][] = [];

    public activeCurve: number[] = [];

    public metricGroupSubject$ = new BehaviorSubject<any>([]);

    public inverseFareValues: any[] = [];

    public showCompetitorsFlag = false;

    public apiFlightClientSubject$ = new BehaviorSubject<FlightClientDetails>(null);

    public apiFlightActiveSubject$ = new BehaviorSubject<boolean>(false);

    public updatedClientFlight$ = new BehaviorSubject<any>(null);

    public influenceInput = new Subject<any[]>();

    public modifierObj = { mult: 1.00, addSub: 0, min: 0, max: 99999 } as BidPriceInfluencers;

    public staticModifiers = { mult: 1.00, addSub: 0, min: 0, max: 99999 } as BidPriceInfluencers;

    public dragGrouping: any = [
        { name: 'Single', id: 0 },
        { name: 'Existing AU %', id: 1 },
        { name: 'Linear Protection', id: 2 },
        { name: 'Inverse Fare %', id: 3 }
    ];

    public apiBucketDetails: any[][];

    public fromApiBucketDetails: BucketDetails[] = []
    // public dashboardAPI: DashboardApi
    constructor() {

        const tempBucketCollection = [...this.bucketCollection]

        tempBucketCollection.map((bc, i) => {
            this.calculateAusPriorToUse(bc)
        })

        tempBucketCollection.map((bc, i: number) => {
            return bc = this.setProtectionsPriorToUse(bc, i);
        })

        console.log('tempBucketCollection  ', tempBucketCollection)

        window.localStorage.setItem('archivedBucketCollection', JSON.stringify(JSON.parse(JSON.stringify(tempBucketCollection))));

        window.localStorage.setItem('savedBucketCollection', JSON.stringify(JSON.parse(JSON.stringify(tempBucketCollection))));

        // window.localStorage.setItem('archivedBuckets', JSON.stringify(JSON.parse(JSON.stringify(this.bucketDetails))));

        //this.bucketDetails = JSON.parse(window.localStorage.getItem('archivedBuckets'));
        this.bucketDetails = [...this.bucketCollection[0]];

        this.metricGroupSubject$.next(this.dragGrouping);

        this.resetDefaultSubject$
            .subscribe(response => {
                this.totalBookingsCollector = 0;
                this.maxAuValue = this.getMaxAu();
                this.selectedMetric = 0;
                this.setGroupingMethod(0);
                this.metricGroupSubject$.next(this.dragGrouping);
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
                this.influenceInput$.next([event, item, id])
            })
        )
            .subscribe();

        this.resetInverseDetailsFromBookings();
    }

    // Updates Flight Behavior Subject and triggers return FlightClient with setting cabin to Economy(Y)
    public setFlightClient(idx: number): void {

        const tempSavedCollection = JSON.parse(window.localStorage.getItem('savedBucketCollection'));
        this.bucketDetails = tempSavedCollection[idx];
        this.toggleTargetToApi();

    }



    // For setting API flight values to bucket Details formattting
    public setApiValuesToBucketDetails() {

        this.totalBookingsCollector = 0;
        let apiBookingTotal = 0;
        let tempArray = [];

        this.apiBucketDetails.map((abd: any, i) => {
            //console.log('this.fromApiBucketDetails ', )

            if (abd.esAdjustedFare && abd.esAu) {
                tempArray.push({
                    letter: abd.bucketLetter,
                    fare: abd.esAdjustedFare,
                    protections: 0,
                    Aus: abd.esAu,
                    bookings: abd.bookings
                })
            }
        })
        tempArray.shift()
    }


    //  Reset Default button press
    public resetFromArchivedBuckets(idx: number) {
        const tempCollection = JSON.parse(window.localStorage.getItem('archivedBucketCollection'));

        this.bucketDetails = tempCollection[idx];

        console.log('resetFromArchivedBuckets  bucketDetails  ', this.bucketDetails)
        this.resetDefaultSubject$.next(true)
    }


    //  Reset Default button press
    public saveBucketSet(idx: number) {

        const tempSavedCollection = JSON.parse(window.localStorage.getItem('savedBucketCollection'));
        tempSavedCollection[idx] = this.bucketDetails;
        // console.log('resetFromArchivedBuckets  bucketDetails  ', tempSavedCollection[idx]);
        window.localStorage.setItem('savedBucketCollection', JSON.stringify(JSON.parse(JSON.stringify(tempSavedCollection))));
        //  console.log('resetFromArchivedBuckets  bucketDetails  ', this.bucketDetails);

        // this.resetDefaultSubject$.next(true)
    }

    public toggleTargetToApi() {

        let apiBookingTotal = 0;
        this.applyDataChanges();

        this.bucketDetails.forEach((d, i) => {
            apiBookingTotal += d.bookings;
        })

        this.totalBookingsCollector = apiBookingTotal;
        this.apiFlightActiveSubject$.next(true);

    }


    public getMaxFare(): number {
        const AuList = this.bucketDetails.map(object => {
            return object.protections > 0 ? object.fare : 0;
        });

        return Math.max(...AuList)
    }



    public getMaxAu(): number {
        const AuList = this.bucketDetails.map(object => {
            return object.Aus;
        });

        return Math.max(...AuList)
    }



    public applyDataChanges() {

        this.currAus = [];
        this.maxAuValue = this.bucketDetails[0].Aus;
        this.calculateAus();

        // console.log('this.maxAuValue ', this.maxAuValue)
    }



    // Returns Derived AU breakpoints
    public calculateAus() {
        // console.log('  this.maxAuValue ', this.maxAuValue);

        this.bucketDetails.map((a, i) => {
            //console.log('  a ', a);
            if (a.Aus >= 0) {
                this.currAus.push(Math.round(Math.floor(a.Aus)));
            }
            if (a.Aus > this.maxAuValue) {
                a.Aus = this.maxAuValue;
            }
            return a
        })
        // this.maxAuValue = this.currAus[0];

        this.generateBucketValues();
    }


    // Generates protections from Aus
    public generateBucketValues() {

        this.bucketDetails.map((a, i) => {
            // console.log('  a ', a);
            return a.protections = this.protectionMyLevel(i);
        })
        this.bucketDetailsBehaviorSubject$.next(true)
    }

    // Returns Bucket Seat count for protection
    public protectionMyLevel(idx: number): number {
        const nextBucketValue = (idx === (this.currAus.length - 1)) ? 0 : this.currAus[idx + 1];
        const diff = this.currAus[idx] - nextBucketValue;
        //console.log('  this.currAus idx ', this.currAus[idx], ' nextBucketValue ', nextBucketValue, ' diff ', diff);
        return (diff > 0) ? diff : 0;
    }


    // Returns Derived AU breakpoints
    private calculateAusPriorToUse(set: BucketDetails[]) {
        //console.log('  this.maxAuValue ', this.maxAuValue);
        const tempAus = [];
        set.map((a, i) => {
            if (a.Aus >= 0) {
                tempAus.push(Math.round(Math.floor(a.Aus)));
            }
            return a
        })
        this.storedAus.push(tempAus);
        return set;
    }


    private setProtectionsPriorToUse(set: BucketDetails[], idx: number): BucketDetails[] {
        let tempBuckets = [];

        this.maxAuValue = this.storedAus[idx][0];

        tempBuckets = set.map((a: any, i) => {
            //  console.log('  a ', a);
            if (a.Aus > this.maxAuValue) {
                a.Aus = this.maxAuValue;
            }
            a.protections = this.protectionMyLevelPriorToUse(i, idx);
            return a
        })
        // console.log('  tempBuckets  ', tempBuckets, ' this.maxAuValue ', this.maxAuValue);
        return tempBuckets

    }


    // Returns Bucket Seat count for protection
    private protectionMyLevelPriorToUse(idx: number, i: number): number {

        const nextBucketValue = (idx === (this.storedAus[i].length - 1)) ? 0 : this.storedAus[i][idx + 1];

        const diff = this.storedAus[i][idx] - nextBucketValue;
        //console.log('  this.currAus idx ', this.storedAus[i], ' nextBucketValue ', nextBucketValue, ' diff ', diff);
        return (diff > 0) ? diff : 0;
    }




    public showCompetitors() {
        this.showCompetitorsFlag = !this.showCompetitorsFlag;
        this.bucketDetails = JSON.parse(window.localStorage.getItem('archivedBuckets'));
        // console.log('resetFromArchivedBuckets  bucketDetails  ', this.bucketDetails)
        this.resetDefaultSubject$.next(true)
    }


    // Returns Flight Observable
    public getFlightClient(): Observable<FlightClientDetails> {

        return this.getApiFlightClient();
    }

    public getApiFlightClient(): Observable<FlightClientDetails> {
        return this.apiFlightClientSubject$.asObservable();
    }


    // Gets Influences from API and triggers returnBidPriceInfluences
    // public getBidPriceInfluencesFromApi(masterKey): void {
    //     this.dashboardAPI
    //         .getBidPriceInfluences(masterKey)
    //         .pipe(
    //             catchError(() => {
    //                 //this.isLoadingErrorBehaviorSubject$.next(true);
    //                 return throwError(() => new Error('Error Setting Influences'));
    //             })
    //         )
    //         .subscribe((res: BidPriceInfluencers[]) => {
    //             // console.log('res ', res)
    //             //this.dashboardState.setBidPriceInfluences(res);
    //         });
    // }


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