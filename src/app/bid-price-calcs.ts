import { Injectable } from '@angular/core';
import { ColorManagerService } from './color-manager-service';
import { BarSeries, BucketDetails } from './models/dashboard.model';
import { SharedDatasetService } from './shared-datasets.service';
import { ConstraintType } from './dashboard-constants';

@Injectable({
    providedIn: 'root'
})


export class BidPriceCalcsService {
    colorRange: string[] = [];

    constructor(private sharedDatasetService: SharedDatasetService,
        private colorManagerService: ColorManagerService) { }

    public getColorValues(): string[] {
        this.colorRange = this.colorManagerService.genColors(this.sharedDatasetService.bucketDetails.length)
        return this.colorManagerService.genColors(this.sharedDatasetService.bucketDetails.length);
    }

    // Generates Bid Price Curve from adjustments
    public generateInterpolatedCurvePoints(): number[] {

        let stepper = 0;
        let noProtections = false;

        // @ts-ignore
        function ranger(from, to, step, prec) {

            if (typeof from == 'number') {

                const A = [from];
                step = typeof step === 'number' ? Math.abs(step) : 1;

                if (!prec) {
                    prec = (from + step) % 1 ? String((from + step) % 1).length + 1 : 0;
                }
                if (from > to) {
                    while (+(from -= step).toFixed(prec) >= to) A.push(+from.toFixed(prec));
                }
                else {
                    while (+(from += step).toFixed(prec) <= to) A.push(+from.toFixed(prec));
                }
                return A;
            }
        }

        let result = []
        let rangeArray = [];

        this.sharedDatasetService.bucketDetails.map((p, i) => {

            if (i === 0) {

                for (let m = 0; m < this.sharedDatasetService.bucketDetails[0].protections; m++) {
                    if (this.sharedDatasetService.bucketDetails[0].protections > 0) {
                        rangeArray.push(this.sharedDatasetService.bucketDetails[0].fare)
                    }
                }
            } else {
                stepper = (this.sharedDatasetService.bucketDetails[i - 1].fare - p.fare) / p.protections;
                rangeArray = ranger(this.sharedDatasetService.bucketDetails[i - 1].fare, p.fare, stepper, 2);
                rangeArray.shift();
            }


            if (rangeArray.length !== 0) {

                if (noProtections) {

                    // Removes zero element values in BP calcs
                    rangeArray.forEach((r, a) => {
                        rangeArray[a] = this.sharedDatasetService.dynamicBidPrices[0];
                    })
                    noProtections = false;
                }
                result.push(...rangeArray);
            } else {
                noProtections = true
            }
        })
        return result;
    }


    // Set up bar colors 
    public adjustPieceColorForBookingUpdates(): BarSeries[] {
        let barSeries: BarSeries[] = [];
        this.sharedDatasetService.dynamicBidPrices = [];
        let counter = 0;
        let colorIncr = 0;
        this.sharedDatasetService.bucketDetails.map((pc, i) => {
            if (pc.protections > 0) {
                colorIncr++;
                for (let e = 0; e < pc.protections; e++) {
                    barSeries.push({ value: pc.fare, barColor: this.setBookingElementsColor(colorIncr, counter) })
                    counter++
                    this.sharedDatasetService.dynamicBidPrices.push(pc.fare)
                }
            }
        })
        return barSeries;
    }


    // Generates and returns each bar color
    public setBookingElementsColor(value, j): string {
        const len = this.sharedDatasetService.maxAuValue - this.sharedDatasetService.totalBookingsCollector;
        return j <= len ? this.colorRange[value] : 'green';
    }



    public findMatchingBucketForBidPrice(bidPrice: number): BucketDetails {

        let currData: BucketDetails = null;
        for (const bucketInfo of this.sharedDatasetService.bucketDetails) {
            const fareValue = bucketInfo.fare;
            if (fareValue < bidPrice) {
                currData = bucketInfo;
                break;
            }
        }
        return currData;
    }


    // Places lines vertically with labels on top of chart signifying fare call regions
    public markVerticalLineSellingValues() {

        let sellingPoint = this.sharedDatasetService.maxAuValue - this.sharedDatasetService.totalBookingsCollector;

        if (sellingPoint < 0) {
            sellingPoint = 0;
        }

        const activeColor = this.sharedDatasetService.activeCurve.length ? 'green' : 'navy';
        const baseCurve = this.sharedDatasetService.dynamicBidPrices;

        if (this.sharedDatasetService.totalBookingsCollector > 0) {
            const rounded = Math.round(this.sharedDatasetService.activeCurve[sellingPoint]);
            const fareClass = `Selling: ${rounded}`

            // Vertical Active Class/Value Selling Line
            return {
                name: 'current',
                id: 'clicked',
                clickable: false,
                animation: false,
                silent: true,
                lineStyle: {
                    type: 'dashed',
                    color: '#001871',
                    width: 2,
                },
                label: {
                    name: 'testLabel',
                    id: 'clickedLabel',
                    position: 'end',
                    show: true,
                    distance: [0, -60],
                    formatter: () => {
                        return `{a|${fareClass}\nBase: ${baseCurve[sellingPoint]}}`
                    },
                    rich: {
                        a: {
                            align: 'center',
                            padding: [3, 0, 2, 0],
                            width: 80,
                            fontSize: 12,
                            fontWeight: 'normal',
                            borderColor: activeColor,
                            backgroundColor: activeColor,
                            borderWidth: 3,
                            borderRadius: 1,
                            color: 'white',
                        },
                    },
                },
                data: [
                    {
                        xAxis: sellingPoint
                    },
                    {
                        symbol: 'diamond',
                        symbolSize: 6,
                        yAxis: this.sharedDatasetService.activeCurve[sellingPoint],

                        label: {
                            show: false,
                            name: 'testLabel',
                            id: 'test',
                            position: 'end',
                            distance: [-50, 0],
                            fontSize: 11,
                            borderRadius: 2,
                            color: '#e7e7e7',
                            padding: [4, 6, 2, 8],
                            borderColor: 'navy',
                            backgroundColor: 'navy',
                            borderWidth: 0
                        }
                    }]
            }
        } else {
            return {}
        }
    }

    public applyAllInfluences(bpVector: number[], args: any[]): number[] {

        const applyMultiplication = (bpVector, multiplier: any): number[] => {
            return bpVector.map((bp, i) => {
                const num = Number(multiplier)
                return bp * num > 0 ? Math.round(bp * num) : bp;
            })
        };


        const applyAddSubtract = (bpVector, difference: number): number[] => {
            return bpVector.map((bp, i) => {
                return bp + difference > 0 ? bp + difference : 0;
            })
        };


        const applyMinimum = (bpVector, minimum: number): number[] => {
            return bpVector.map(bp => {
                return bp > 0 && bp < minimum ? minimum : bp;
            })
        }


        const applyMaximum = (bpVector, maximum: number): number[] => {
            return bpVector.map(bp => {
                return bp > 0 && bp < maximum ? bp : maximum;
            })
        }


        let aggregate = [];

        aggregate = args.map((arg, i) => {

            if (arg.key === ConstraintType.Multiply) {
                bpVector = applyMultiplication(bpVector, arg.value);
            }

            if (arg.key === ConstraintType.AddSubtract) {
                bpVector = applyAddSubtract(bpVector, arg.value)
            }

            if (arg.key === ConstraintType.Minimum) {
                bpVector = applyMinimum(bpVector, arg.value)
            }

            if (arg.key === ConstraintType.Maximum) {
                bpVector = applyMaximum(bpVector, arg.value)
            }

            return bpVector;
        })

        return aggregate[aggregate.length - 1];

    }
}