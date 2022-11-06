import { Component, OnInit, ElementRef } from '@angular/core';
import { ContinousColors, ColorObject, ConstraintType } from '../dashboard-constants';
import * as echarts from 'echarts';
import { Subscription } from 'rxjs'
import { BucketDetails, BidPriceInfluencers } from '../models/dashboard.model';
import { SharedDatasetService } from '../shared-datasets.service';
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

    public interpolateCurvePointsFromPieces: any[] = [];
    public adjustedCurvePoints: any[] = [];
    public seatsLeftToSell = 0;
    public curvePointMultiplier: number[] = [];
    public curveControlPoints: any[] = [];
    public modifierCollection = [];
    public barSeriesValuesColors: any[] = [];

    public markPointUpdatedPosition: any = [];

    public selectedElement = [];

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

                    //console.log(' $$$$ CONTINUOUS ', buckets, ' state ', state)
                    if (state) {
                        this.adjustPieceRegions();
                    } else {
                        this.adjustPieceColorForBookingUpdates();
                    }
                    this.createChartElement();

                    // console.log('modifierCollection ', this.modifierCollection, '\n mcollect ', this.adjustedCurvePoints)
                    // if (this.modifierCollection.length > 0) {
                    //     this.adjustedCurvePoints = [];
                    //     this.interpolateCurvePointsFromPieces.forEach((ip, i) => {
                    //         //console.log('ip ', ip)
                    //         this.adjustedCurvePoints.push(ip)
                    //     })
                    // }
                }
            })


        this.sharedDatasetService.influenceInput$
            .subscribe(([response, mod, id]) => {
                // console.log('response ', response, ' idx ', mod, ' id ', id)
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

                    this.interpolateCurvePointsFromPieces.forEach((ip, i) => {
                        // console.log('ip ', ip)
                        this.adjustedCurvePoints.push(ip)
                    })

                    const staticArray = [...this.adjustedCurvePoints];

                    this.adjustedCurvePoints = this.applyAllInfluences(staticArray, this.modifierCollection);

                    console.log('response ', this.adjustedCurvePoints)

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

    public updatePosition: () => void;


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
        this.createChartElement();
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
                //console.log('xPlace ', xPlace)
                const fareMod = this.sharedDatasetService.currFareValue(item)
                //console.log('fareMod ', fareMod)
                this.sharedDatasetService.dynamicBidPrices.push(fareMod)
            }
        })

        //console.log('this.pieces ', this.pieces, ' bucketDetails ', this.sharedDatasetService.bucketDetails)
        this.adjustPieceColorForBookingUpdates();
        this.generateInterpolatedCurvePoints();
    }


    public generateInterpolatedCurvePoints() {

        let stepper = 0;

        // @ts-ignore
        function ranger(from, to, step, prec) {
            if (typeof from == 'number') {
                const A = [from];
                step = typeof step == 'number' ? Math.abs(step) : 1;
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

        this.pieces.map((p, i) => {
            if (i === 0) {
                for (let m = 0; m < this.pieces[0].max; m++) {
                    rangeArray.push(this.pieces[0].value)
                }
            } else {
                stepper = (this.pieces[i - 1].value - p.value) / this.sharedDatasetService.bucketDetails[i].protections;
                rangeArray = ranger(this.sharedDatasetService.bucketDetails[i - 1].fare, this.sharedDatasetService.bucketDetails[i].fare, stepper, 2)
                rangeArray.pop();
            }
            result.push(...rangeArray)
        })

        this.interpolateCurvePointsFromPieces = result;

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


    // Re-generates chart elements
    public createChartElement(): void {
        const self = this;

        const updatePosition = () => {
            setChartInstance();
            setTimeout(() => {
                setChartDragPoints()
            }, 100);
        };


        const onPointDragging = function (dataIndex) {

            let yValue = 0;
            let dragPosition: any = [0, 0];
            const test = dataIndex + 1;
            dragPosition = self.myChart.convertFromPixel({ gridIndex: 0 }, this.position);

            yValue = self.sharedDatasetService.maxAuValue - Math.round(Math.floor(dragPosition[0]));

            //console.log('dragPosition ', yValue, ' dataIndex ', test, ' Letter ', self.sharedDatasetService.bucketDetails[test].letter)

            if (yValue < 1) { yValue = 1; }
            if (yValue > self.sharedDatasetService.maxAuValue) { yValue = self.sharedDatasetService.maxAuValue }

            self.sharedDatasetService.calculateBidPriceForAu(self.sharedDatasetService.currAus[test], test, yValue);
            self.sharedDatasetService.applyDataChanges();
            self.sharedDatasetService.generateBucketValues();
            updatePosition();
        }


        const setChartDragPoints = function () {

            const symbolSize = 24;

            self.myChart.setOption({

                //graphic: echarts.util.map(self.pieces, (item, dataIndex) => {

                graphic: echarts.util.map(self.sharedDatasetService.bucketDetails, (item, dataIndex) => {

                    const xPlace = self.pieces[dataIndex].max;
                    const dragPoint = self.myChart.getHeight() - 40;
                    const scaleHandles = [xPlace, dragPoint]
                    let doesInclude = dataIndex !== self.pieces.length - 1 ? true : false;
                    const fillColor = doesInclude ? 'white' : 'transparent';
                    const strokeColor = doesInclude ? 'Blue' : 'transparent';
                    const lineWidth = doesInclude ? 3 : 0;

                    return {
                        type: 'circle',
                        position: self.myChart.convertToPixel('grid', scaleHandles),
                        shape: {
                            cx: 0,
                            cy: 0,
                            r: symbolSize / 3
                        },
                        style: {
                            fill: fillColor,
                            stroke: strokeColor,
                            lineWidth: lineWidth
                        },
                        invisible: false,
                        draggable: true,
                        ondrag: echarts.util.curry(onPointDragging, dataIndex),
                        // onclick: echarts.util.curry(selectElement, dataIndex),
                        z: 100
                    };
                })
            })
        }

        const selectElement = (dataIndex) => {
            //console.log('selectElement ', dataIndex)
            //self.selectBars(dataIndex)
            setChartDragPoints();
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
                    // axisPointer: {
                    //     link: { xAxisIndex: 'all' },
                    //     type: 'cross',
                    //     snap: true,
                    //     label: {
                    //         backgroundColor: '#6a7985'
                    //     }
                    // },
                    textStyle: {
                        fontSize: 16,
                        color: '#000'
                    },

                    formatter: (params) => {
                        //console.log('params ', params[1])
                        return `Seat: ${params[1].axisValue}<br>Fare: ${params[1].data}`
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
                    // {
                    //     id: 'b',
                    //     type: 'line',
                    //     silent: false,
                    //     smooth: true,
                    //     animation: false,
                    //     showSymbol: true,
                    //     selectedMode: false,
                    //     symbolSize: 0,
                    //     z: 3,
                    //     lineStyle: {
                    //         type: 'solid',
                    //         color: 'Blue',
                    //         width: 0
                    //     },
                    //     // itemStyle: {
                    //     //     normal: {
                    //     //         color: 'white',
                    //     //         borderColor: 'Blue',
                    //     //         borderWidth: 10
                    //     //     },
                    //     //     // emphasis: {
                    //     //     //     color: 'white',
                    //     //     //     borderColor: 'Blue',
                    //     //     //     borderWidth: 2
                    //     //     // }
                    //     // },
                    //     label: {
                    //         show: false,
                    //         // backgroundColor: 'white',
                    //         // padding: [3, 5, 0, 3],
                    //         // fontSize: 13,
                    //         // fontWeight: 'bold',
                    //         // color: '#001871',
                    //         // position: 'insideTop',
                    //         // offset: [0, -25],
                    //         // formatter: (params) => {
                    //         //     //console.log('params ', params)
                    //         //     return self.sharedDatasetService.bucketDetails[params.dataIndex].letter

                    //         // },
                    //     },
                    //     data: self.pieces.map((point, i) => {
                    //         return {
                    //             value: [point.max, point.value],
                    //         }
                    //     })
                    //},
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
                                    //     color: '#0000fd'
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
                                    xAxis: item.min,
                                }, {
                                    itemStyle: {
                                        borderColor: 'rgba(100,100,100,0.5)',
                                        borderWidth: 1,
                                        color: 'rgba(0,0,100,0)'
                                    },
                                    xAxis: item.max
                                }];
                            }),
                        },

                    },
                    {
                        id: 'd',
                        type: 'line',
                        animation: false,
                        silent: true,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 15,
                        z: 2,
                        itemStyle: {
                            borderColor: 'blue',
                            borderWidth: 3,
                            color: 'blue'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: 'blue',
                            width: 3
                        },
                        data: self.interpolateCurvePointsFromPieces,
                        markPoint: self.markPointUpdatedPosition
                    },
                    {
                        id: 'c',
                        type: 'line',
                        //animation: true,
                        silent: true,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 15,
                        itemStyle: {
                            borderColor: 'green',
                            borderWidth: 3,
                            color: 'green'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: 'green',
                            width: 3
                        },
                        data: self.adjustedCurvePoints,
                    },
                    {
                        id: 'e',
                        type: 'line',
                        //animation: true,
                        silent: true,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 15,
                        itemStyle: {
                            borderColor: 'red',
                            borderWidth: 3,
                            color: 'red'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: 'red',
                            width: 3
                        },
                        data: self.sharedDatasetService.dynamicBidPrices,
                    }

                ]
            })
        }
        updatePosition();
    }


    public markPoint(position: any, color, label): any {
        return {
            clickable: false,
            animation: false,
            data: [
                {
                    coord: position,
                    symbol: 'circle',
                    symbolSize: 22,
                    itemStyle: {
                        color: color,
                    },
                    label: {
                        show: true,
                        offset: [0, 1],
                        formatter: () => {
                            return '{a|' + label + '}';
                        },
                        rich: {
                            a: {
                                align: 'center',
                                fontSize: 12,
                                color: 'white'
                            },
                        },
                    }
                }
            ]
        };
    }


    public findMatchingBucketForBidPrice(bidPrice: number): BucketDetails {

        let currData: BucketDetails = null;
        for (const bucketInfo of this.sharedDatasetService.bucketDetails) {
            const fareValue = bucketInfo.fare;
            if (fareValue < bidPrice) {
                currData = bucketInfo;
                //console.log('fareValue ', fareValue, ' bidPrice ', bidPrice, ' currData ', currData)
                break;
            }
        }
        //console.log('letter ', currData.letter, ' currData ', currData.fare)
        return currData;
    }



    // Places lines vertically with labels on top of chart signifying fare call regions
    private markVerticalLineSellingValues() {

        let sellingPoint = 149 - this.sharedDatasetService.totalBookingsCollector;

        if (sellingPoint < 0) {
            sellingPoint = 0;
        }

        const activeCurve = this.interpolateCurvePointsFromPieces;
        const baseCurve = this.sharedDatasetService.dynamicBidPrices;
        const sellingValues = this.findMatchingBucketForBidPrice(activeCurve[sellingPoint]);

        if (this.sharedDatasetService.totalBookingsCollector > 0) {

            const fareClass = `Selling: ${activeCurve[sellingPoint]}`

            this.markPointUpdatedPosition = this.markPoint([sellingPoint, this.interpolateCurvePointsFromPieces[sellingPoint]], 'green', sellingValues.letter)

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
                    distance: [0, -80],
                    formatter: () => {
                        return `{a|${fareClass}\nBase: ${baseCurve[sellingPoint]}}`
                    },
                    rich: {
                        a: {
                            align: 'center',
                            padding: [7, 0, 5, 0],
                            width: 100,
                            fontSize: 14,
                            fontWeight: 'normal',
                            borderColor: 'Green',
                            backgroundColor: 'Green',
                            borderWidth: 3,
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
                        symbolSize: 6,
                        yAxis: activeCurve[sellingPoint],

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
