import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { Subscription, map, merge, Observable, debounceTime, of, switchMap, BehaviorSubject, pairwise, scan, combineLatest, Subject } from 'rxjs';
import { SharedDatasetService } from '../services/shared-datasets.service';
import { BookingControlService } from '../services/booking-control-service';
import { KeyCode } from './lib/keycodes';
import { shortcut, sequence } from './lib/shortcuts';
import { PathToAssets } from '../dashboard-constants';
import { environment } from 'src/environments/environment.prod';
import { ThemeControlService } from '../services/theme-control.service';
import { BidPriceAspNetService, BidPriceWebViewService } from '../api/au-visualization.service';
import { FlightClientDetails, BucketStructure, FlightObject, CompetitiveFareDetails, CabinContinuousFares } from '../models/dashboard.model';

import { DateFormatterPipe } from '../shared/pipes/dateModifierPipe';

const dateModifierPipe = new DateFormatterPipe();

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

  public selectedFlightValues: FlightClientDetails;

  public selectedFlightIndex = 0;
  public selectedCabinIndex: number;
  public pointsDeSelected = false;

  public apiActiveFlightSubject$ = new BehaviorSubject<FlightClientDetails>(null);
  public apiActiveCabinSubject$ = new BehaviorSubject<CabinContinuousFares>(null);

  public derivedOrigin: string;
  public derivedDestination: string;

  constructor(
    @Inject(DOCUMENT) private readonly documentRef: Document,
    public dashboardApi: BidPriceAspNetService,
    public bookingControlService: BookingControlService,
    public themeControlService: ThemeControlService,
    public sharedDatasetService: SharedDatasetService) {
  }

  // Called onStart and from flight dropdown
  public flightSelectControl(flightSpecifics) {

    this.sharedDatasetService.totalBookingsCollector = 0;

    // console.log(' flightSpecifics ', flightSpecifics)

    const flightNum = this.sharedDatasetService.allNewFlightValues.flightline.split(' ');
    this.selectedFlightKey = this.sharedDatasetService.allNewFlightValues.oDmasterKey;

    const formattedDepDate = dateModifierPipe.transform(flightSpecifics.departureDate, 'date');
    const formattedDepTime = dateModifierPipe.transform(flightSpecifics.departureTime, 'time');
    const formattedArrivalTime = dateModifierPipe.transform(flightSpecifics.arrivalTime, 'time');

    // console.log('formattedDepDate ', formattedDepDate, ' formattedDepTime ', formattedDepTime, 'formattedArrivalTime ', formattedArrivalTime)

    this.selectedFlightValues = {
      flightline: flightSpecifics.flightline,
      odMasterKey: flightSpecifics.oDmasterKey,
      origin: flightNum[0].substring(0, 3),
      flightNumber: Number(flightNum[1]),
      destination: flightNum[0].substring(3),
      departureDate: formattedDepDate,
      departureTime: formattedDepTime,
      arrivalTime: formattedArrivalTime,
      airlineCode: flightSpecifics.airlineCode
    }
    //console.log('selectedFlightValues ', this.selectedFlightValues)
    this.sharedDatasetService.selectedCabinIndex = flightSpecifics.cabinContinuousFares.length - 1;

    this.sharedDatasetService.cabinOptions = flightSpecifics.cabinContinuousFares;

    this.apiActiveCabinSubject$.next(this.sharedDatasetService.cabinOptions[this.sharedDatasetService.selectedCabinIndex]);

    this.apiActiveFlightSubject$.next(this.selectedFlightValues);
    this.cabinSelection(flightSpecifics.cabinContinuousFares[flightSpecifics.cabinContinuousFares.length - 1]);

  }


  // Activates Continuous price curve
  public toggleFrameRate() {
    this.frameRateCounterState = !this.frameRateCounterState;
  }


  /// Works in shared- datasets
  public cabinSelection(ev) {

    let savedCabinValuesPh;
    const foundIdx = this.sharedDatasetService.cabinOptions.findIndex(x => {
      return x.cabinLetter === ev.cabinLetter;
    });


    console.log('cabinSelection ', foundIdx, ' this.selectedFlightValues.odMasterKey ', this.selectedFlightValues.odMasterKey);

    this.sharedDatasetService.selectedCabinIndex = foundIdx;

    if (JSON.parse(window.localStorage.getItem('savedCabinCollection'))) {
      savedCabinValuesPh = JSON.parse(window.localStorage.getItem('savedCabinCollection'));
    }

    if (this.sharedDatasetService.cabinOptions[foundIdx].cabinLetter === ev.cabinLetter) {
      console.log('\n\n\n TRUE  savedCabTrueinValuesPh ', savedCabinValuesPh)
    }

    this.sharedDatasetService.changeCabinSelection(foundIdx);
  }


  public deselectAllPoints() {
    this.pointsDeSelected = !this.pointsDeSelected;
    this.sharedDatasetService.multiSelectedNodeSubject$.next([]);
  }


  public ngOnInit() {

    //
    // Returns All of the selected Fllight Inforamtion
    //

    this.dashboardApi.apiContinuousFareClientValues()
      .pipe(
        debounceTime(20),
        switchMap((allFlightValues: FlightObject) => {
          console.log('allFlightValues ', allFlightValues)
          return of(allFlightValues)
        })
      )
      .subscribe((flightObject: FlightObject) => {
        this.sharedDatasetService.allNewFlightValues = flightObject as FlightObject;
        this.sharedDatasetService.competitiveFareValues = flightObject.cabinContinuousFares[flightObject.cabinContinuousFares.length - 1].competitiveFares;
        this.flightSelectControl(flightObject);
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

    const ctrlRight = shortcut([
      KeyCode.ControlRight,
    ]).pipe(sequence());

    const arwRight = shortcut([
      KeyCode.ArrowRight,
    ]).pipe(sequence());

    const arwLeft = shortcut([
      KeyCode.ArrowLeft,
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
      ctrlRight,
      arwRight,
      arwLeft
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
        // console.log('a ', a)
        if (this.sharedDatasetService.selectedMetric !== 0) {
          this.lastSelectedMetric = this.sharedDatasetService.selectedMetric;
        }
        // if(a.arwRight){

        // }
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
    this.influencesExpanded = !this.influencesExpanded;
  }
};

