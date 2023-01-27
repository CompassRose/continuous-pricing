
import { Component } from '@angular/core';
import { IFlightInfluencesByCabin } from '../models/dashboard.model';
import { ConstraintService } from '../constraint.service';
import { SharedDatasetService } from '../shared-datasets.service';


@Component({
    selector: 'bidprice-configure',
    templateUrl: './bid-price-configure.component.html',
    styleUrls: ['./bid-price-configure.component.scss']
})


export class BipPriceConfigureComponent {

    public savedInfluenceMods: any[] = [];
    public showInfluenceControls = true;

    public numberLength = 0;

    public ableToSave = false;
    public modifiedCurveActive = false;
    public applyModifiedToAdjusted = false;
    public currentCaptureDate: any;

    public activeCabinInfluences: IFlightInfluencesByCabin = {};

    constructor(
        public sharedDatasetService: SharedDatasetService,
        public constraintService: ConstraintService
    ) {


        // this.dataService.dashboardFacade.getActiveCabin()
        //     .subscribe((cabin) => {
        //         if (cabin !== null) {
        //             if (this.dataService.currentCabin !== null && this.dataService.currentCabin !== cabin) {
        //                 this.getMyActiveCabin();
        //             }
        //             this.dataService.currentCabin = cabin;
        //         }
        //     })



        // Gets Values from dashboard facade combineLatest
        // this.dataService.dashboardFacade.combineAndSendLatestValues()
        //     .subscribe((response) => {
        //         console.log('\nCombineAndSend subscribe from facade --- \n', '[[[', ...response, ' ]]]');
        //         let updatedFlight = response[0];
        //         let updatedInfluences = response[1];
        //         this.dataService.updatedClientFlight = this.dataService.processFlight(updatedFlight);
        //         this.processInfluencesForUi(updatedInfluences);

        //         if (this.dataService.currentCabin === null) {
        //             this.dataService.cabinSelected = this.dataService.updatedClientFlight.cabinDetails.length - 1;
        //             this.dataService.onCabinSelect(this.dataService.cabinSelected);
        //         } else {
        //             this.dataService.cabinSelected = this.dataService.currentCabin;
        //             this.dataService.onCabinSelect(this.dataService.currentCabin);
        //         }

        //         this.dataService.dashboardFacade.ndoNumberDateSubject$.next(this.dateFormatterPipe.findNetDaysOut(this.currentCaptureDate, updatedFlight.departureDateTime))
        //         this.dataService.dashboardFacade.toggleModifiedCurveBehaviorSubject$.next(false);
        //         this.dataService.updatedClientFlight$.next(this.dataService.updatedClientFlight);
        //         this.getMyActiveCabin();
        //     })


        // this.dataService.dashboardFacade.getAirlineValues()
        //     .subscribe((aConfig: AirlineConfig) => {
        //         if (aConfig !== null) {
        //             this.currentCaptureDate = aConfig.captureDate;
        //         }
        //     });


        // this.dataService.dashboardFacade.toggleModifiedCurveBehaviorSubject$
        //     .subscribe(state => {
        //         this.ableToSave = state;
        //     });


        // this.dataService.dashboardFacade.getActivePos()
        //     .subscribe((activePos: any) => {
        //         if (activePos) {

        //             this.activePosString = activePos.value;
        //             this.adjustedFareHolder = `${activePos.value}AdjustedFare`;
        //         }
        //     });


        // Updates to dataService.currentBidPriceInfo
        // this.dataService.dashboardFacade.getCurrentBidPriceInfo()
        //     .subscribe((message: any) => {
        //         if (message.originalBidPrices.length > 0) {
        //             this.buckets = message.bucketDetails;
        //             this.dataService.currentBidPriceInfo.bucketDetails = this.buckets;
        //         }
        //     });
    }

    public resetNums() {
        this.numberLength = 0;
        console.log('resetNums ', this.numberLength)
    }

    private getDifference(array1, array2) {
        return array1.filter(object1 => {
            return !array2.some(object2 => {
                return object1.originalValue === object2.originalValue;
            });
        });
    }


    // public getMyActiveCabin() {

    //     // Out Temp this.checkForCabinSpecificUpdatedValues();
    //     if (this.dataService.updatedClientFlight) {
    //         this.setMinBucketValues(this.dataService.cabinSelected);
    //     }
    //     if (this.flightInfluencesForEachCabin.length > 0) {
    //         this.activeCabinInfluences = this.flightInfluencesForEachCabin[this.dataService.cabinSelected];

    //         this.dataService.currentBidPriceInfo.bidPriceConstraints = this.activeCabinInfluences.constraints;
    //         this.dataService.dashboardFacade.setCurrentBidPriceInfo(this.dataService.currentBidPriceInfo);
    //         this.$activeInfluenceBehaviorSubject.next(this.activeCabinInfluences);
    //         this.dataService.dashboardFacade.resetInfluencesBehaviorSubject$.next(false);
    //     }
    // }


    // Receives API Influences and converts them to support the UI

    // public processInfluencesForUi(bidPriceInfluences) {
    //     this.savedFlightInfluencesForEachCabinFromApi = bidPriceInfluences;
    //     this.flightInfluencesForEachCabin = bidPriceInfluences.map((inf: any, i) => {
    //         return this.setAllCabinInfluenceValues(inf, i);
    //     });
    //     this.showInfluenceControls = true;
    // }



    // Generates list for open, close elements
    // private setMinBucketValues(cabin): void {
    //     this.dataService.currentBidPriceInfo.bucketDetails = this.dataService.updatedClientFlight.cabinDetails[this.dataService.cabinSelected].bucketConfigs;
    //     this.dataService.currentBidPriceInfo.originalBidPrices = this.dataService.updatedClientFlight.cabinDetails[this.dataService.cabinSelected].originalBidPrices;
    //     this.dataService.currentBidPriceInfo.adjustedBidPrices = this.dataService.updatedClientFlight.cabinDetails[this.dataService.cabinSelected].adjustedBidPrices;
    //     this.dataService.currentBidPriceInfo.bookings = this.dataService.updatedClientFlight.cabinDetails[this.dataService.cabinSelected].bookings;

    //     const bookingsToSell = this.dataService.updatedClientFlight.cabinDetails[this.dataService.cabinSelected].lid - this.dataService.updatedClientFlight.cabinDetails[this.dataService.cabinSelected].bookings;
    //     this.dataService.dashboardFacade.setSeatsAvailable(bookingsToSell);

    //     if (this.initialMinBuckets.length !== this.dataService.currentBidPriceInfo.bucketDetails.length + 1) {
    //         this.initialMinBuckets = [];
    //         this.initialMinBuckets[0] = { bucketOrder: 0, bucketLetter: 'None', [`${this.activePosString}AdjustedFare`]: '' };

    //         this.dataService.currentBidPriceInfo.bucketDetails.map(item => {
    //             if (item[`${this.activePosString}AdjustedFare`] > 0) {
    //                 this.initialMinBuckets.push({ ...item })
    //             }
    //         });
    //     }
    // }


    // Sets object format correct for API post
    // Save process for cabin influences
    // Builds cabin specific Influences For Flights


    // Saves Modified values to adjusted 
    // public saveModifiedValues(num: number, cabinNum: number): void {
    //     if (this.ableToSave) {
    //         this.showInfluenceControls = false;
    //         this.applyModifiedToAdjusted = false;
    //         this.modifiedCurveActive = true;
    //         this.setConstraintOrderForSave();
    //         setTimeout(() => {
    //             this.applyModifiedToAdjusted = true;
    //             this.dataService.dashboardFacade.toggleModifiedCurveBehaviorSubject$.next(this.modifiedCurveActive);
    //         }, 0);
    //     }
    // }



    // Sets up returned influences into editable objects
    // public setAllCabinInfluenceValues(bpInf, idx: number): IFlightInfluencesByCabin {
    //     let selectedPartialFare = 0;
    //     let cabinSpecifier: any = {};
    //     let orderedList: IFlightInfluencesByCabin = {};
    //     let maxSeatsNum = 0;
    //     orderedList.constraints = [];

    //     Object.entries(bpInf).forEach((d: any, i) => {
    //         const elementOrder = bpHeaderAbbrev.findIndex(fi => {
    //             return d[0] === fi.constraint;
    //         });

    //         if (i > 1 && i < 8) {
    //             if (d[0] === ConstraintType.Multiply) {
    //                 d[1] = parseFloat(d[1]).toFixed(2)
    //             }
    //             if (d[0] === ConstraintType.PartialMin || d[0] === ConstraintType.PartialMax) {
    //                 if (d[0] === ConstraintType.PartialMax) {
    //                     if (d[1] !== '') {
    //                         maxSeatsNum = bpInf.maxSeats;
    //                     } else {
    //                         maxSeatsNum = 0;
    //                     }
    //                     orderedList.constraints[elementOrder] = { constraint: d[0], value: selectedPartialFare, updValue: d[1], maxSeats: maxSeatsNum };
    //                 } else if (d[0] === ConstraintType.PartialMin) {
    //                     orderedList.constraints[elementOrder] = { constraint: d[0], value: selectedPartialFare, updValue: d[1] };
    //                 }
    //             } else {
    //                 orderedList.constraints[elementOrder] = { constraint: d[0], value: d[1] };
    //             }
    //         } else {

    //             if (i === 0) {
    //                 orderedList.legMasterKey = bpInf.legMasterKey;
    //             } else if (i === 1) {
    //                 orderedList.cabinLetter = bpInf.cabinLetter;
    //             }
    //         }
    //     });

    //     cabinSpecifier.constraints = this.generateCabinInfluenceLists(orderedList);
    //     return cabinSpecifier;
    // }



    // Generates UI formatted objects
    // private generateCabinInfluenceLists(list: any): BidPriceConstraint {
    //     return list.constraints.map((ts: any, id: number) => {
    //         return this.constraintService.generateBidPriceInfluenceModifiers(ts, id);
    //     });
    // }



    // // Gets fare class value from bucket letter
    // public getPMinSelectedOriginalValue(element: number): string {

    //     let bucketIdx = '';
    //     if (this.activeCabinInfluences && this.activeCabinInfluences.constraints[element].originalValue !== '') {

    //         this.initialMinBuckets.findIndex(imb => {
    //             if (imb.bucketLetter === this.activeCabinInfluences.constraints[element].originalValue) {
    //                 bucketIdx = imb[this.adjustedFareHolder];
    //             }
    //         })
    //     }
    //     return bucketIdx;
    // }



    // Called from Save Influences button press
    // public setConstraintOrderForSave(): void {

    //     this.dataService.currentCabin = this.dataService.cabinSelected;
    //     this.dataService.dashboardFacade.toggleModifiedCurveBehaviorSubject$.next(false);
    //     Object.entries(this.modifiers).forEach((d: any, i) => {
    //         const index = this.savedInfluenceMods.findIndex(c => c.constraint === d[0]);
    //         if (this.savedInfluenceMods[index]) {
    //             this.savedFlightInfluencesForEachCabinFromApi[this.dataService.cabinSelected][d[0]] = this.savedInfluenceMods[index].updValue;
    //         } else {
    //             this.savedFlightInfluencesForEachCabinFromApi[this.dataService.cabinSelected][d[0]] = d[1];
    //         }
    //     })

    //     console.log('*** SAVING TO API.... Master Key:  ', this.dataService.dashboardFacade.dashboardAPI.selectedMasterKey, '\nInfluences: ', this.savedFlightInfluencesForEachCabinFromApi[this.dataService.cabinSelected], '\n');

    //     // Processing influence values on the Bid curve
    //     this.savedFlightInfluencesForEachCabinFromApi[this.dataService.cabinSelected]['maxSeats'] = this.activeCabinInfluences.constraints[5].maxSeats;
    //     this.dataService.dashboardFacade.postValuesToFlightClient(this.dataService.dashboardFacade.dashboardAPI.selectedMasterKey, [this.savedFlightInfluencesForEachCabinFromApi[this.dataService.cabinSelected]]);
    // }


    // Returns ng-select selected pair: class : None
    // public getPMinSelectedValue(item1Selected): string {
    //     return item1Selected.bucketOrder !== 0 ? `${item1Selected.bucketLetter}: ${item1Selected[this.adjustedFareHolder]}` : `${item1Selected.bucketLetter}`;
    // }



    // Only Numbers with Decimals
    public keyPressNumbersDecimal(event): boolean {

        var charCode = (event.which) ? event.which : event.keyCode;
        if (charCode != 46 && charCode > 31
            && (charCode < 48 || charCode > 57)) {
            event.preventDefault();
            return false;
        }
        return true;
    }

    // // Only Integer Numbers
    // public keyPressNumbers(event, numDigits): boolean {

    //     var charCode = (event.which) ? event.which : event.keyCode;
    //     // Only Numbers 0-9
    //     if (event.target.value.length > numDigits) {
    //         event.preventDefault();
    //     } else {
    //         if ((charCode < 48 || charCode > 57)) {
    //             event.preventDefault();
    //             return false;
    //         } else {
    //             return true;
    //         }
    //     }
    // }



    // From value input min,max,mult,
    // public myInputOnChange(item, idx: number): void {
    //     /// Input Validators

    //     // Mult
    //     if (idx === 0) {
    //         item.updValue < 0 ? item.updValue = 1 : item.updValue;
    //         // Min
    //     } else if (idx === 2) {
    //         item.updValue < 0 ? item.updValue = 0 : item.updValue;
    //         // Max
    //     } else if (idx === 3) {
    //         item.updValue < 0 ? item.updValue = 0 : item.updValue;
    //         // pMax
    //     } else if (idx === 5) {
    //         item.maxSeats < 0 ? 0 : item.maxSeats > 50 ? 50 : item.maxSeats;
    //     }

    //     this.savedInfluenceMods = [];
    //     this.savedInfluenceMods.push(item);

    //     this.dataService.dashboardFacade.toggleModifiedCurveBehaviorSubject$.next(true);

    //     this.flightInfluencesForEachCabin[this.dataService.cabinSelected].constraints.forEach((d) => {

    //         if (d.updValue === null) {
    //             delete item.updValue;
    //             item.value = this.modifiers[d.constraint];
    //         }
    //         if (item.constraint !== d.constraint) {

    //             if ((d.updValue || d.updValue === this.modifiers[d.constraint]) && typeof d.updValue !== 'string') {
    //                 this.savedInfluenceMods.push(d);
    //             } else if (d.updValue && typeof d.updValue === 'string' && d.updValue !== d.originalValue) {
    //                 this.savedInfluenceMods.push(d);
    //             }
    //         }
    //     });

    //     this.renderPreviewCurveViaModifiers();
    // }


    // Renders preview curve based on Base Curve
    // public renderPreviewCurveViaModifiers() {
    //     this.savedInfluenceMods.forEach((d) => {
    //         this.dataService.dashboardFacade.setInfluenceModifierUpdates([this.getAdjustedVals(d), d.originalValue, d.constraint, this.activeCabinInfluences.constraints[5].maxSeats]);
    //     });
    // }


    // Returns adjusted value to set influences Subject
    // public getAdjustedValue(metric: any): string {

    //     const numPlaces = metric.constraint === 'mult' ? 2 : 0;

    //     if (metric.constraint === 'mult') {
    //         metric = this.setMultToDecimal(metric)
    //     }

    //     const diff = Math.abs(metric.originalValue - metric.updValue);
    //     return diff.toFixed(numPlaces)
    // }


    // Fills input and value modifier fields 
    // public getAdjustedVals(element: any): any {

    //     if (element.constraint === 'mult' && element.updValue) {
    //         element = this.setMultToDecimal(element)
    //     }

    //     if (element.updValue || element.updValue === 0) {
    //         if (element.constraint === 'partialMax' || element.constraint === 'partialMin') {
    //             return element.value;
    //         } else {
    //             return element.updValue;
    //         }

    //     } else if (element.updValue !== this.modifiers[element.constraint]) {
    //         return element.value;
    //     } else {
    //         return element.originalValue;
    //     }
    // }

    // private setMultToDecimal(val): number {
    //     val.originalValue = parseFloat(val.originalValue).toFixed(2)
    //     val.value = parseFloat(val.value).toFixed(2)
    //     return val
    // }

    // // Color cells pos or neg or neutral
    // public getInfluenceRatio(val: any): string {

    //     if (val.constraint === 'mult') {
    //         val = this.setMultToDecimal(val)
    //     }

    //     if (val.updValue > val.originalValue) {
    //         return 'green';

    //     } else if (val.updValue < val.originalValue) {
    //         return 'red';

    //     } else if (val.updValue === val.originalValue) {
    //         return 'black';
    //     }
    // }


    // ng-select in template
    // public selectPartialMinFareClassFromDropdown(bucket, idx: number, metric: number): void {
    //     this.dataService.dashboardFacade.toggleModifiedCurveBehaviorSubject$.next(true);

    //     if (bucket.bucketLetter === 'None') {
    //         delete this.activeCabinInfluences.constraints[metric].updValue;
    //         this.activeCabinInfluences.constraints[metric].value = '';
    //         this.activeCabinInfluences.constraints[metric].originalValue = '';
    //     } else {
    //         this.activeCabinInfluences.constraints[metric].updValue = bucket.bucketLetter;
    //         this.activeCabinInfluences.constraints[metric].value = this.initialMinBuckets[idx][this.adjustedFareHolder];
    //     }

    //     this.myInputOnChange(this.activeCabinInfluences.constraints[metric], metric);
    // }


    // From seat Input enter number
    // public partialMaxSeatValues(value: any): void {

    //     if (value.maxSeats < 0) {
    //         this.activeCabinInfluences.constraints[5].maxSeats = 0;
    //     } else if (value.maxSeats > 99) {
    //         value.maxSeats = 99;
    //     } else {
    //         if (this.activeCabinInfluences.constraints[5].maxSeats !== value.maxSeats) {
    //             this.activeCabinInfluences.constraints[5].maxSeats = value.maxSeats;
    //         }
    //     }

    //     this.dataService.dashboardFacade.toggleModifiedCurveBehaviorSubject$.next(true);
    //     this.myInputOnChange(this.activeCabinInfluences.constraints[5], 5);
    // }



    // From Clear Influences Button
    // public resetInfluences(): void {

    //     this.dataService.dashboardFacade.resetInfluencesBehaviorSubject$.next(true);
    //     this.activeCabinInfluences = this.resetToDefaultModifiers();
    //     this.dataService.currentBidPriceInfo.bidPriceConstraints = this.activeCabinInfluences.constraints;
    //     this.dataService.dashboardFacade.setCurrentBidPriceInfo(this.dataService.currentBidPriceInfo);
    //     this.$activeInfluenceBehaviorSubject.next(this.activeCabinInfluences);

    //     setTimeout(() => {
    //         this.setResetInfluencesConstraintModelForAPI();
    //     }, 0);
    // }



    // From Clear Influence button press
    // public resetToDefaultModifiers(): IFlightInfluencesByCabin {

    //     this.dataService.dashboardFacade.toggleModifiedCurveBehaviorSubject$.next(false);

    //     this.flightInfluencesForEachCabin[this.dataService.cabinSelected].constraints.map((d, id) => {

    //         Object.entries(this.modifiers).forEach((m: any, i) => {

    //             if (d.constraint === m[0]) {
    //                 this.flightInfluencesForEachCabin[this.dataService.cabinSelected].constraints[id].value = m[1];
    //                 if (d.constraint === 'partialMin' || d.constraint === 'partialMax') {
    //                     d.originalValue = m[1];
    //                     if (d.updValue) {
    //                         delete d.updValue;
    //                     }
    //                 } else if (d.constraint === 'mult') {
    //                     this.setMultToDecimal(d);

    //                 } else {
    //                     if (d.updValue) {
    //                         delete d.updValue;
    //                     }
    //                     d.originalValue = m[1];
    //                 }
    //             }
    //         });

    //         this.dataService.dashboardFacade.setInfluenceModifierUpdates([this.getAdjustedVals(d), d.originalValue, d.constraint, 0]);
    //     });
    //     return this.flightInfluencesForEachCabin[this.dataService.cabinSelected];
    // }



    // public setResetInfluencesConstraintModelForAPI() {
    //     const selectedCabinHolder = this.savedFlightInfluencesForEachCabinFromApi[this.dataService.cabinSelected];
    //     Object.entries(selectedCabinHolder).forEach((d: any, i) => {
    //         this.activeCabinInfluences.constraints.forEach((x, i) => {
    //             if (d[0] === x.constraint) {
    //                 this.savedFlightInfluencesForEachCabinFromApi[this.dataService.cabinSelected][d[0]] = x.value;
    //             }
    //         });
    //     });

    //     // Processing influence values on the Bid curve
    //     this.savedFlightInfluencesForEachCabinFromApi[this.dataService.cabinSelected]['maxSeats'] = 0;
    //     this.savedInfluenceMods = [];
    //     this.dataService.dashboardFacade.postValuesToFlightClient(this.dataService.dashboardFacade.dashboardAPI.selectedMasterKey, [this.savedFlightInfluencesForEachCabinFromApi[this.dataService.cabinSelected]]);
    // }



    // Checks for unsaved updates to cabins specific influences and reactivates active curve 

    // public checkForCabinSpecificUpdatedValues() {
    //     this.savedInfluenceMods = [];

    //     this.flightInfluencesForEachCabin[this.dataService.currentCabin].constraints.forEach((d, i) => {

    //         if ((d.updValue || d.updValue === 0) && typeof d.updValue !== 'string') {
    //             this.savedInfluenceMods.push(d);
    //         } else if (typeof d.updValue === 'string' && d.updValue !== d.originalValue) {

    //             this.getPMinSelectedValue(d);
    //             this.savedInfluenceMods.push(d);
    //         }
    //     });

    //     if (this.savedInfluenceMods.length > 0) {
    //         this.dataService.dashboardFacade.toggleModifiedCurveBehaviorSubject$.next(true);
    //         this.renderPreviewCurveViaModifiers();
    //     } else {
    //         this.dataService.dashboardFacade.toggleModifiedCurveBehaviorSubject$.next(false);
    //     }
    //     this.$activeInfluenceBehaviorSubject.next(this.activeCabinInfluences);
    // }
}