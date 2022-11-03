import { Component, OnInit, ElementRef } from '@angular/core';
import { ContinousColors, ColorObject, ConstraintType } from '../dashboard-constants';
import * as echarts from 'echarts';
import { Subscription } from 'rxjs'
import { BucketDetails, BidPriceInfluencers } from '../models/dashboard.model';
import { SharedDatasetService } from '../shared-datasets.service';
import { getCurvePoints } from 'cardinal-spline-js';
import { KeyBoardService } from '../keyboard.service';



export interface BidPriceCurvePoints {
    x: number;
    y: number;
}


@Component({
    selector: 'continuous-bid-pricing',
    templateUrl: './continuous-bidpricing-chart.component.html',
    styleUrls: ['./continuous-bidpricing-chart.component.scss'],
})

export class ContinousBidPricingComponent implements OnInit {

    public interpolatedCurvePoints: BidPriceCurvePoints[];

    public adjustedCurvePoints: any[] = [];
    public seatsLeftToSell = 0;
    public curvePointMultiplier: number[] = [];
    public curveControlPoints: any[] = [];
    public modifierCollection = [];
    public barSeriesValuesColors: any[] = [];

    public pieces: any[] = [];

    public options: any = {};

    public myChart: echarts.ECharts = null;

    public modifierObj = { mult: 1.00, addSub: 0, min: 0, max: 99999 } as BidPriceInfluencers;

    public fareClass: string[] = ['Y', 'B', 'M', 'H', 'K', 'L', 'V', 'A', 'T', 'X'];

    public colorCollections: ColorObject[] = ContinousColors;

    public subscription = new Subscription();

    public colorRange: ColorObject = this.colorCollections[0];

    // Width observer
    public targetElement: any;
    public bidPriceObserver: any;


    constructor(
        public sharedDatasetService: SharedDatasetService,
        public keyBoardService: KeyBoardService, private host: ElementRef) {

        this.sharedDatasetService.selectedColorRangeBehaviorSubject$
            .subscribe(color => {
                if (color !== this.colorRange) {
                    this.colorRange = color;

                    //console.log('selectedColorRangeBehaviorSubject ', ' color ', color)
                    this.adjustPieceRegions();
                    this.createChartElement();
                }
            })


        this.sharedDatasetService.bucketDetailsBehaviorSubject$
            .subscribe(([buckets, state]) => {

                if (this.myChart) {
                    //console.log(' $$$$ CONTINUOUS ', buckets)
                    if (state) {
                        this.adjustPieceRegions();
                    } else {
                        this.adjustPieceColorForBookingUpdates();
                    }
                    this.createChartElement();
                }
            })


        this.sharedDatasetService.influenceInput$
            .subscribe(([response, mod, id]) => {
                //console.log('response ', response, ' idx ', mod, ' id ', id)
                if (response !== null) {
                    this.modifierObj[mod] = response;
                    const staticModifierObj = { mult: 1.00, addSub: 0, min: 0, max: 99999 };
                    this.adjustedCurvePoints = [];
                    Object.entries(staticModifierObj).forEach((d: any, i) => {

                        // console.log('modifierCollection. ', ' id ', id);

                        if (staticModifierObj[mod] !== this.modifierObj[mod]) {

                            if (!this.modifierCollection.some(influence => influence.key === mod)) {

                                this.modifierCollection.push({ key: mod, value: this.modifierObj[mod] });
                            } else {
                                const index = this.modifierCollection.findIndex(r => r.key === mod);
                                if (this.modifierCollection[index].value !== response) {
                                    this.modifierCollection[index].value = response;
                                }
                            }
                        } else {
                            this.modifierCollection.splice(this.modifierCollection.findIndex(idx => idx === idx), 1);
                        }

                    });
                    console.log('modifierCollection. ', this.modifierCollection)


                    this.interpolatedCurvePoints.forEach((ip, i) => {
                        // console.log('ip ', ip)
                        this.adjustedCurvePoints.push(ip.y)
                    })

                    const staticArray = [...this.adjustedCurvePoints];
                    this.adjustedCurvePoints = this.applyAllInfluences(staticArray, this.modifierCollection);

                    //this.adjustedCurvePoints = tempCurve;
                    // console.log('response ', this.adjustedCurvePoints)

                    this.adjustPieceRegions();
                    this.createChartElement();
                }
            })

    }

    ngOnInit(): void {
        this.sharedDatasetService.generateBucketValues();
        this.adjustPieceRegions();

        setTimeout(() => {
            this.createSvg();
        }, 330);
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

        //this.updateBidPriceChartFunction();
        return aggregate[aggregate.length - 1];

    }

    public refreshChartVisual = () => {
        this.myChart.resize();
    }



    // Called from template auto resize chart
    public onChartInit(e): void {
        this.targetElement = this.host.nativeElement.querySelector('#continuous-bidpricing');
        // @ts-ignore
        this.bidPriceObserver = new ResizeObserver(entries => {
            if (this.myChart) {
                this.refreshChartVisual();
            }
        });
        this.bidPriceObserver.observe(this.targetElement);
    }



    // Sets up Dom node and attaches myChart element
    public createSvg(): void {
        const chart: HTMLCanvasElement = document.getElementById('continuous-bidpricing') as HTMLCanvasElement;
        this.myChart = echarts.init(chart, 'light');
        this.createChartElement();
    }



    // Generates pieces and 
    public adjustPieceRegions() {
        this.sharedDatasetService.dynamicBidPrices = [];
        let xPlace = 0;
        let myMax = 0;

        this.pieces = [];

        this.sharedDatasetService.bucketDetails.map((item, i) => {
            xPlace = i === 0 ? 0 : xPlace += this.sharedDatasetService.bucketDetails[i - 1].protections;
            myMax = this.sharedDatasetService.bucketDetails[i + 1] ? myMax += this.sharedDatasetService.bucketDetails[i].protections : this.sharedDatasetService.bucketDetails[0].Aus;
            this.pieces.push({ min: xPlace, max: myMax, value: this.sharedDatasetService.currFareValue(item) })

            for (let i = 0; i < item.protections; i++) {
                const fareMod = this.sharedDatasetService.currFareValue(item)
                this.sharedDatasetService.dynamicBidPrices.push(fareMod)
            }

        })
        //console.log('this.pieces ', this.pieces, ' bucketDetails ', this.sharedDatasetService.bucketDetails)
        this.adjustPieceColorForBookingUpdates();
        this.generateInterpolatedCurvePoints();

        // this.adjustedCurvePoints = [];
        // this.interpolatedCurvePoints.forEach((ip, i) => {
        //     // console.log('ip ', ip)
        //     this.adjustedCurvePoints.push(ip.y)
        // })
    }

    public generateInterpolatedCurvePoints() {
        this.curveControlPoints = [];
        this.curvePointMultiplier = [];

        this.curvePointMultiplier.push(0);

        for (let m = this.sharedDatasetService.bucketDetails.length - 1; m > 0; m--) {
            this.curvePointMultiplier.push(Math.round(this.sharedDatasetService.bucketDetails[m].Sa / this.sharedDatasetService.bucketDetails[0].Aus * 100) / 100)
        }
        this.curvePointMultiplier.push(1);

        this.curveControlPoints = this.genDefaultCurvePoints(this.curvePointMultiplier);
        this.interpolatedCurvePoints = this.genInterpolatedCurvePoints(this.curveControlPoints);
    }

    public adjustPieceColorForBookingUpdates() {
        this.barSeriesValuesColors = [];
        let counter = 0;
        //console.log('this.pieces ', this.pieces, ' bucketDetails ', this.sharedDatasetService.bucketDetails)
        this.sharedDatasetService.bucketDetails.map((pc, i) => {
            for (let e = 0; e < pc.protections; e++) {
                // console.log('yep counter ', counter, ' els ', { value: pc.fare, barColor: this.setBookingElementsColor(i, counter) })
                this.barSeriesValuesColors.push({ value: pc.fare, barColor: this.setBookingElementsColor(i, counter) })
                counter++
            }
        })
    }

    private setBookingElementsColor(value, j) {
        const len = 150 - this.sharedDatasetService.totalBookingsCollector;
        let myColor;
        if (this.sharedDatasetService.bucketDetails[value].bookings === 0) {
            myColor = this.colorRange.value[value];
        } else {
            myColor = j < len ? this.colorRange.value[value] : 'rgba(5,155,5,1)'
        }
        // console.log('setBookingElementsColor myColor ', myColor, ' len ', len)
        return myColor
    }

    private genDefaultCurvePoints(set) {

        let list = new Array<BidPriceCurvePoints>();
        if (this.sharedDatasetService.dynamicBidPrices.length > 0) {
            list = set.map((d, i) => {
                const index = Math.round((this.sharedDatasetService.dynamicBidPrices.length - 1) * d);
                return { x: Math.round(Math.floor(this.sharedDatasetService.dynamicBidPrices.length * d)), y: this.sharedDatasetService.dynamicBidPrices[index] };
            });
        }
        return list;
    }


    // Generates rough estimate of a bid price curve <wip>
    public genInterpolatedCurvePoints(controlPoints: Array<BidPriceCurvePoints>) {
        const input = new Array<number>();

        for (const item of controlPoints) {
            input.push(item.x);
            input.push(item.y);
        }

        const splinePoints = getCurvePoints(input, .5, 100);
        const list = new Array<BidPriceCurvePoints>();
        let splineIdx = 2;
        let currSplineCoord: BidPriceCurvePoints = { x: splinePoints[0], y: splinePoints[1] };

        // crude method of assigning curve points to each bid price index
        for (let i = 0; i < this.sharedDatasetService.dynamicBidPrices.length; i++) {
            while (currSplineCoord.x < i) {
                splineIdx += 2;
                currSplineCoord = { x: Math.round(splinePoints[splineIdx]), y: Math.round(splinePoints[splineIdx + 1]) };
            }
            list.push(currSplineCoord);
        }
        return list;
    }


    // Re-generates chart elements
    public createChartElement(): void {
        const self = this;

        const updatePosition = () => {
            setTimeout(() => {
                setChartInstance();
            }, 100);
        };


        const setChartInstance = () => {

            self.myChart.setOption({
                grid: {
                    show: false,
                    left: 40,
                    right: 50,
                    top: 40,
                    bottom: 40
                },
                backgroundColor: 'rgba(205,225,245,0.05)',
                xAxis: [{
                    silent: true,
                    inverse: false,
                    type: 'category',
                    interval: 1,
                    boundaryGap: 0,

                    axisLine: {
                        onZero: true,
                        linestyle: {
                            color: 'black',
                        }
                    },
                    axisTick: {
                        alignWithLabel: true,
                    },
                    showGrid: false,
                    axisLabel: {
                        color: 'black',
                        interval: 1,
                        //align: 'end',
                        fontSize: 10,
                        showMinLabel: true,
                        showMaxLabel: true
                    },
                    data: self.sharedDatasetService.dynamicBidPrices.map((bp, i) => {
                        return self.sharedDatasetService.dynamicBidPrices.length - i
                    }),
                }
                ],
                tooltip: {
                    show: true,
                    trigger: 'axis',
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 2,
                    borderColor: 'Blue',
                    extraCssText: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);',
                    padding: 12,
                    // position: (point, params, dom, rect, size) => {
                    //   console.log('position ', params)
                    //   return [point[0], '36%'];
                    // },
                    textStyle: {
                        fontSize: 16,
                        color: '#000'
                    },

                    formatter: (params) => {
                        //console.log('params ', params)
                        return `Seat: ${self.sharedDatasetService.maxAuValue - params[0].data.value[0]}<br>Fare: ${params[0].data.value[1]}`
                    }
                },

                yAxis: {
                    silent: true,
                    type: 'value',
                    showGrid: false,
                    interval: 20,
                    scale: false,
                    boundaryGap: [0, '1%'],
                    splitLine: {
                        show: false
                    },
                    axisLine: {
                        show: true,
                        onZero: false
                    }
                },

                series: [
                    {
                        id: 'b',
                        type: 'line',
                        silent: false,
                        smooth: true,
                        animation: false,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 15,
                        z: 3,
                        lineStyle: {
                            type: 'solid',
                            color: 'Blue',
                            width: 3
                        },
                        itemStyle: {
                            normal: {
                                color: 'white',
                                borderColor: 'Blue',
                                borderWidth: 5
                            },
                            emphasis: {
                                color: 'white',
                                borderColor: 'Blue',
                                borderWidth: 2
                            }
                        },
                        // areaStyle: {
                        //   color: {
                        //     type: 'linear',
                        //     x: 0,
                        //     y: 0,
                        //     x2: 0,
                        //     y2: 1,
                        //     colorStops: [{
                        //       offset: 0, color: 'rgba(152, 29, 151, 0.5)'
                        //     }, {
                        //       offset: 1, color: 'rgba(152, 29, 151, 0.5)'
                        //     }],
                        //     global: false
                        //   }
                        // },
                        data: self.interpolatedCurvePoints.map((point, i) => {
                            return {
                                value: [point.x, point.y],
                            }
                        })
                    },
                    {
                        type: 'bar',
                        animation: false,
                        animationDuration: 1,
                        showBackground: true,
                        colorBy: 'series',
                        silent: true,
                        z: 1,
                        data: self.barSeriesValuesColors.map((serie, i) => {
                            // console.log('gbdserie ', serie)
                            return {
                                value: serie.value,
                                itemStyle: {
                                    normal: {
                                        color: serie.barColor
                                    },
                                    // emphasis: {
                                    //   color: '#0000fd'
                                    // }
                                }
                            }
                        }),
                        markLine: self.markVerticalLineSellingValues(),

                        markArea: {
                            silent: true,
                            itemStyle: {
                                borderColor: 'white',
                                borderWidth: 1
                            },
                            label: {
                                show: true,
                                backgroundColor: 'white',
                                padding: [3, 5, 0, 3],
                                fontSize: 13,
                                fontWeight: 'bold',
                                color: '#001871',
                                position: 'insideTop',
                                offset: [0, -25],
                            },
                            data: self.pieces.map((item, i) => {
                                return [{
                                    name: self.sharedDatasetService.bucketDetails[i].letter,
                                    xAxis: item.min - 1,
                                }, {
                                    itemStyle: {
                                        borderColor: 'rgba(100,100,100,0.5)',
                                        borderWidth: 1,
                                        color: 'rgba(0,0,100,0)'
                                    },
                                    xAxis: item.max - 1
                                }];
                            }),
                        },

                    },
                    {
                        id: 'c',
                        type: 'line',
                        animation: true,
                        silent: true,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 15,
                        lineStyle: {
                            type: 'solid',
                            color: 'red',
                            width: 4
                        },
                        data: self.adjustedCurvePoints

                    },
                    {
                        id: 'a',
                        type: 'line',
                        silent: true,
                        smooth: true,
                        animation: false,
                        showSymbol: false,
                        symbolSize: 0,
                        z: 2,
                        lineStyle: {
                            type: 'solid',
                            color: 'red',
                            width: 0
                        },

                        // label: {
                        //   show: true,
                        //   fontSize: 14,
                        //   position: 'top',
                        //   // emphasis: {
                        //   //   focus: 'self'
                        //   // },
                        //   formatter: (params) => {
                        //     let tipVal = `P: ${self.sharedDatasetService.bucketDetails[params.dataIndex].protections}  DF: ${params.data[1]}`;
                        //     return '{a|' + tipVal + '}';
                        //   },
                        //   rich: {
                        //     a: {
                        //       align: 'center',
                        //       padding: [5, 8, 3, 8],
                        //       fontSize: 14,
                        //       fontWeight: 'normal',
                        //       borderColor: 'navy',
                        //       backgroundColor: 'white',
                        //       borderWidth: 1,
                        //       borderRadius: 3,
                        //       color: 'navy',
                        //     },
                        //   },
                        // },

                        // itemStyle: {

                        //   color: 'red',
                        //   borderColor: '#001871',
                        //   borderWidth: 18
                        // },
                        data: self.pieces.map((piece, i) => {

                            return {
                                value: [piece.max, piece.value],
                                // itemStyle: {
                                //   normal: {
                                //     color: 'red',
                                //     borderColor: '#001871',
                                //     borderWidth: 15
                                //   },
                                //   emphasis: {
                                //     color: '#0000fd'
                                //   }
                                // }
                            }

                            //console.log('piece ', piece.value)
                            //return [piece.max, piece.value]
                        }),

                        markArea: {
                            silent: true,
                            itemStyle: {
                                borderColor: 'white',
                                borderWidth: 1
                            },
                            label: {
                                show: true,
                                backgroundColor: 'white',
                                padding: [3, 5, 0, 3],
                                fontSize: 13,
                                fontWeight: 'bold',
                                color: '#001871',
                                position: 'right',
                                offset: [0, -25],
                            },
                            data: self.pieces.map((item, i) => {
                                //console.log('item ', item)
                                return [{
                                    name: self.sharedDatasetService.bucketDetails[i].letter,
                                    yAxis: item.value,
                                }, {
                                    itemStyle: {
                                        borderColor: 'rgba(100,100,100,0.5)',
                                        borderWidth: 1,
                                        color: 'rgba(0,0,100,0)'
                                    },
                                    yAxis: item.value - item.min
                                }];
                            }),
                        },
                    }
                ]
            })
        }
        updatePosition();
    }


    public findMatchingBucketForBidPrice(bidPrice: number): BucketDetails {

        let currData: BucketDetails = null;
        for (const bucketInfo of this.sharedDatasetService.bucketDetails) {
            const fareValue = this.sharedDatasetService.currFareValue(bucketInfo)

            if ((currData === null) || (fareValue >= bidPrice)) {
                currData = bucketInfo;
            }
            if (fareValue < bidPrice) { break; }

        }
        return currData;
    }



    // Places lines vertically with labels on top of chart signifying fare call regions
    private markVerticalLineSellingValues() {
        let sellingPoint = 150 - this.sharedDatasetService.totalBookingsCollector + 1;

        if (sellingPoint < 0) {
            sellingPoint = 0;
        }

        const varArray = this.interpolatedCurvePoints.map((icp, i) => {
            return icp.y
        })

        const activeCurve = this.adjustedCurvePoints.length > 0 ? this.adjustedCurvePoints : varArray;

        const sellingValues = this.findMatchingBucketForBidPrice(activeCurve[sellingPoint]);

        if (sellingValues.bookings > 0) {

            const fareClass = `Selling: Class ${sellingValues.letter}`

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
                        return `{a|${fareClass} ${this.sharedDatasetService.dynamicBidPrices[sellingPoint]}}`
                    },
                    rich: {
                        a: {
                            align: 'center',
                            padding: [7, 10, 5, 10],
                            fontSize: 14,
                            fontWeight: 'bold',
                            borderColor: 'Green',
                            backgroundColor: 'Green',
                            borderWidth: 0,
                            borderRadius: 3,
                            color: '#e7e7e7',
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
                        yAxis: sellingValues.fare,

                        label: {
                            show: false,
                            name: 'testLabel',
                            id: 'test',
                            position: 'end',
                            distance: [-50, 0],
                            fontSize: 11,
                            borderRadius: 3,
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

}
