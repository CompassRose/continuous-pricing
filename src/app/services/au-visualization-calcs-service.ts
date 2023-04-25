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


    public hexColorCollection = [
        '#ffff2b',
        '#2bffff',
        '#8040ff',
        '#ffff80',
        '#ff00ff',
        '#80ff80',
        '#ffffff',
        '#00a4f2',
        '#ffff28',
        '#28ffff',
        '#8040ff',
        '#ffff80',
        '#ff00ff',
        '#80ffff',
        '#2b2bff',
        '#ff6c6c',
        '#ffff80',
        '#40ffff',
        '#9d6fff',
        '#ffff80',
        '#ffeafe',
        '#98ff00',
        '#9b4eff',
        '#00ca65',
        '#ff11ff',
        '#acff80',
        '#ffffff',
        '#00a9fb',
        '#ff007e',
        '#bbffb7',
        '#00b7ff',
        '#7a7a7a',
        '#000000',
        '#000000'
    ];

    // 29
    //     :
    //     { value: 99, barColor: 'rgb(0,155,78)' }
    // 30
    //     :
    //     { value: 86, barColor: 'rgb(0.202,101)' }
    // 40
    //     :
    //     { value: 74, barColor: 'rgb(17,255,172)' }
    // Hard coded airRm Box Colors

    public airRmColors = [
        'rgb(255,0,0)',
        'rgb(255,108,108)',
        'rgb(255,128,64)',
        'rgb(255,157,111)',
        'rgb(255,255,128)',
        'rgb(234,254,152)',
        'rgb(0,155,78)',
        'rgb(0.202,101)',
        'rgb(17,255,172)',
        'rgb(128,255,255)',
        'rgb(0,169,201)',
        'rgb(0,126,187)',
        'rgb(183,0,183)',
        'rgb(122,122,122)',
        'rgb(50,50,50)',
        'rgb(40,40,40)',
        'rgb(30,30,30)'
    ];

    constructor(private sharedDatasetService: SharedDatasetService) { }


    public getColorValues(): string[] {

        return this.colorRange = this.sharedDatasetService.colorRange;
    }



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
        this.sharedDatasetService.bucketDetails.map((p, i) => {
            if (p.fare) {
                if (i === 0) {

                    for (let m = 0; m < this.sharedDatasetService.bucketDetails[0].protections; m++) {
                        if (this.sharedDatasetService.bucketDetails[0].protections > 0) {
                            rangeArray.push(this.sharedDatasetService.bucketDetails[0].fare)
                        }
                    }
                } else {
                    stepper = (this.sharedDatasetService.bucketDetails[i - 1].fare - p.fare) / p.protections;
                    rangeArray = ranger(this.sharedDatasetService.bucketDetails[i - 1].fare, p.fare, stepper, 2);

                    tester = tester += rangeArray.length
                    if (rangeArray) {
                        rangeArray.shift();
                    }
                }
            }
            if (rangeArray.length === 0) {
                testIncr++;
                for (let m = 0; m < this.sharedDatasetService.bucketDetails[testIncr].protections; m++) {
                    // console.log('testIncr ', testIncr, ' protections ', this.sharedDatasetService.bucketDetails[testIncr])
                    replacementEls.push(this.sharedDatasetService.dynamicBidPrices[0]);
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


    public generateColorValues() {

        let colorSeries = [];

        let counter = 0;
        let colorIncr = 0;

        this.sharedDatasetService.nonDiscreteBuckets.map((pc, i) => {

            if (pc.protections > 0) {
                for (let e = 0; e < pc.protections; e++) {
                    if (!colorSeries.includes(this.setBookingElementsColor(colorIncr, counter))) {
                        // console.log('i ', i, ' colorIncr ', colorIncr, ' counter ', counter)
                        colorSeries.push(this.setBookingElementsColor(colorIncr, counter))
                    }
                    counter++
                }
                colorIncr++;
            }
        })
        return colorSeries;
    }

    // Set up bar colors 
    public adjustPieceColorForBookingUpdates(selectedElements: number[]) {

        // console.log('selectedElements ', selectedElements)
        this.sharedDatasetService.dynamicBidPrices = [];
        this.sharedDatasetService.nonDiscreteBuckets.map((pc, i) => {
            if (pc.protections > 0) {
                for (let e = 0; e < pc.protections; e++) {
                    this.sharedDatasetService.dynamicBidPrices.push(pc.fare)
                }
            }
        })
        // console.log('\n  ----  Length', this.sharedDatasetService.dynamicBidPrices.length)
    }



    // Generates and returns each bar color
    public setBookingElementsColor(value, j): string {
        //  console.log('\n  ----   this.colorRange[value] ', value, ' j ', j)
        //  const len = this.sharedDatasetService.dynamicBidPrices[0] - this.sharedDatasetService.totalBookingsCollector;

        return this.sharedDatasetService.colorRange[value]; //'rgb(55, 165, 55)'
    }




    public findMatchingBucketForBidPrice(bidPrice: number): BucketDetails {

        let currData: BucketDetails = null;

        for (const bucketInfo of this.sharedDatasetService.bucketDetails) {

            const fareValue = bucketInfo.fare;

            if (fareValue === bidPrice) {

                // console.log('bucketInfo ', bucketInfo)
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

        const activeColor = this.sharedDatasetService.adjustedCurvePoints.length ? 'green' : 'blue';
        const baseCurve = this.sharedDatasetService.dynamicBidPrices;

        if (this.sharedDatasetService.totalBookingsCollector > 0) {
            const rounded = Math.round(this.sharedDatasetService.activeCurve[sellingPoint]);
            this.findMatchingBucketForBidPrice(this.sharedDatasetService.activeCurve[sellingPoint])
            const fareClass = `Selling: ${rounded}`;
            // Vertical Active Class/Value Selling Line
            const letterTarget = this.findMatchingBucketForBidPrice(this.sharedDatasetService.activeCurve[sellingPoint]).letter
            console.log('markVerticalLineSellingValues ', fareClass, ' XXXX ', letterTarget)

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