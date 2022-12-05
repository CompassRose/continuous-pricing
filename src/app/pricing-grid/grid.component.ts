import { Component, OnInit, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { ContinousColors, ColorObject } from '../dashboard-constants';
import { Subject, Subscription, fromEvent, take, distinctUntilChanged, map, merge, share, combineLatest, Observable } from 'rxjs';
import { SharedDatasetService } from '../shared-datasets.service';
import { debounceTime, tap, filter } from 'rxjs/operators';
import { BookingControlService } from '../booking-controls';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
//import { KeyCode } from '@ng-select/ng-select/lib/ng-select.types';
import { KeyCode } from './lib/keycodes';
import { shortcut, sequence } from './lib/shortcuts';

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

  public lastSelectedMetric = 0;

  overlayRef: OverlayRef | null;

  sub: Subscription;

  shortcuts$: Observable<string>;


  constructor(
    public bookingControlService: BookingControlService,
    public sharedDatasetService: SharedDatasetService,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef) {
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
        console.log('\n\n\na ', a.ctrlKey, ' code ', a.code, ' type ', a.type)
        if (a.ctrlKey) {
          this.sharedDatasetService.setGroupingMethod(0)
        } else {
          this.sharedDatasetService.setGroupingMethod(1)
        }
        return a.code
      }).join("+")
    }))
  }


};

