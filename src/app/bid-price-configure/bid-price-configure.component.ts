
import { Component, Input } from '@angular/core';
import { IFlightInfluencesByCabin, BidPriceConstraint } from '../models/dashboard.model';
import { ConstraintService } from '../services/constraint.service';
import { SharedDatasetService } from '../services/shared-datasets.service';


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
    public showInfluenceBody = true;
    public themeSwitchMode = 'light';
    public maxSeats = 0;
    public openClassSelected: string = 'P';

    @Input()
    set collapseInfluences(state: boolean) {
        this.showInfluenceBody = !this.showInfluenceBody;
        // console.log(' -----------------   state ', state)

    }

    @Input()
    set themeSwitch(state: string) {
        this.themeSwitchMode = state;
        //  console.log('themeSwitch ', state)

    }

    constructor(
        public sharedDatasetService: SharedDatasetService,
        public constraintService: ConstraintService
    ) {


        this.sharedDatasetService.resetDefaultSubject$
            .subscribe(response => {
                if (response) {
                    //  console.log('resetDefaultSubject ', response)
                    const staticModifierObj = { mult: 1.00, addSub: 0, partialMax: '' };
                }
            })
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


    // From seat Input enter number
    public partialMaxSeatValues(value: any): void {

        console.log('partialMaxSeatValues ', value)
        // if (value.maxSeats < 0) {
        //     this.activeCabinInfluences.constraints[5].maxSeats = 0;
        // } else if (value.maxSeats > 99) {
        //     value.maxSeats = 99;
        // } else {
        //     if (this.activeCabinInfluences.constraints[5].maxSeats !== value.maxSeats) {
        //         this.activeCabinInfluences.constraints[5].maxSeats = value.maxSeats;
        //     }
        // }

        // this.dataService.dashboardFacade.toggleModifiedCurveBehaviorSubject$.next(true);
        // this.myInputOnChange(this.activeCabinInfluences.constraints[5], 5);
    }

    // ng-select in template
    public selectPartialMinFareClassFromDropdown(bucket, idx: number, metric: number): void {
        console.log('selectPartialMinFareClassFromDropdown ', bucket, ' idx ', idx, ' metric ', metric);

        this.openClassSelected = bucket;

        // this.dataService.dashboardFacade.toggleModifiedCurveBehaviorSubject$.next(true);

        // if (bucket.bucketLetter === 'None') {
        //     delete this.activeCabinInfluences.constraints[metric].updValue;
        //     this.activeCabinInfluences.constraints[metric].value = '';
        //     this.activeCabinInfluences.constraints[metric].originalValue = '';
        // } else {
        //     this.activeCabinInfluences.constraints[metric].updValue = bucket.bucketLetter;
        //     this.activeCabinInfluences.constraints[metric].value = this.initialMinBuckets[idx][this.adjustedFareHolder];
        // }

        // this.myInputOnChange(this.activeCabinInfluences.constraints[metric], metric);
    }

    // Generates UI formatted objects
    private generateCabinInfluenceLists(list: any): BidPriceConstraint {
        return list.constraints.map((ts: any, id: number) => {
            return this.constraintService.generateBidPriceInfluenceModifiers(ts, id);
        });
    }


}