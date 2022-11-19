import { Component, OnInit } from '@angular/core';
import { ContinousColors, ColorObject } from '../dashboard-constants';
import { Subject } from 'rxjs'
import { SharedDatasetService } from '../shared-datasets.service';
import { debounceTime, tap, filter } from 'rxjs/operators';
import { BookingControlService } from '../booking-controls';

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

  // autoTicks = false;
  // disabled = false;
  // invert = true;
  // max = 189;
  // min = 0;
  // showTicks = true;
  // step = 1;
  // thumbLabel = true;
  // value = this.sharedDatasetService.totalBookingsCollector;
  // vertical = false;
  // tickInterval = 1;
  // sliderCounter = 0;


  constructor(
    public bookingControlService: BookingControlService,
    public sharedDatasetService: SharedDatasetService) {


  }

  public ngOnInit() { }


  public togglePanelState() {
    this.collapsePanel = !this.collapsePanel;
  }

};

