
import { Injectable } from '@angular/core';
import { BucketDetails, InverseFareDetails } from '../models/dashboard.model';
import { Observable, BehaviorSubject, Subject, of, combineLatest, throwError } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { distinctUntilChanged, tap, filter } from 'rxjs/operators';

//import { DashboardApi } from './api/dashboard.api.service';
import { FlightClientDetails, ApiBucketDetails, BidPriceInfluencers } from '../models/dashboard.model';

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
            { letter: 'D', fare: 194, protections: 0, Aus: 190, bookings: 0, discrete: false },
            { letter: 'E', fare: 169, protections: 0, Aus: 185, bookings: 0, discrete: false },
            { letter: 'F', fare: 149, protections: 0, Aus: 180, bookings: 0, discrete: false },
            { letter: 'G', fare: 129, protections: 0, Aus: 175, bookings: 0, discrete: false },
            { letter: 'H', fare: 114, protections: 0, Aus: 170, bookings: 0, discrete: false },
            { letter: 'I', fare: 99, protections: 0, Aus: 165, bookings: 0, discrete: false },
            { letter: 'J', fare: 86, protections: 0, Aus: 160, bookings: 0, discrete: false },
            { letter: 'K', fare: 74, protections: 0, Aus: 150, bookings: 0, discrete: false },
            { letter: 'L', fare: 64, protections: 0, Aus: 140, bookings: 0, discrete: false },
            { letter: 'M', fare: 54, protections: 0, Aus: 120, bookings: 0, discrete: false },
            { letter: 'N', fare: 44, protections: 0, Aus: 100, bookings: 0, discrete: false },
            { letter: 'O', fare: 34, protections: 0, Aus: 85, bookings: 0, discrete: false },
            { letter: 'P', fare: 29, protections: 0, Aus: 70, bookings: 0, discrete: false },

            { letter: 'Q', fare: 24, protections: 0, Aus: 60, bookings: 0, discrete: true },
            { letter: 'R', fare: 20, protections: 0, Aus: 40, bookings: 0, discrete: true },
            { letter: 'S', fare: 10, protections: 0, Aus: 30, bookings: 0, discrete: true }
        ],
        [
            { letter: 'D', fare: 219, protections: 0, Aus: 189, bookings: 0, discrete: false },
            { letter: 'E', fare: 194, protections: 0, Aus: 184, bookings: 0, discrete: false },
            { letter: 'F', fare: 169, protections: 0, Aus: 180, bookings: 0, discrete: false },
            { letter: 'G', fare: 149, protections: 0, Aus: 175, bookings: 0, discrete: false },
            { letter: 'H', fare: 129, protections: 0, Aus: 170, bookings: 0, discrete: false },
            { letter: 'I', fare: 120, protections: 0, Aus: 165, bookings: 0, discrete: false },
            { letter: 'J', fare: 110, protections: 0, Aus: 160, bookings: 0, discrete: false },
            { letter: 'K', fare: 100, protections: 0, Aus: 150, bookings: 0, discrete: false },
            { letter: 'L', fare: 86, protections: 0, Aus: 140, bookings: 0, discrete: false },
            { letter: 'M', fare: 74, protections: 0, Aus: 130, bookings: 0, discrete: false },
            { letter: 'N', fare: 64, protections: 0, Aus: 110, bookings: 0, discrete: false },
            { letter: 'O', fare: 54, protections: 0, Aus: 95, bookings: 0, discrete: false },
            { letter: 'P', fare: 44, protections: 0, Aus: 85, bookings: 0, discrete: false },

            { letter: 'Q', fare: 34, protections: 0, Aus: 60, bookings: 0, discrete: true },
            { letter: 'R', fare: 20, protections: 0, Aus: 40, bookings: 0, discrete: true }

        ],
        [
            { letter: 'D', fare: 399, protections: 0, Aus: 199, bookings: 0, discrete: false },
            { letter: 'E', fare: 294, protections: 0, Aus: 188, bookings: 0, discrete: false },
            { letter: 'F', fare: 269, protections: 0, Aus: 175, bookings: 0, discrete: false },
            { letter: 'G', fare: 249, protections: 0, Aus: 160, bookings: 0, discrete: false },
            { letter: 'H', fare: 229, protections: 0, Aus: 155, bookings: 0, discrete: false },
            { letter: 'I', fare: 220, protections: 0, Aus: 150, bookings: 0, discrete: false },
            { letter: 'J', fare: 210, protections: 0, Aus: 145, bookings: 0, discrete: false },
            { letter: 'K', fare: 196, protections: 0, Aus: 140, bookings: 0, discrete: false },
            { letter: 'L', fare: 186, protections: 0, Aus: 130, bookings: 0, discrete: false },
            { letter: 'M', fare: 174, protections: 0, Aus: 120, bookings: 0, discrete: false },
            { letter: 'N', fare: 164, protections: 0, Aus: 110, bookings: 0, discrete: false },
            { letter: 'O', fare: 154, protections: 0, Aus: 90, bookings: 0, discrete: false },
            { letter: 'P', fare: 144, protections: 0, Aus: 80, bookings: 0, discrete: false },

            { letter: 'Q', fare: 131, protections: 0, Aus: 65, bookings: 0, discrete: true },
            { letter: 'R', fare: 124, protections: 0, Aus: 50, bookings: 0, discrete: true },
            { letter: 'S', fare: 119, protections: 0, Aus: 10, bookings: 0, discrete: true },

        ]
    ];


    public bucketDetails: BucketDetails[] = [];

    public currAus: number[] = [];
    public storedAus: number[][] = []

    static roundMultiplierDecimals = 4;

    static roundFactor = Math.pow(10, SharedDatasetService.roundMultiplierDecimals);

    public bucketDetailsBehaviorSubject$ = new BehaviorSubject<boolean>(false);

    // Boolean from trigger
    public resetDefaultSubject$ = new BehaviorSubject<boolean>(false);

    public influenceInput = new Subject<any[]>();

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

    public modifierObj = { mult: 1.00, addSub: 0, partialMax: '' } as BidPriceInfluencers;

    public staticModifiers = { mult: 1.00, addSub: 0, partialMax: '' } as BidPriceInfluencers;

    public modifierCollection = [];

    public cabinOptions: any = [
        { name: 'Business', id: 0, state: false },
        { name: 'Prem Econ', id: 1, state: false },
        { name: 'Economy', id: 2, state: true },
    ];

    public dragGrouping: any = [
        { name: 'Single', id: 0 },
        { name: 'Existing AU %', id: 1 },
        { name: 'Linear Protection', id: 2 },
        { name: 'Inverse Fare %', id: 3 }
    ];

    public apiBucketDetails: any[][];

    constructor() {

        const tempBucketCollection = [...this.bucketCollection]

        // prior versions are for resetting values

        tempBucketCollection.map((bc, i) => {
            this.calculateAusPriorToUse(bc)
        })

        tempBucketCollection.map((bc, i: number) => {
            return bc = this.setProtectionsPriorToUse(bc, i);
        })


        ///////////////////

        window.localStorage.setItem('archivedBucketCollection', JSON.stringify(JSON.parse(JSON.stringify(tempBucketCollection))));
        window.localStorage.setItem('savedBucketCollection', JSON.stringify(JSON.parse(JSON.stringify(tempBucketCollection))));


        this.bucketDetails = [...this.bucketCollection[0]];

        this.metricGroupSubject$.next(this.dragGrouping);

        this.resetDefaultSubject$
            .subscribe(response => {
                console.log('SHARED DATA resetDefaultSubject$ response ', response)

                this.modifierObj = { mult: 1.00, addSub: 0, partialMax: '' };

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
                console.log('influenceInput event ', event, ' item ', item, ' id ', id)

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

                // console.log('sharedDatasetService modifierObj ', this.modifierObj, '   this.modifierCollection ', this.modifierCollection)
                this.bucketDetailsBehaviorSubject$.next(true);
            })
        )
            .subscribe();
        this.resetInverseDetailsFromBookings();
    }



    // Updates Flight Behavior Subject and triggers return FlightClient with setting cabin to Economy(Y)
    public setFlightClient(idx: number): void {
        console.log('setFlightClient ', idx)
        const tempSavedCollection = JSON.parse(window.localStorage.getItem('savedBucketCollection'));
        this.bucketDetails = tempSavedCollection[idx];
        this.toggleTargetToApi();
    }


    //  Reset Default button press
    public resetFromArchivedBuckets(idx: number) {

        const tempCollection = JSON.parse(window.localStorage.getItem('archivedBucketCollection'));
        console.log('resetFromArchivedBuckets ', idx, ' tempCollection ', tempCollection)
        this.bucketDetails = tempCollection[idx];

        console.log('resetFromArchivedBuckets  bucketDetails  ', this.bucketDetails)
        this.resetDefaultSubject$.next(true)
    }


    //  Reset Default button press
    public saveBucketSet(idx: number) {
        const tempSavedCollection = JSON.parse(window.localStorage.getItem('savedBucketCollection'));
        tempSavedCollection[idx] = this.bucketDetails;
        window.localStorage.setItem('savedBucketCollection', JSON.stringify(JSON.parse(JSON.stringify(tempSavedCollection))));
    }

    public toggleTargetToApi() {
        console.log('toggleTargetToApi ')
        let apiBookingTotal = 0;
        this.applyDataChanges();

        this.bucketDetails.forEach((d, i) => {
            apiBookingTotal += d.bookings;
        })

        this.totalBookingsCollector = apiBookingTotal;
        //  console.log(' this.totalBookingsCollector  ', this.totalBookingsCollector)
        //this.apiFlightActiveSubject$.next(true);

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
        console.log('|||||||||||||||||||||||||||||||| Math.max(...AuList) ', Math.max(...AuList))
        return Math.max(...AuList)
    }



    public applyDataChanges() {
        this.currAus = [];
        // this.maxAuValue = this.bucketDetails[0].Aus;
        this.calculateAus();
    }



    // Returns Derived AU breakpoints
    public calculateAus() {
        //this.bucketDetails = this.getAuValues();
        this.bucketDetails.map((a, i) => {

            if (a.Aus > this.maxAuValue) {
                a.Aus = this.maxAuValue;
            }
            if (a.Aus >= 0) {
                this.currAus.push(Math.round(Math.floor(a.Aus)));
            }
            return a;
        })

        console.log('this.currAus ', this.currAus)
        this.generateBucketValues();

    }

    // Generates protections from Aus
    public generateBucketValues() {
        this.bucketDetails.map((a, i) => {
            return a.protections = this.protectionMyLevel(i);
        })
        this.bucketDetailsBehaviorSubject$.next(true);
    }

    // Returns Bucket Seat count for protection
    public protectionMyLevel(idx: number): number {
        const nextBucketValue = (idx === (this.currAus.length - 1)) ? 0 : this.currAus[idx + 1];
        const diff = this.currAus[idx] - nextBucketValue;
        return (diff > 0) ? diff : 0;
    }


    private getAuValues(): BucketDetails[] {
        return this.bucketDetails.map((a, i) => {
            if (a.Aus >= 0) {
                this.currAus.push(Math.round(Math.floor(a.Aus)));
            }
            if (a.Aus > this.maxAuValue) {
                a.Aus = this.maxAuValue;
            }
            return a
        })
    }



    // Returns Derived AU breakpoints
    private calculateAusPriorToUse(set: BucketDetails[]) {
        // console.log('calculateAusPriorToUse  this.maxAuValue ', this.maxAuValue);
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
            if (a.Aus > this.maxAuValue) {
                a.Aus = this.maxAuValue;
            }
            a.protections = this.protectionMyLevelPriorToUse(i, idx) - a.bookings;
            //console.log('  a  ', a)
            return a
        })
        return tempBuckets
    }


    // Returns Bucket Seat count for protection
    private protectionMyLevelPriorToUse(idx: number, i: number): number {

        const nextBucketValue = (idx === (this.storedAus[i].length - 1)) ? 0 : this.storedAus[i][idx + 1];

        const diff = this.storedAus[i][idx] - nextBucketValue;
        // console.log('  this.currAus idx  nextBucketValue ', nextBucketValue, ' diff ', diff);
        return (diff > 0) ? diff : 0;
    }




    public showCompetitors() {
        this.showCompetitorsFlag = !this.showCompetitorsFlag;
        this.bucketDetails = JSON.parse(window.localStorage.getItem('archivedBuckets'));
        // console.log('resetFromArchivedBuckets  bucketDetails  ', this.bucketDetails)
        this.resetDefaultSubject$.next(true)
    }


    // Returns Flight Observable Not Used
    public getFlightClient(): Observable<FlightClientDetails> {
        return this.getApiFlightClient();
    }

    public getApiFlightClient(): Observable<FlightClientDetails> {
        return this.apiFlightClientSubject$.asObservable();
    }


    public resetInverseDetailsFromBookings() {
        this.inverseFareValues = this.generateInverseDetails();
    }



    // Builds Inverse Fare % values, called onInit and Booking slider changes
    public generateInverseDetails(): any[] {

        const inverseFareValues = [];
        let remainingSeats = this.bucketDetails[0].Aus - this.totalBookingsCollector;
        //console.log('generateInverseDetails Length ', this.bucketDetails.length, ' remainingSeats ', remainingSeats)
        let percentOfTop = [];
        let inverseDistribution = 0;
        let theTop = this.bucketDetails[0].Aus;
        let totalIFV = 0;

        this.bucketDetails.map((d: any, i) => {
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

        // console.log('generateInverseDetails newArray ', newArray)
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

        console.log('calculateBidPriceForAu bucketIdx ', this.bucketDetails[bucketIdx].letter, ' bucketIdx ', bucketIdx, ' targetAu ', targetAu)
        // How many handles to bring along on the way up -->

        if (targetAu >= currAu) {
            for (let i = bucketIdx; i >= 0; i--) {
                const bucketInfo = this.bucketDetails[i];

                if (bucketInfo.fare < targetBp) {
                    //       console.log('U: bucketInfo ', bucketInfo)
                    //console.log('UP letter ', this.bucketDetails[bucketIdx].letter, '\ncurrAu ', currAu, '\ntargetAu ', targetAu, '\nAus ', this.bucketDetails[bucketIdx].Aus, '\n dragGroup ', this.dragGrouping[this.selectedMetric])
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
                    // console.log('D: bucketInfo ', bucketInfo)
                    //console.log('Down currAu ', currAu, '\ntargetAu ', targetAu, '\nletter ', this.bucketDetails[bucketIdx].letter, '\nAus ', this.bucketDetails[bucketIdx].Aus)
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
            //console.log('Up ', bucketIdx, ' letter ', this.bucketDetails[bucketIdx].letter, '  targetAu ', targetAu, ' Au ', this.bucketDetails[bucketIdx].Aus)
            if (this.selectedMetric === 1) {
                this.distributeFromExistingAus(bucketIdx, targetAu, 'up')
            } else if (this.selectedMetric === 2) {
                this.distributeFromLinearScale(bucketIdx, targetAu, 'up');
            } else if (this.selectedMetric === 3) {
                this.distributeFromInverseFareValues(bucketIdx, targetAu, 'up')
            }

        } else {
            //console.log(' Down ', bucketIdx, ' letter ', this.bucketDetails[bucketIdx].letter, '  targetAu ', targetAu, ' Au ', this.bucketDetails[bucketIdx].Aus)
            if (this.selectedMetric === 1) {
                this.distributeFromExistingAus(bucketIdx, targetAu, 'down')
            } else if (this.selectedMetric === 2) {
                this.distributeFromLinearScale(bucketIdx, targetAu, 'down');
            } else if (this.selectedMetric === 3) {
                this.distributeFromInverseFareValues(bucketIdx, targetAu, 'down')
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

    public distributeFromInverseFareValues(bucketIdx, targetAu, direction) {

        //console.log('\n\n\n generateInverseFareValues ', this.bucketDetails[bucketIdx].letter, ' direction ', direction, ' bucketIdx ', bucketIdx, ' targetAu ', targetAu)
        let groupValueAuPercentage = 0;

        if (direction === 'up') {

            //console.log('UP bucketDetails ', this.bucketDetails[bucketIdx].letter)
            for (let i = bucketIdx; i >= 0; i--) {

                if (this.bucketDetails[i].Aus < this.maxAuValue) {
                    groupValueAuPercentage = this.bucketDetails[i].Aus / (targetAu / this.inverseFareValues[i].protections) / bucketIdx;
                    const bucketInfo = this.bucketDetails[i];
                    bucketInfo.Aus = bucketInfo.Aus += groupValueAuPercentage;
                    //console.log('   Au % ', this.bucketDetails[i].letter, ' idx ', i, ' Modifier ', groupValueAuPercentage.toFixed(2), ' Aus ', this.bucketDetails[i].Aus.toFixed(2))
                }
                else {
                    this.bucketDetails[i].Aus = this.maxAuValue;;
                }
            }

        } else {
            //console.log('Down  letter ', this.bucketDetails[bucketIdx].letter)
            let increment = bucketIdx + 1;
            for (let i = bucketIdx; i < this.bucketDetails.length; i++) {
                //console.log('i ', i, '   Down  letter ', this.bucketDetails[i].letter, ' ip: ', targetAu / this.inverseFareValues[i].protections)
                if (this.bucketDetails[i].Aus > 0) {
                    // console.log('i ', i)

                    groupValueAuPercentage = this.bucketDetails[i].Aus / (targetAu / this.inverseFareValues[i].protections) / increment;
                    const bucketInfo = this.bucketDetails[i];
                    bucketInfo.Aus = bucketInfo.Aus < 0 ? 0 : bucketInfo.Aus -= groupValueAuPercentage;
                } else {
                    this.bucketDetails[i].Aus = 0;
                }
            }

        }
    }


    public distributeFromLinearScale(values, targetAu, dir) {
        // console.log('\n\n\n gdistributeFromLinearScale ', this.bucketDetails[values].letter, ' direction ', dir, ' values ', values, ' targetAu ', targetAu)
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
            mult = ((this.maxAuValue - targetAu) / (values + 1));
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