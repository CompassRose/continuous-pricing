import { Injectable } from '@angular/core';
import { BarSeries, BucketStructure } from '../models/dashboard.model';
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
        this.sharedDatasetService.bucketDetailsFromApi.map((p, i) => {
            if (p.fare) {
                if (i === 0) {

                    for (let m = 0; m < this.sharedDatasetService.bucketDetailsFromApi[0].protections; m++) {
                        if (this.sharedDatasetService.bucketDetailsFromApi[0].protections > 0) {
                            rangeArray.push(this.sharedDatasetService.bucketDetailsFromApi[0].fare)
                        }
                    }
                } else {
                    stepper = (this.sharedDatasetService.bucketDetailsFromApi[i - 1].fare - p.fare) / p.protections;
                    rangeArray = ranger(this.sharedDatasetService.bucketDetailsFromApi[i - 1].fare, p.fare, stepper, 2);

                    tester = tester += rangeArray.length
                    if (rangeArray) {
                        rangeArray.shift();
                    }
                }
            }
            if (rangeArray.length === 0) {
                testIncr++;
                for (let m = 0; m < this.sharedDatasetService.bucketDetailsFromApi[testIncr].protections; m++) {
                    // console.log('testIncr ', testIncr, ' protections ', this.sharedDatasetService.bucketDetailsFromApi[testIncr])
                    replacementEls.push(this.sharedDatasetService.bucketDetailsFromApi[0].fare);
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


    public findMatchingBucketForBidPrice(bidPrice: number): BucketStructure {

        let currData: BucketStructure = null;
        for (const bucketInfo of this.sharedDatasetService.bucketDetailsFromApi) {
            //console.log('bucketInfo ', bucketInfo)
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

        let sellingPoint = 120;
        if (sellingPoint < 0) {
            sellingPoint = 0;
        }

        const baseCurve = this.sharedDatasetService.dynamicBidPrices;
        const fc = this.findMatchingBucketForBidPrice(this.sharedDatasetService.dynamicBidPrices[sellingPoint]);
        const fareClass = `${this.sharedDatasetService.competitiveFareValues[0].carrier}`;

        // Vertical Active Class/Value Selling Line

        const tester = {
            name: 'current',
            id: 'clicked',
            clickable: false,
            animation: false,
            silent: true,
            symbol: 'diamond',
            symbolSize: 14,
            lineStyle: {
                type: 'dashed',
                color: 'rgba(170,170,0,1)',
                width: 2,
            },
            label: {
                name: 'testLabel',
                id: 'clickedLabel',
                position: 'end',
                show: true,
                distance: [0, -120],
                formatter: () => {
                    return `{a|${fareClass}: ${baseCurve[sellingPoint]}}`
                },
                rich: {
                    a: {
                        align: 'center',
                        padding: [6, 3, 3, 3],
                        width: 50,
                        fontSize: 13,
                        fontWeight: 'normal',
                        borderColor: 'rgb(200,200,200)',
                        backgroundColor: fc.color,
                        borderWidth: 1,
                        borderRadius: 3,
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
                    symbolSize: 12,
                    yAxis: this.sharedDatasetService.dynamicBidPrices[sellingPoint],

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
                }
            ]
        }
        return tester;
    }

    public updateBucketDetails(selectedElements, args) {
        args.forEach((arg, i) => {


            if (arg.key === ConstraintType.Multiply) {

                selectedElements.forEach((se, i) => {
                    console.log('Before this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetailsFromApi[se].fare)
                    this.sharedDatasetService.bucketDetailsFromApi[se].fare = this.sharedDatasetService.bucketDetailsFromApi[se].fare * arg.value;
                    console.log('After this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetailsFromApi[se].fare)
                })
            }
            if (arg.key === ConstraintType.AddSubtract) {
                selectedElements.forEach((se, i) => {
                    console.log('Before this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetailsFromApi[se].fare)
                    this.sharedDatasetService.bucketDetailsFromApi[se].fare = this.sharedDatasetService.bucketDetailsFromApi[se].fare + arg.value;
                    console.log('After this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetailsFromApi[se].fare)
                })
            }

            if (arg.key === ConstraintType.Minimum) {
                selectedElements.forEach((se, i) => {
                    if (this.sharedDatasetService.bucketDetailsFromApi[se].fare < arg.value) {
                        this.sharedDatasetService.bucketDetailsFromApi[se].fare = arg.value;
                    }

                    console.log('After this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetailsFromApi[se].fare)
                })
            }

            if (arg.key === ConstraintType.Maximum) {
                selectedElements.forEach((se, i) => {
                    console.log('Before this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetailsFromApi[se].fare)
                    this.sharedDatasetService.bucketDetailsFromApi[se].fare = this.sharedDatasetService.bucketDetailsFromApi[se].fare * arg.value;
                    console.log('After this.sharedDatasetService.bucketDetails[se].fare  ', this.sharedDatasetService.bucketDetailsFromApi[se].fare)

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