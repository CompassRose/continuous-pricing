import { Component, OnInit, Inject, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { DOCUMENT } from "@angular/common";
import { ContinousColors, ColorObject } from '../dashboard-constants';
import { Subject, Subscription, fromEvent, take, distinctUntilChanged, map, merge, share, combineLatest, Observable, pairwise, scan } from 'rxjs';
import { SharedDatasetService } from '../shared-datasets.service';
import { debounceTime, tap, filter } from 'rxjs/operators';
import { BookingControlService } from '../booking-controls';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
//import { KeyCode } from '@ng-select/ng-select/lib/ng-select.types';
import { KeyCode } from './lib/keycodes';
import { shortcut, sequence } from './lib/shortcuts';

import * as gradient from "javascript-color-gradient";

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

export const devPathToAssets = '../../assets/images/';
export const prodPathToAssets = '';

@Component({
  selector: 'draggable-aus',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})




export class ContinousPricingComponent implements OnInit {

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

  public pathToAssets = '';


  overlayRef: OverlayRef | null;

  sub: Subscription;

  shortcuts$: Observable<string>;

  constructor(
    @Inject(DOCUMENT) private readonly documentRef: Document,
    public bookingControlService: BookingControlService,
    public sharedDatasetService: SharedDatasetService,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef) {

    this.pathToAssets = devPathToAssets;
  }

  public ngOnInit() {


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

    // const qwertz = shortcut([
    //   KeyCode.KeyQ,
    //   KeyCode.KeyW,
    //   KeyCode.KeyE,
    //   KeyCode.KeyR,
    //   KeyCode.ControlLeft,
    //   KeyCode.KeyT,
    //   KeyCode.KeyY,
    // ]).pipe(sequence());

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
      controlAlt,
      //  abc,
      // qwertz,
      // commaDot,
      //  shiftNext,
      //  altK,
      //  altSpace
    ).pipe(map((arr) => {
      // console.log('arr 0 ', arr[0], ' 1 ', arr[1])

      return arr.map((a) => {
        if (a.ctrlKey) {

          if (this.sharedDatasetService.selectedMetric !== 0) {
            this.lastSelectedMetric = this.sharedDatasetService.selectedMetric;
          }

          if (this.sharedDatasetService.selectedMetric !== 0) {
            this.sharedDatasetService.setGroupingMethod(0);
          }

        } else {
          if (this.lastSelectedMetric !== 0) {
            this.sharedDatasetService.setGroupingMethod(this.lastSelectedMetric);
          }
        }
        return a.code
      }).join("+")
    }))
  }
};

