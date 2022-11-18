import { Component, OnInit } from '@angular/core';
import { ContinousColors, ColorObject } from '../dashboard-constants';
import { Subject } from 'rxjs'
import { SharedDatasetService } from '../shared-datasets.service';
import { debounceTime, tap, filter } from 'rxjs/operators';

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

  public colorCollections: ColorObject[] = ContinousColors;
  public collapsePanel = true;

  autoTicks = false;
  disabled = false;
  invert = true;
  max = 189;
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
    public sharedDatasetService: SharedDatasetService) {

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


};

