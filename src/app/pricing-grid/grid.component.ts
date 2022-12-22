import { Component, OnInit, Inject, ViewContainerRef } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { Subscription, map, merge, Observable, pairwise, scan, BehaviorSubject, tap } from 'rxjs';
import { SharedDatasetService } from '../shared-datasets.service';
import { BookingControlService } from '../booking-controls';
import { TemplatePortal } from '@angular/cdk/portal';
//import { KeyCode } from '@ng-select/ng-select/lib/ng-select.types';
import { KeyCode } from './lib/keycodes';
import { shortcut, singleShortcut, sequence } from './lib/shortcuts';
import { PathToAssets } from '../dashboard-constants';
import { DashboardApi } from '../dashboard.api.service'

export interface BidPriceCurvePoints {
  x: number;
  y: number;
}


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

export interface TempBucketDetails {
  bookings: number;
  Sa: number;
  protections: number;
}



@Component({
  selector: 'draggable-aus',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})



export class ContinousPricingComponent implements OnInit {

  public slider: any = document.getElementById("myRange");
  public output: any = document.getElementById("demo");

  readonly fps$ = animationFrame(this.documentRef.defaultView).pipe(
    pairwise(),
    scan((acc, [prev, cur]) => {
      if (acc.push(1000 / (cur - prev)) > 60) {
        acc.shift();
      }
      return acc;
    }, []),
    map(arr => Math.round(arr.reduce((acc, cur) => acc + cur, 0) / arr.length))
  );

  public lastSelectedMetric = 0;

  public pathToAssets = PathToAssets;

  sub: Subscription;
  shortcuts$: Observable<string>;



  constructor(
    @Inject(DOCUMENT) private readonly documentRef: Document,
    private dashboardApi: DashboardApi,
    public bookingControlService: BookingControlService,
    public sharedDatasetService: SharedDatasetService,
    public viewContainerRef: ViewContainerRef) {

  }

  public ngOnInit() {


    this.dashboardApi.postToFlightClient()

    this.bookingControlService.bookingSlider$
      .subscribe(response => {
        // console.log('BOOK response ', response)
        this.sharedDatasetService.generateInverseDetails()

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
      //   KeyCode.KeyR,
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
      key1,
      key2,
      key4,
      key3
      // commaDot,
      //  shiftNext,
      //  altK,
      //  altSpace
    ).pipe(map((arr) => {

      return arr.map((a) => {
        if (this.sharedDatasetService.selectedMetric !== 0) {
          this.lastSelectedMetric = this.sharedDatasetService.selectedMetric;
        } 2
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
};

