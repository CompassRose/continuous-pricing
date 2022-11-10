import { Component, ViewChildren, OnInit, AfterViewInit, QueryList } from '@angular/core';
import { ContinousColors, ColorObject } from '../dashboard-constants';
import { Subscription, fromEvent, Subject } from 'rxjs'
import { SharedDatasetService } from '../shared-datasets.service';
import { KeyBoardService } from '../keyboard.service';
import { debounceTime, distinctUntilChanged, tap, filter } from 'rxjs/operators';

export interface BidPriceCurvePoints {
  x: number;
  y: number;
}

export interface TempBucketDetails {
  bookings: number;
  Sa: number;
  protections: number;
}

@Component({
  selector: 'draggable-aus',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})


export class ContinousPricingComponent implements OnInit {

  @ViewChildren("queryProtectionsInput") queryProtectionsInput: QueryList<any>;

  public colorCollections: ColorObject[] = ContinousColors;
  private subscription = new Subscription();
  public collapsePanel = true;

  autoTicks = false;
  disabled = false;
  invert = true;
  max = 150;
  min = 0;
  showTicks = true;
  step = 1;
  thumbLabel = true;
  value = this.sharedDatasetService.totalBookingsCollector;
  vertical = false;
  tickInterval = 1;
  sliderCounter = 0;

  public tempBucketHolderStatic = [...this.sharedDatasetService.bucketDetails]

  public bookingSlider$ = new Subject<any>();

  constructor(
    public sharedDatasetService: SharedDatasetService,
    public keyBoardService: KeyBoardService) {

    this.bookingSlider$.pipe(
      filter(Boolean),
      debounceTime(120),

      tap((event) => {
        let collObj = [...this.tempBucketHolderStatic]
        this.sharedDatasetService.totalBookingsCollector = event.value;
        let counter = 0;
        let activeElement = this.sharedDatasetService.bucketDetails.length - 1;

        this.loadFactorFillPercent(event.value);

        for (let b = 0; b < this.tempBucketHolderStatic.length; b++) {
          collObj[b].bookings = 0;
          collObj[b].protections = this.tempBucketHolderStatic[b].protections;
          collObj[b].Sa = this.tempBucketHolderStatic[b].Aus;
        }

        for (let i = 0; i < this.sharedDatasetService.totalBookingsCollector; i++) {
          collObj[activeElement].bookings += 1;
          counter++;
          if (counter === collObj[activeElement].protections) {
            activeElement > 0 ? activeElement -= 1 : 0;
            counter = 0;
          }

          collObj.forEach((bd, i) => {
            if (bd.Sa > 0) {
              bd.Sa -= 1;
            }
          })
        }

        this.sharedDatasetService.bucketDetailsBehaviorSubject$.next(false);
      })
    )
      .subscribe();
  }

  public ngOnInit() {

    // this.sharedDatasetService.totalBookingsCollector = this.sharedDatasetService.generateBookingCounts('bookings');

    // this.sliderCounter = this.sharedDatasetService.totalBookingsCollector;
    // console.log('this.sharedDatasetService.totalBookingsCollector ', this.sharedDatasetService.totalBookingsCollector)
  }


  public togglePanelState() {
    this.collapsePanel = !this.collapsePanel;
  }



  public loadFactorFillPercent(value: number) {
    const percent = Math.round((value / this.sharedDatasetService.maxAuValue) * 100);
    var elem = document.getElementById("myBar");
    //console.log('Move ', value, ' percent ', percent, ' elem ', elem)
    elem.style.width = percent + "%";
    elem.innerHTML = percent + "%";
  }


  // public setActiveBucket() {
  //   var i = 0;
  //   const move = function () {
  //     if (i == 0) {
  //       i = 1;
  //       var elem = document.getElementById("myBar");
  //       var width = 10;
  //       var id = setInterval(frame, 10);
  //       function frame() {
  //         if (width >= 100) {
  //           clearInterval(id);
  //           i = 0;
  //         } else {
  //           width++;
  //           elem.style.width = width + "%";
  //           elem.innerHTML = width + "%";
  //         }
  //       }
  //     }
  //   }
  // }





  // public selectProtections() {
  //   this.subscription.unsubscribe();

  //   this.queryProtectionsInput.forEach((ref: any, index: number) => {

  //     this.subscription = fromEvent(ref.nativeElement, 'keyup')
  //       .pipe(
  //         map((event: any) => {

  //           this.keyBoardService.myInputOnChangeProtections(Number(event.target.value), index, event.keyCode)
  //           return event.target.value;
  //         }),
  //         debounceTime(1000),
  //         distinctUntilChanged()
  //       )
  //       .subscribe((text: string) => text);
  //   });
  // }


  // public keyPressNumbersDecimal(event): boolean {

  //   var charCode = (event.which) ? event.which : event.keyCode;
  //   if (charCode != 46 && charCode > 31
  //     && (charCode < 48 || charCode > 57)) {
  //     event.preventDefault();
  //     return false;
  //   }
  //   return true;
  // }


  // // Only Integer Numbers
  // public keyPressNumbers(event, numDigits): boolean {
  //   let charCode = (event.which) ? event.which : event.keyCode;
  //   let returnBool: boolean = true;
  //   // Only Numbers 0-9
  //   if (event.target.value.length > numDigits) {
  //     event.preventDefault();
  //   } else {
  //     if ((charCode < 48 || charCode > 57)) {
  //       event.preventDefault();
  //       returnBool = false;
  //       return false;
  //     } else {
  //       returnBool = false;
  //       return true;
  //     }
  //   }
  //   return returnBool;
  // }


};

