import { Component, ViewChildren, AfterViewInit, ElementRef, QueryList } from '@angular/core';
import { ContinousColors, ColorObject } from '../dashboard-constants';
import { Subscription, fromEvent } from 'rxjs'
import { map, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SharedDatasetService } from '../shared-datasets.service';
import { KeyBoardService } from '../keyboard.service';

export interface BidPriceCurvePoints {
  x: number;
  y: number;
}


@Component({
  selector: 'draggable-aus',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})


export class ContinousPricingComponent implements AfterViewInit {

  @ViewChildren("queryProtectionsInput") queryProtectionsInput: QueryList<any>;

  public colorCollections: ColorObject[] = ContinousColors;
  private subscription = new Subscription();
  public collapsePanel = true;

  autoTicks = false;
  disabled = false;
  invert = false;
  max = 150;
  min = 0;
  showTicks = false;
  step = 1;
  thumbLabel = true;
  value = 0;
  vertical = false;
  tickInterval = 1;
  sliderCounter = 0;

  constructor(
    public sharedDatasetService: SharedDatasetService,
    public keyBoardService: KeyBoardService) { }


  public togglePanaelState() {
    this.collapsePanel = !this.collapsePanel;
  }

  // Bookings Slider
  public onSliderChange(ev) {


    if (this.sliderCounter < ev.value) {

      if (ev.value <= this.sharedDatasetService.bucketDetails[0].Aus) {

        this.sharedDatasetService.bucketDetails[this.sharedDatasetService.activeBookingElement].bookings += 1;

        if (this.sharedDatasetService.bucketDetails[this.sharedDatasetService.activeBookingElement].bookings === this.sharedDatasetService.bucketDetails[this.sharedDatasetService.activeBookingElement].protections) {
          this.sharedDatasetService.activeBookingElement > 0 ? this.sharedDatasetService.activeBookingElement -= 1 : 0;
        }

        this.sharedDatasetService.bucketDetails.forEach((sa, i) => {

          if (this.sharedDatasetService.bucketDetails[i].Sa > 0) {

            this.sharedDatasetService.bucketDetails[i].Sa -= 1;
          }
        })

        //console.log('UPPPP **** SliderChange ', '\nev.value', ev.value, '\ncounter ', this.sliderCounter)
      }

    } else {

      if (ev.value >= 0) {

        if (this.sharedDatasetService.bucketDetails[this.sharedDatasetService.activeBookingElement].bookings > 0) {
          this.sharedDatasetService.bucketDetails[this.sharedDatasetService.activeBookingElement].bookings -= 1;
        }


        if (this.sharedDatasetService.bucketDetails[this.sharedDatasetService.activeBookingElement].bookings === 0) {

          if (this.sharedDatasetService.activeBookingElement < this.sharedDatasetService.bucketDetails.length - 1) {
            this.sharedDatasetService.activeBookingElement += 1;
          }

        }

        this.sharedDatasetService.bucketDetails.forEach((sa, i) => {

          if (this.sharedDatasetService.bucketDetails[i].Sa < this.sharedDatasetService.bucketDetails[i].Aus) {
            this.sharedDatasetService.bucketDetails[i].Sa += 1;
          }

        })

        //console.log('DOWNNN**** SliderChange ', '\nev.value ', ev.value, '\nsliderCounter ', this.sliderCounter)
      }
    }

    this.sliderCounter = ev.value;

    this.sharedDatasetService.bucketDetailsBehaviorSubject$.next([this.sharedDatasetService.bucketDetails, false])

    var i = 0;

    this.loadFactorFillPercent(this.sliderCounter)

  }

  public loadFactorFillPercent(value: number) {
    const percent = Math.round((value / this.sharedDatasetService.maxAuValue) * 100);
    var elem = document.getElementById("myBar");
    //console.log('Move ', value, ' percent ', percent, ' elem ', elem)
    elem.style.width = percent + "%";
    elem.innerHTML = percent + "%";
  }


  public setActiveBucket() {
    var i = 0;
    const move = function () {
      if (i == 0) {
        i = 1;
        var elem = document.getElementById("myBar");
        var width = 10;
        var id = setInterval(frame, 10);
        function frame() {
          if (width >= 100) {
            clearInterval(id);
            i = 0;
          } else {
            width++;
            elem.style.width = width + "%";
            elem.innerHTML = width + "%";
          }
        }
      }
    }
  }


  public selectProtections() {
    this.subscription.unsubscribe();

    this.queryProtectionsInput.forEach((ref: any, index: number) => {

      this.subscription = fromEvent(ref.nativeElement, 'keyup')
        .pipe(
          map((event: any) => {

            this.keyBoardService.myInputOnChangeProtections(Number(event.target.value), index, event.keyCode)
            return event.target.value;
          }),
          debounceTime(1000),
          distinctUntilChanged()
        )
        .subscribe((text: string) => text);
    });
  }



  public ngAfterViewInit() {
    //console.log('Temp reference variable => ', this.queryProtectionsInput, ' test ', test.nativeElement);
    this.selectProtections();
  }


  public keyPressNumbersDecimal(event): boolean {

    var charCode = (event.which) ? event.which : event.keyCode;
    if (charCode != 46 && charCode > 31
      && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }


  // Only Integer Numbers
  public keyPressNumbers(event, numDigits): boolean {
    let charCode = (event.which) ? event.which : event.keyCode;
    let returnBool: boolean = true;
    // Only Numbers 0-9
    if (event.target.value.length > numDigits) {
      event.preventDefault();
    } else {
      if ((charCode < 48 || charCode > 57)) {
        event.preventDefault();
        returnBool = false;
        return false;
      } else {
        returnBool = false;
        return true;
      }
    }
    return returnBool;
  }


};

