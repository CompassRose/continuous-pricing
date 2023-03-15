
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs'
import { debounceTime, tap } from 'rxjs/operators';
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
                if (response) {
                    console.log('BOOKING  resetDefaultSubject$ response ', response)
                    this.min = 0
                    this.value = 0
                    this.loadFactorFillPercent(0);
                }
            })


        this.bookingSlider$.pipe(
            debounceTime(120),

            tap((event) => {
                //console.log('Pipe event ', event, ' totalBookingsCollector ', [...this.tempBucketHolderStatic])

                if (event >= 0) {

                    let collObj = [...this.tempBucketHolderStatic]

                    this.sharedDatasetService.totalBookingsCollector = event;
                    let counter = 0;
                    let activeElement = this.sharedDatasetService.bucketDetails.length - 1;
                    // console.log('Pipe event activeElement ', activeElement, ' totalBookingsCollector ', this.sharedDatasetService.totalBookingsCollector, ' maxAuValue ', this.sharedDatasetService.maxAuValue)
                    this.loadFactorFillPercent(event);

                    for (let b = 0; b < this.tempBucketHolderStatic.length; b++) {
                        collObj[b].bookings = 0;
                        collObj[b].protections = this.tempBucketHolderStatic[b].protections;
                    }

                    for (let i = 0; i < this.sharedDatasetService.totalBookingsCollector; i++) {
                        collObj[activeElement].bookings += 1;
                        counter++;
                        if (counter === collObj[activeElement].protections) {
                            activeElement > 0 ? activeElement -= 1 : 0;
                            counter = 0;
                        }
                        //   console.log('Bookings collObj ', collObj)
                    }

                    this.sharedDatasetService.bucketDetails = collObj;
                    //  console.log('Pipe event this.sharedDatasetService.bucketDetails ', this.sharedDatasetService.bucketDetails)
                }
                this.sharedDatasetService.bucketDetailsBehaviorSubject$.next(false);
            })
        )
            .subscribe();
    }

    public change(element: any) {

        this.sharedDatasetService.totalBookingsCollector = element;
        this.bookingSlider$.next(element)

        console.log('|||||   change  totalBookingsCollector ', this.sharedDatasetService.totalBookingsCollector)
    }

    public loadFactorFillPercent(value: number) {

        //  console.log('\n\n ****************  loadFactorFillPercent ', value)
        const elem = document.getElementById("myBar");
        if (value === 0) {
            elem.style.width = 0 + "%";
            elem.innerHTML = 0 + "%";
        } else {
            const percent = Math.round((value / this.sharedDatasetService.maxAuValue) * 100);
            const elem = document.getElementById("myBar");
            // console.log('Move ', value, ' percent ', percent, ' elem ', elem)
            elem.style.width = percent + "%";
            elem.innerHTML = percent + "%";
        }

    }


}







