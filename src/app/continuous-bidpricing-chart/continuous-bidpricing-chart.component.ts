import { Component, OnInit, ElementRef } from '@angular/core';
import { ContinousColors, ColorObject, ConstraintType } from '../dashboard-constants';
import * as echarts from 'echarts';
import { BucketDetails, BidPriceInfluencers } from '../models/dashboard.model';
import { SharedDatasetService } from '../shared-datasets.service';
import { ColorManagerService } from '../color-manager-service';


const culori = require('culori')

@Component({
    selector: 'continuous-bid-pricing',
    templateUrl: './continuous-bidpricing-chart.component.html',
    styleUrls: ['./continuous-bidpricing-chart.component.scss'],
})

export class ContinousBidPricingComponent implements OnInit {

    public adjustedCurvePoints: any[] = [];

    public activeCurve: number[] = [];

    public modifierCollection = [];

    public barSeriesValuesColors: any[] = [];

    public selectedElement = [];

    public options: any = {};

    public myChart: echarts.ECharts = null;

    public modifierObj = { mult: 1.00, addSub: 0, min: 0, max: 99999 } as BidPriceInfluencers;

    public colorCollections: ColorObject[] = ContinousColors;

    public colorRange: any = {};

    public resetChartElementView = true;

    // Width observer
    public targetElement: any;
    public bidPriceObserver: any;


    constructor(
        public sharedDatasetService: SharedDatasetService,
        private colorManagerService: ColorManagerService,
        private host: ElementRef) {

        this.colorRange.value = this.colorManagerService.genColors(this.sharedDatasetService.bucketDetails.length);

        //console.log('this.colorRange.value ', this.colorRange.value)
        this.sharedDatasetService.bucketDetailsBehaviorSubject$
            .subscribe((state) => {

                if (this.myChart) {

                    //console.log(' $$$$ CONTINUOUS ', ' state ', state)

                    this.adjustPieceColorForBookingUpdates();
                    if (state) {
                        this.generateInterpolatedCurvePoints();
                    } else {
                        this.createChartElement();
                    }

                    if (this.modifierCollection.length > 0) {
                        this.adjustedCurvePoints = [];
                        this.sharedDatasetService.interpolateBidPriceCurvePoints.forEach((ip, i) => {
                            const staticArray = [...this.sharedDatasetService.interpolateBidPriceCurvePoints]
                            this.adjustedCurvePoints = this.applyAllInfluences(staticArray, this.modifierCollection);
                            this.activeCurve = this.adjustedCurvePoints;
                        })
                    } else {
                        this.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;
                    }
                }
            })

        this.sharedDatasetService.resetDefaultSubject$
            .subscribe(response => {
                console.log('resetDefaultSubject$ response ', response)
                this.sharedDatasetService.totalBookingsCollector = 0;
                this.sharedDatasetService.maxAuValue = this.sharedDatasetService.getMaxAu();
                this.sharedDatasetService.applyDataChanges();
                this.adjustPieceColorForBookingUpdates();
                this.generateInterpolatedCurvePoints();

                this.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;
                this.createChartElement();
            })

        this.sharedDatasetService.influenceInput$
            .subscribe(([response, mod, id]) => {
                //console.log('response ', response, ' idx ', mod, ' id ', id)
                if (response !== null) {
                    this.modifierObj[mod] = response;
                    const staticModifierObj = { mult: 1.00, addSub: 0, min: 0, max: 99999 };

                    this.adjustedCurvePoints = [];

                    Object.entries(staticModifierObj).forEach((d: any, i) => {
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

                    if (this.modifierCollection.length > 0) {

                        const staticArray = [...this.sharedDatasetService.interpolateBidPriceCurvePoints]
                        this.adjustedCurvePoints = this.applyAllInfluences(staticArray, this.modifierCollection);
                        this.activeCurve = this.adjustedCurvePoints;
                    } else {
                        this.adjustedCurvePoints = [];
                        this.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;
                    }

                    this.adjustPieceColorForBookingUpdates();
                    this.generateInterpolatedCurvePoints();
                    this.createChartElement();
                }
            })

    }

    ngOnInit(): void {
        this.sharedDatasetService.maxAuValue = this.sharedDatasetService.getMaxAu();
        this.sharedDatasetService.applyDataChanges();
        this.adjustPieceColorForBookingUpdates();
        this.generateInterpolatedCurvePoints();

        this.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;

        setTimeout(() => {
            this.createSvg();
        }, 0);
    }


    public updatePosition: () => void;


    public refreshChartVisual = () => {
        this.createChartElement();
    }



    // Called from template auto resize chart
    public onChartInit(e): void {

        this.targetElement = this.host.nativeElement.querySelector('#continuous-bidpricing');
        // @ts-ignore
        this.bidPriceObserver = new ResizeObserver(entries => {
            // console.log('|||||   refreshChartVisual ||||||   ')
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

        this.sharedDatasetService.bucketDetails.map((p, i) => {

            if (i === 0) {
                for (let m = 0; m < this.sharedDatasetService.bucketDetails[0].protections; m++) {

                    rangeArray.push(this.sharedDatasetService.bucketDetails[0].fare)
                }
            } else {
                stepper = (this.sharedDatasetService.bucketDetails[i - 1].fare - p.fare) / p.protections;

                rangeArray = ranger(this.sharedDatasetService.bucketDetails[i - 1].fare, p.fare, stepper, 2)
                //console.log('p ', p.letter, ' rangeArray ', rangeArray)
                rangeArray.shift();
            }
            // console.log('rangeArray letter ', p.letter, ' rangeArray ', rangeArray)
            result.push(...rangeArray)
        })

        this.sharedDatasetService.interpolateBidPriceCurvePoints = result;

    }



    public adjustPieceColorForBookingUpdates() {

        this.barSeriesValuesColors = [];
        this.sharedDatasetService.dynamicBidPrices = [];
        let counter = 0;
        let colorIncr = 0;
        this.sharedDatasetService.bucketDetails.map((pc, i) => {
            if (pc.protections > 0) {
                colorIncr++;
                for (let e = 0; e < pc.protections; e++) {
                    this.barSeriesValuesColors.push({ value: pc.fare, barColor: this.setBookingElementsColor(colorIncr, counter) })
                    counter++
                    this.sharedDatasetService.dynamicBidPrices.push(pc.fare)
                }
            }
        })
    }


    public setBookingElementsColor(value, j): string {
        const len = this.sharedDatasetService.maxAuValue - this.sharedDatasetService.totalBookingsCollector;
        //console.log('this.colorRange len  ', len, ' value ', value, ' j ', j)
        return j <= len ? this.colorRange.value[value] : 'green';
    }



    public selectBars(index) {

        // console.log(' selectedElement ', this.selectedElement)

        if (this.selectedElement.includes(index)) {
            this.selectedElement.splice(this.selectedElement.findIndex(idx => idx === index), 1);

            this.myChart.dispatchAction({
                type: 'unselect',
                seriesName: 'AUs',
                dataIndex: index
            })
        } else {
            this.selectedElement.push(index);
            this.myChart.dispatchAction({
                type: 'select',
                seriesName: 'AUs',
                dataIndex: index
            })
        }

    }

    // Re-generates chart elements
    public createChartElement(): void {
        const self = this;


        // self.myChart.on('datazoom', (params) => {
        //     console.log('||  dataZoom || ', params)
        //     this.resetChartElementView = false;
        //     //this.myChart.resize();
        //     setChartDragPoints();
        // })

        const updatePosition = () => {
            setChartInstance();
            setTimeout(() => {
                setChartDragPoints();
            }, 10);
        };

        const selectModifier = (dataIndex) => {
            self.selectedElement = dataIndex;
            setChartDragPoints();
        };



        const onPointDragging = function (dataIndex) {

            let yValue = 0;
            let dragPosition: any = [0, 0];
            const target = dataIndex + 1;
            dragPosition = self.myChart.convertFromPixel({ gridIndex: 0 }, this.position);
            yValue = self.sharedDatasetService.maxAuValue - Math.round(Math.floor(dragPosition[0]));
            //console.log('dragPosition ', this.position, ' dataIndex ', test, ' Letter ', self.sharedDatasetService.bucketDetails[test].letter)
            if (yValue < 1) { yValue = 1; }
            if (yValue > self.sharedDatasetService.maxAuValue) { yValue = self.sharedDatasetService.maxAuValue }
            self.sharedDatasetService.calculateBidPriceForAu(self.sharedDatasetService.currAus[target], target, yValue);
            self.sharedDatasetService.applyDataChanges();
            updatePosition();
        }



        function showTooltip(dataIndex) {
            console.log('showTooltip ', dataIndex)
            self.myChart.dispatchAction({
                type: 'showTip',
                position: [0, 0],
                seriesIndex: 0,
                dataIndex: dataIndex
            });
        }


        const setChartDragPoints = function () {

            const symbolSize = 26;
            let placeTemp = 0;
            self.myChart.setOption({

                graphic: echarts.util.map(self.sharedDatasetService.bucketDetails, (item, dataIndex) => {
                    const xPlace = placeTemp += item.protections
                    const dragPoint = 0;
                    let doesInclude = self.selectedElement.includes(dataIndex) ? true : false;

                    const scaleHandles = dataIndex === self.sharedDatasetService.bucketDetails.length - 1 ? [] : [xPlace, dragPoint]
                    //const scaleText = [xPlace - 1, dragPoint + 8]
                    const fillColor = doesInclude ? 'red' : 'white';
                    const strokeColor = dataIndex === self.sharedDatasetService.bucketDetails.length - 1 ? 'transparent' : doesInclude ? 'Blue' : 'Blue';
                    const lineWidth = doesInclude ? 2 : 1;

                    return {
                        type: 'group',
                        // left: '10%',
                        // top: 'center',
                        children: [

                            // {
                            //     type: 'text',
                            //     position: self.myChart.convertToPixel('grid', scaleText),
                            //     z: 102,
                            //     style: {
                            //         fill: 'black',
                            //         text: item.letter,
                            //         font: 'bold 14px sans-serif'
                            //     }
                            // },
                            {
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
                                // onmouseover: function () {
                                //     showTooltip(dataIndex);
                                // },
                                z: 100
                            },

                        ]
                    }
                })
            })
        }

        const selectElement = (dataIndex) => {
            self.selectBars(dataIndex)
            setChartDragPoints();
        };


        const setChartInstance = () => {

            let incr = 0;

            self.myChart.setOption({
                grid: {
                    show: false,
                    left: 40,
                    right: 30,
                    top: 40,
                    bottom: 40
                },
                backgroundColor: 'rgba(205,225,245,0.05)',
                toolbox: {
                    show: true,
                    right: 60,
                    top: -7,
                    itemSize: 13,
                    emphasis: {
                        iconStyle: {
                            textPosition: 'left',
                            textBackgroundColor: 'white'
                        }
                    },
                    feature: {
                        dataZoom: {
                            show: true,
                            yAxisIndex: 'none',
                            iconStyle: {
                                textBackgroundColor: 'white'
                            },
                            emphasis: {
                                iconStyle: {
                                    borderColor: 'navy'
                                }
                            },
                            brushStyle: {
                                borderColor: 'lightBlue',
                                borderWidth: 1
                            }
                            // icon: {
                            //     back: 'activeState'
                            // }
                        },
                        //restore: {},
                    }
                },
                tooltip: {
                    show: true,
                    trigger: 'axis',
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 2,
                    borderColor: 'Blue',
                    extraCssText: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);',
                    padding: 5,
                    textStyle: {
                        fontSize: 12,
                        color: '#000'
                    },
                    // axisPointer: {
                    //     link: { xAxisIndex: 'all' },
                    //     type: 'cross',
                    //     snap: true,
                    //     label: {
                    //         backgroundColor: '#6a7985'
                    //     }
                    // },
                    formatter: (params) => {
                        let bucket = null;
                        // console.log('letter ', params)
                        if (self.findMatchingBucketForBidPrice(this.activeCurve[params[0].dataIndex])) {
                            bucket = self.findMatchingBucketForBidPrice(this.activeCurve[params[0].dataIndex]).letter;
                        }

                        let testForSecond = ''
                        if (params[3]) {
                            testForSecond = `${params[3].marker}Influenced: ${params[3].data}<br>`
                        }
                        return `${params[0].marker}Class: ${bucket}<br>${testForSecond}${params[2].marker}Modified: ${params[2].data}<br>${params[1].marker}Base: ${params[1].data}`
                    }
                },
                // dataZoom: [
                //     {
                //         type: 'slider',
                //         show: true,
                //         xAxisIndex: [0],
                //         start: 1,
                //         end: self.sharedDatasetService.dynamicBidPrices.length
                //     },
                //     {
                //         type: 'inside',
                //         xAxisIndex: [0],
                //         start: 1,
                //         end: self.sharedDatasetService.dynamicBidPrices.length
                //     }
                // ],
                xAxis: {
                    silent: true,
                    inverse: false,
                    type: 'category',
                    boundaryGap: true,
                    nameGap: 43,
                    axisLine: {
                        onZero: true,
                        linestyle: {
                            color: 'black',
                        }
                    },
                    axisTick: {
                        alignWithLabel: true,
                        length: 13,
                        minorTick: {
                            show: true
                        }
                    },
                    showGrid: false,
                    axisLabel: {
                        color: 'black',
                        interval: 1,
                        margin: 15,
                        hideOverlap: true,
                        //align: 'middle',
                        fontSize: 10,
                        showMinLabel: true,
                        showMaxLabel: true
                    },
                    data: self.sharedDatasetService.dynamicBidPrices.map((bp, i) => {
                        return self.sharedDatasetService.dynamicBidPrices.length - i
                    }),
                },
                yAxis: {
                    silent: true,
                    type: 'value',
                    showGrid: false,
                    interval: 20,
                    scale: false,
                    //boundaryGap: [0, '1%'],
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
                        type: 'bar',
                        animation: false,
                        animationDuration: 1,
                        showBackground: true,
                        colorBy: 'series',
                        silent: true,
                        z: 1,
                        data: self.barSeriesValuesColors.map((serie, i) => {
                            //console.log('serie  i', i, ' serie ', serie)

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
                        markLine: (this.sharedDatasetService.totalBookingsCollector > 0 && this.sharedDatasetService.totalBookingsCollector < this.sharedDatasetService.maxAuValue) ? self.markVerticalLineSellingValues() : null,

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

                            data: self.sharedDatasetService.currAus.map((item, i) => {
                                if (self.sharedDatasetService.currAus[i + 1]) {
                                    incr += self.sharedDatasetService.currAus[i] - self.sharedDatasetService.currAus[i + 1]
                                    //console.log(' currAus ', incr, ' item ', item, ' currAus ', self.sharedDatasetService.currAus[i])
                                } else {
                                    incr += self.sharedDatasetService.currAus[i];
                                }
                                return [{
                                    name: self.sharedDatasetService.bucketDetails[i].letter,
                                    xAxis: self.sharedDatasetService.currAus[0] - item,
                                }, {
                                    itemStyle: {
                                        borderColor: 'rgba(100,100,100,0.5)',
                                        borderWidth: 1,
                                        color: 'rgba(0,0,100,0)'
                                    },
                                    xAxis: incr
                                }];

                            })
                        },
                    },
                    {
                        id: 'e',
                        type: 'line',
                        //animation: true,
                        silent: true,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 10,
                        itemStyle: {
                            borderColor: 'red',
                            borderWidth: 1,
                            color: 'red'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: 'red',
                            width: 0
                        },
                        data: self.sharedDatasetService.dynamicBidPrices,
                    },
                    {
                        id: 'd',
                        type: 'line',
                        animation: false,
                        silent: true,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 10,
                        z: 2,
                        itemStyle: {
                            borderColor: 'blue',
                            borderWidth: 1,
                            color: 'blue'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: 'blue',
                            width: 4
                        },
                        data: self.sharedDatasetService.interpolateBidPriceCurvePoints,
                        markPoint: self.markPoint()
                    },
                    {
                        id: 'c',
                        type: 'line',
                        silent: true,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 10,
                        itemStyle: {
                            borderColor: 'green',
                            borderWidth: 1,
                            color: 'green'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: 'green',
                            width: 3
                        },
                        data: self.adjustedCurvePoints,
                    },

                ]
            })
        }

        updatePosition();
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


    // Fare class currently selling 
    public markPoint(): any {

        let sellingPoint = this.sharedDatasetService.maxAuValue - this.sharedDatasetService.totalBookingsCollector;
        const coordinatesForMarkPoint = [sellingPoint, this.activeCurve[sellingPoint]]
        const sellingValues = this.findMatchingBucketForBidPrice(this.activeCurve[sellingPoint]);
        const activeColor = this.adjustedCurvePoints.length ? 'green' : 'navy';

        return {
            clickable: false,
            animation: false,
            data: [
                {
                    coord: coordinatesForMarkPoint,
                    symbol: 'circle',
                    symbolSize: 22,
                    itemStyle: {
                        color: activeColor,
                    },
                    label: {
                        show: true,
                        offset: [0, 1],
                        formatter: () => {
                            console.log('sellingValues ', sellingValues)
                            return '{a|' + sellingValues.letter + '}';
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

    // Places lines vertically with labels on top of chart signifying fare call regions
    private markVerticalLineSellingValues() {

        let sellingPoint = this.sharedDatasetService.maxAuValue - this.sharedDatasetService.totalBookingsCollector;

        if (sellingPoint < 0) {
            sellingPoint = 0;
        }
        const activeColor = this.adjustedCurvePoints.length ? 'green' : 'navy';
        const baseCurve = this.sharedDatasetService.dynamicBidPrices;

        if (this.sharedDatasetService.totalBookingsCollector > 0) {
            const rounded = Math.round(this.activeCurve[sellingPoint]);
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
                        yAxis: this.activeCurve[sellingPoint],

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

        //this.updateBidPriceChartFunction();
        return aggregate[aggregate.length - 1];

    }
}
