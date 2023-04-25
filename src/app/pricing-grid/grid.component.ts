import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { Subscription, map, merge, Observable, pairwise, scan, Subject } from 'rxjs';
import { SharedDatasetService } from '../services/shared-datasets.service';
import { BookingControlService } from '../services/booking-control-service';
import { KeyCode } from './lib/keycodes';
import { shortcut, sequence } from './lib/shortcuts';
import { PathToAssets } from '../dashboard-constants';
import { environment } from 'src/environments/environment.prod';
import { ThemeControlService } from '../services/theme-control.service';
import { BidPriceAspNetService, BidPriceWebViewService } from '../api/au-visualization.service';

export function animationFrame({
  requestAnimationFrame,
  cancelAnimationFrame
}: Window): Observable<DOMHighResTimeStamp> {
  return new Observable(subscriber => {
    let id = NaN;

    const callback = (timestamp: DOMHighResTimeStamp) => {
      subscriber.next(timestamp);
      id = requestAnimationFrame(callback);
    };

    id = requestAnimationFrame(callback);

    return () => {
      cancelAnimationFrame(id);
    };
  });
}


@Component({
  selector: 'screen-content',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})


export class ContinousPricingComponent implements OnInit {

  public slider: any = document.getElementById("myRange");
  public output: any = document.getElementById("demo");

  public currentApplicationVersion = environment.appVersion;

  readonly fps$ = animationFrame(this.documentRef.defaultView)
    .pipe(
      pairwise(),
      scan((acc, [prev, cur]) => {

        if (acc.push(1000 / (cur - prev)) > 60) {
          acc.shift();
          //  console.log('pairwise ', acc)
        } return acc;
      }, []),
      map(
        arr => Math.round(arr.reduce((acc, cur) => acc + cur, 0) / arr.length))
    );


  // Holder for toggle single shortcut
  public lastSelectedMetric = 0;

  public pathToAssets = PathToAssets;
  public sub: Subscription;
  public shortcuts$: Observable<string>;

  public frameRateCounterState = false;
  public influencesExpanded = true;

  public selectedFlightKey: number // = 1294409;
  public selectedFlightValues: any = {};

  public selectedFlightIndex = 0;
  public selectedCabinIndex = 2;


  public pointsDeSelected = false;
  // public pointSelected = false;


  constructor(
    @Inject(DOCUMENT) private readonly documentRef: Document,
    //private bidPriceWebViewService: BidPriceWebViewService,
    public dashboardApi: BidPriceAspNetService,
    public bookingControlService: BookingControlService,
    public themeControlService: ThemeControlService,
    public sharedDatasetService: SharedDatasetService) {
    // console.log('bidPriceWebViewService ', bidPriceWebViewService)
    //this.bidPriceWebViewService.flight_Get();

    //this.selectedFlightValues = {} //sharedDatasetService.mockFlightValues[0];
    //this.selectedFlightKey = this.sharedDatasetService.mockFlightValues[0].masterKey;

  }


  // Activates Continuous price curve
  public toggleFrameRate() {
    this.frameRateCounterState = !this.frameRateCounterState;
  }



  public cabinSelection(ev) {
    this.selectedCabinIndex = ev.id;
    //console.log('cabinSelection ', ev, ' this.selectedCabinIndex ', this.selectedCabinIndex)
  }


  // Called onStart and from flight dropdown
  public flightSelectControl(ev) {

    this.sharedDatasetService.totalBookingsCollector = 0;
    const index = this.sharedDatasetService.mockFlightValues.findIndex(mk => mk.masterKey === ev.masterKey);

    this.selectedFlightIndex = index;

    // console.log('flightSelectControl ', ev, ' selectedFlightIndex ', this.selectedFlightIndex)
    this.selectedFlightValues = this.sharedDatasetService.mockFlightValues[index];

    this.selectedFlightKey = ev.masterKey;
    this.sharedDatasetService.setFlightClient(index);

    // this.bookingControlService.tempBucketHolderStatic = [...this.sharedDatasetService.bucketDetails];
    // this.bookingControlService.bookingSlider$.next(this.sharedDatasetService.totalBookingsCollector);
  }


  public deselectAllPoints() {
    console.log('           ..............  deselectAllPoints deselectAllPoints ', this.pointsDeSelected);
    this.pointsDeSelected = !this.pointsDeSelected;
    this.sharedDatasetService.multiSelectedNodeSubject$.next([]);
  }


  public ngOnInit() {

    this.dashboardApi.mockFlightClientValues()
      .subscribe((flight: any) => {

        console.log('flight ', flight)

        this.sharedDatasetService.apiBucketDetails = flight;

        window.localStorage.setItem('archivedBucketCollection', JSON.stringify(JSON.parse(JSON.stringify(this.sharedDatasetService.apiBucketDetails))));

        window.localStorage.setItem('savedBucketCollection', JSON.stringify(JSON.parse(JSON.stringify(this.sharedDatasetService.apiBucketDetails))));


        this.sharedDatasetService.bucketDetails = this.sharedDatasetService.apiBucketDetails[0];

        this.flightSelectControl(this.sharedDatasetService.mockFlightValues[0]);

        //   // this.bookingControlService.change(this.sharedDatasetService.totalBookingsCollector);

      })


    this.sharedDatasetService.updatedClientFlight$.next(this.sharedDatasetService.mockFlightValues);



    this.bookingControlService.bookingSlider$
      .subscribe(response => {
        // console.log('BOOK response ', response)
        this.sharedDatasetService.generateInverseDetails();
      })

    const cmdJ = merge(
      shortcut([KeyCode.MetaRight, KeyCode.KeyJ]),
      shortcut([KeyCode.MetaLeft, KeyCode.KeyJ])
    );


    const ctrlL = merge(
      shortcut([KeyCode.ControlLeft, KeyCode.KeyL]),
      shortcut([KeyCode.ControlRight, KeyCode.KeyL])
    );


    const abc = shortcut([KeyCode.KeyA, KeyCode.KeyB, KeyCode.KeyC])
      .pipe(
        sequence()
      );

    const ctrlLeft = shortcut([
      KeyCode.ControlLeft,
    ]).pipe(sequence());

    const key1 = shortcut([
      //   KeyCode.KeyQ,
      //   KeyCode.KeyW,
      //   KeyCode.KeyE,
      KeyCode.KeyR,
      KeyCode.Digit1,
      //KeyCode.Digit2,
      //KeyCode.ControlLeft,
      //   KeyCode.KeyT,
      //   KeyCode.KeyY,
    ]).pipe(sequence());

    const key2 = shortcut([
      KeyCode.Digit2,
    ]).pipe(sequence());

    const key3 = shortcut([
      KeyCode.Digit3,
    ]).pipe(sequence());

    const key4 = shortcut([
      KeyCode.Digit4,
    ]).pipe(sequence());


    // const commaDot = shortcut([KeyCode.Comma, KeyCode.Period]);
    // const shiftNext = merge(
    //   shortcut([KeyCode.ShiftLeft, KeyCode.Backquote]),
    //   shortcut([KeyCode.ShiftRight, KeyCode.Backquote])
    // );
    const controlAlt = merge(
      shortcut([KeyCode.AltLeft, KeyCode.ControlLeft]),
      shortcut([KeyCode.AltRight, KeyCode.ControlRight])
    );
    // const altSpace = merge(
    //   shortcut([KeyCode.AltLeft, KeyCode.Space]),
    //   shortcut([KeyCode.AltRight, KeyCode.Space])
    // );

    this.shortcuts$ = merge(
      //cmdJ,
      //controlAlt,
      //  abc,
      ctrlLeft,
      // key1,
      // key2,
      // key4,
      // key3
      // commaDot,
      //  shiftNext,
      //  altK,
      //  altSpace
    ).pipe(map((arr) => {
      // console.log('arr ', arr)
      return arr.map((a) => {
        if (this.sharedDatasetService.selectedMetric !== 0) {
          this.lastSelectedMetric = this.sharedDatasetService.selectedMetric;
        }
        if (a.ctrlKey) {
          if (this.sharedDatasetService.selectedMetric === 0) {
            this.lastSelectedMetric = 0
          }
          this.sharedDatasetService.selectedMetric = 0;
        } else if (a.code === 'Digit1') {
          this.sharedDatasetService.selectedMetric = 0;
        } else if (a.code === 'Digit2') {
          this.sharedDatasetService.selectedMetric = 1;
        } else if (a.code === 'Digit3') {
          this.sharedDatasetService.selectedMetric = 2;
        } else if (a.code === 'Digit4') {
          this.sharedDatasetService.selectedMetric = 3;

        } else {
          if (this.lastSelectedMetric > 0) {
            this.sharedDatasetService.selectedMetric = this.lastSelectedMetric;
          }
        }
        return a.code
      }).join("+")
    }))
  }



  public collapseInfluences() {
    //console.log('collapseInfluences ', this.influencesExpanded)
    this.influencesExpanded = !this.influencesExpanded;
  }
};

