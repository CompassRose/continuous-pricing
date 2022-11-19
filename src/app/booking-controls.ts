
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'
import { debounceTime, tap, filter } from 'rxjs/operators';
import { SharedDatasetService } from './shared-datasets.service';

@Injectable({
    providedIn: 'root',
})

export class BookingControlService {

    public tempBucketHolderStatic = [...this.sharedDatasetService.bucketDetails]

    public bookingSlider$ = new Subject<any>();

    autoTicks = false;
    disabled = false;
    invert = true;
    max = this.sharedDatasetService.getMaxAu();
    min = 0;
    showTicks = true;
    step = 1;
    thumbLabel = true;
    value = this.sharedDatasetService.totalBookingsCollector;
    vertical = false;
    tickInterval = 1;
    sliderCounter = 0;

    constructor(public sharedDatasetService: SharedDatasetService) {


        this.sharedDatasetService.resetDefaultSubject$
            .subscribe(response => {
                this.min = 0
                this.value = 0
                this.change(0);
            })

        this.bookingSlider$.pipe(
            filter(Boolean),
            debounceTime(120),

            tap((event) => {
                // console.log('event ', event)
                let collObj = [...this.tempBucketHolderStatic]
                this.sharedDatasetService.totalBookingsCollector = event;
                let counter = 0;
                let activeElement = this.sharedDatasetService.bucketDetails.length - 1;

                this.loadFactorFillPercent(event);

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

    public change(element: any) {
        this.bookingSlider$.next(element)
    }

    public loadFactorFillPercent(value: number) {
        const percent = Math.round((value / this.sharedDatasetService.maxAuValue) * 100);
        var elem = document.getElementById("myBar");
        //console.log('Move ', value, ' percent ', percent, ' elem ', elem)
        elem.style.width = percent + "%";
        elem.innerHTML = percent + "%";
    }


}







