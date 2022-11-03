import { Injectable } from '@angular/core';
import { Subject, fromEvent, Subscription } from 'rxjs'
import { map, filter } from 'rxjs/operators';
import { SharedDatasetService } from './shared-datasets.service';

@Injectable({
    providedIn: 'root',
})

export class KeyBoardService {
    keyBoard: Subject<any> = new Subject<any>();
    subscription: Subscription;


    constructor(private sharedDatasetService: SharedDatasetService) { }

    sendMessage(message: any) {
        this.keyBoard.next(message)
    }


    public myInputOnChangeProtections(ev: number, idx: number, code: number) {

        if (code === 38 || code === 39) {

            this.sharedDatasetService.bucketDetails[idx].Aus += 1;
            this.sharedDatasetService.bucketDetails[idx].protections -= 1;

            if (this.sharedDatasetService.bucketDetails[idx].protections === 0) {
                this.sharedDatasetService.bucketDetails[idx + 1].protections += 1;
            }

        } else if (code === 40 || code === 37) { //Down/Left

            this.sharedDatasetService.bucketDetails[idx].Aus -= 1;
            this.sharedDatasetService.bucketDetails[idx].protections += 1;

            if (this.sharedDatasetService.bucketDetails[idx].protections) {
                this.sharedDatasetService.bucketDetails[idx + 1].protections += 1;
            }
        }
        this.protectionInputIncrement(idx, [ev, this.sharedDatasetService.bucketDetails[idx].Aus]);
    }

    public protectionInputIncrement(dataIndex, pos: number[]) {
        let yValue = 0;
        yValue = Math.round(Math.floor(pos[1]));
        if (yValue < 0) { yValue = 0; }
        if (yValue > this.sharedDatasetService.maxAuValue) { yValue = this.sharedDatasetService.maxAuValue }

        this.sharedDatasetService.calculateBidPriceForAu(this.sharedDatasetService.currAus[dataIndex], dataIndex, yValue);
        this.sharedDatasetService.applyDataChanges();
        this.sharedDatasetService.generateBucketValues();
    }


    // Unused Temporarily
    public init() {
        if (!this.subscription)
            this.subscription = fromEvent(document, 'keydown').pipe(
                filter((e: Event) => {
                    const el = document.activeElement
                    const ev = (e as KeyboardEvent)
                    const isArrow = ev.keyCode >= 37 && ev.keyCode <= 40
                    return isArrow && (el.tagName == 'body' || (ev.keyCode == 40 && el.tagName != 'SELECT') || el.getAttribute('arrow-div') === '')
                }),
                map(e => {
                    const obj = { element: document.activeElement, action: null }
                    switch ((e as KeyboardEvent).keyCode) {
                        case 38:
                            obj.action = 'UP'
                            break;
                        case 37:
                            obj.action = 'LEFT'
                            break;
                        case 40:
                            obj.action = 'DOWN'
                            break;
                        case 39:
                            obj.action = 'RIGTH'
                            break;
                    }
                    return obj
                })).subscribe(res => {
                    this.sendMessage(res)
                })
    }
    destroy() {
        this.subscription.unsubscribe()
        this.subscription = null;
    }
}