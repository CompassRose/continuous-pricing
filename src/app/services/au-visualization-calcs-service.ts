import { Injectable } from '@angular/core';
import { BarSeries, BucketDetails } from '../models/dashboard.model';
import { SharedDatasetService } from './shared-datasets.service';
import { ConstraintType } from '../dashboard-constants';


@Injectable({
    providedIn: 'root'
})


export class BidPriceCalcsService {

    colorRange: string[] = [];
    public barSeries: BarSeries[] = [];
    public selectedIndex: number;


    constructor(private sharedDatasetService: SharedDatasetService) { }


    // Generates Bid Price Curve from adjustments
    public generateInterpolatedCurvePoints(): number[] {

        let stepper = 0;
        let testIncr = 0;

        // Interpolates, and Generates Bid Price curve from Au bar series
        // @ts-ignore
        function ranger(from, to, step, prec) {
            // console.log('      from: ', from, ' to ', to, ' step ', step, ' prec ', prec)
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

        let result = [];
        let rangeArray = [];
        let replacementEls = [];
        let tester = 0;
        this.sharedDatasetService.nonDiscreteBuckets.map((p, i) => {
            if (p.fare) {
                if (i === 0) {

                    for (let m = 0; m < this.sharedDatasetService.nonDiscreteBuckets[0].protections; m++) {
                        if (this.sharedDatasetService.nonDiscreteBuckets[0].protections > 0) {
                            rangeArray.push(this.sharedDatasetService.nonDiscreteBuckets[0].fare)
                        }
                    }
                } else {
                    stepper = (this.sharedDatasetService.nonDiscreteBuckets[i - 1].fare - p.fare) / p.protections;
                    rangeArray = ranger(this.sharedDatasetService.nonDiscreteBuckets[i - 1].fare, p.fare, stepper, 2);

                    tester = tester += rangeArray.length
                    if (rangeArray) {
                        rangeArray.shift();
                    }
                }
            }
            if (rangeArray.length === 0) {
                testIncr++;
                for (let m = 0; m < this.sharedDatasetService.nonDiscreteBuckets[testIncr].protections; m++) {
                    // console.log('testIncr ', testIncr, ' protections ', this.sharedDatasetService.bucketDetails[testIncr])
                    replacementEls.push(this.sharedDatasetService.nonDiscreteBuckets[0].fare);
                }
            }

            result.push(...rangeArray);
        })
        if (replacementEls.length > 0) {

            for (let f = 0; f < replacementEls.length; f++) {
                if (this.sharedDatasetService.dynamicBidPrices[f] === this.sharedDatasetService.dynamicBidPrices[0]) {
                    result[f] = this.sharedDatasetService.dynamicBidPrices[0];
                }
            }
        }

        return result;
    }



    // // Set up bar colors 
    public adjustPieceColorAndValue(buckets): any[] {
        let test = [];
        for (let e = 0; e < buckets.protections; e++) {
            this.sharedDatasetService.dynamicBidPrices.push(buckets.fare)
            const chartObj = {
                value: buckets.fare,
                itemStyle: {
                    color: buckets.color
                }
            }
            test.push(chartObj)
        }
        return test;
    }



    public returnProtectionValues(set): any {

        let colorSeries = [];

        let chartObj = {
            value: 0,
            itemStyle: {
                color: ''
            }
        };

        for (let p = 0; p < set.protections; p++) {

            return chartObj = {
                value: set.fare,
                itemStyle: {
                    color: set.color
                }
            }

        }
        //console.log('colorSeries ', chartObj)
        return chartObj
    }


    public adjustPieceColorForBookingUpdates() {
        this.sharedDatasetService.dynamicBidPrices = [];
        this.sharedDatasetService.dynamicChartObject = [];
        this.sharedDatasetService.nonDiscreteBuckets.map((pc, i) => {
            pc.color = this.sharedDatasetService.colorRange[i];
            const fareHolder = this.adjustPieceColorAndValue(pc)
            this.sharedDatasetService.dynamicChartObject.push(...fareHolder)
        })
    }



    public findMatchingBucketForBidPrice(bidPrice: number): BucketDetails {

        let currData: BucketDetails = null;
        for (const bucketInfo of this.sharedDatasetService.bucketDetails) {
            const fareValue = bucketInfo.fare;
            if (fareValue === bidPrice) {
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

        const activeColor = 'blue'
        //this.sharedDatasetService.adjustedCurvePoints.length ? 'green' : 'blue';
        const baseCurve = this.sharedDatasetService.dynamicBidPrices;

        if (this.sharedDatasetService.totalBookingsCollector > 0) {
            const rounded = Math.round(this.sharedDatasetService.activeCurve[sellingPoint]);
            this.findMatchingBucketForBidPrice(this.sharedDatasetService.activeCurve[sellingPoint])
            const fareClass = `Selling: ${rounded}`;
            // Vertical Active Class/Value Selling Line
            const letterTarget = this.findMatchingBucketForBidPrice(this.sharedDatasetService.activeCurve[sellingPoint]).letter
            // console.log('markVerticalLineSellingValues ', fareClass, ' XXXX ', letterTarget)

            return {
                name: 'current',
                id: 'clicked',
                clickable: false,
                animation: false,
                silent: true,
                lineStyle: {
                    type: 'dashed',
                    color: 'blue',
                    width: 2,
                },
                label: {
                    name: 'testLabel',
                    id: 'clickedLabel',
                    position: 'end',
                    show: true,
                    distance: [0, -120],
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
                            borderColor: 'blue',
                            backgroundColor: 'blue',
                            borderWidth: 0
                        }
                    }]
            }
        } else {
            return {}
        }
    }

    public updateBucketDetails(selectedElements, args) {
        args.forEach((arg, i) => {


            if (arg.key === ConstraintType.Multiply) {

                selectedElements.forEach((se, i) => {
                    console.log('Before this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetails[se].fare)
                    this.sharedDatasetService.bucketDetails[se].fare = this.sharedDatasetService.bucketDetails[se].fare * arg.value;
                    console.log('After this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetails[se].fare)
                })
            }
            if (arg.key === ConstraintType.AddSubtract) {
                selectedElements.forEach((se, i) => {
                    console.log('Before this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetails[se].fare)
                    this.sharedDatasetService.bucketDetails[se].fare = this.sharedDatasetService.bucketDetails[se].fare + arg.value;
                    console.log('After this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetails[se].fare)
                })
            }

            if (arg.key === ConstraintType.Minimum) {
                selectedElements.forEach((se, i) => {
                    if (this.sharedDatasetService.bucketDetails[se].fare < arg.value) {
                        this.sharedDatasetService.bucketDetails[se].fare = arg.value;
                    }

                    console.log('After this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetails[se].fare)
                })
            }

            if (arg.key === ConstraintType.Maximum) {
                selectedElements.forEach((se, i) => {
                    console.log('Before this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetails[se].fare)
                    this.sharedDatasetService.bucketDetails[se].fare = this.sharedDatasetService.bucketDetails[se].fare * arg.value;
                    console.log('After this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetails[se].fare)

                })
            }
        })
    }

    public applyAllInfluences(selectedElements: number[], curveState: boolean, bpVector: number[], args: any[]) {

        console.log('applyAllInfluences curveState ', curveState, ' selectedElements ', selectedElements, ' args ', args)

        if (!curveState) {
            this.updateBucketDetails(selectedElements, args)
        }

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
            console.log('arg ', arg)

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

            // }

            return bpVector;
        })

        return aggregate[aggregate.length - 1];


    }
}