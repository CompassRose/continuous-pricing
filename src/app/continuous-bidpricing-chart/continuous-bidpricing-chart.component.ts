import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { BucketDetails, BidPriceInfluencers, BarSeries } from '../models/dashboard.model';
import { SharedDatasetService } from '../shared-datasets.service';
import { startWith, delay, distinctUntilChanged } from 'rxjs';
import { BidPriceCalcsService } from '../bid-price-calcs';

import * as echarts from 'echarts';

@Component({
    selector: 'continuous-bid-pricing',
    templateUrl: './continuous-bidpricing-chart.component.html',
    styleUrls: ['./continuous-bidpricing-chart.component.scss'],
})

export class ContinousBidPricingComponent implements OnInit, AfterViewInit {

    public adjustedCurvePoints: any[] = [];
    public modifierCollection = [];
    public barSeriesValuesColors: BarSeries[] = [];
    public selectedElement = [];
    public options: any = {};
    public myChart: echarts.ECharts = null;
    public modifierObj = { mult: 1.00, addSub: 0, min: 0, max: 99999 } as BidPriceInfluencers;
    public colorRange: string[] = [];
    public resetChartElementView = true;
    public markPointContainer: any = {};

    public differenceCalulation: number[] = [0, 0];

    // Width observer
    public targetElement: any;
    public bidPriceObserver: any;


    constructor(
        public sharedDatasetService: SharedDatasetService,
        public bidPriceCalcsService: BidPriceCalcsService,
        private host: ElementRef) {

        this.sharedDatasetService.interpolatedBidPriceSumSubject$.next(0);

        this.colorRange = this.bidPriceCalcsService.getColorValues();

        this.sharedDatasetService.bucketDetailsBehaviorSubject$
            .subscribe((state) => {

                if (this.myChart) {
                    //console.log('bucketDetailsBehaviorSubject$$ response ', this.sharedDatasetService.bucketDetails, ' currAus ', this.sharedDatasetService.currAus)
                    this.barSeriesValuesColors = this.bidPriceCalcsService.adjustPieceColorForBookingUpdates();
                    if (state) {
                        this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
                    } else {
                        this.createChartElement();
                    }

                    if (this.modifierCollection.length > 0) {
                        this.adjustedCurvePoints = [];
                        this.sharedDatasetService.interpolateBidPriceCurvePoints.forEach((ip, i) => {
                            const staticArray = [...this.sharedDatasetService.interpolateBidPriceCurvePoints]
                            this.adjustedCurvePoints = this.bidPriceCalcsService.applyAllInfluences(staticArray, this.modifierCollection);
                            this.sharedDatasetService.activeCurve = this.adjustedCurvePoints;
                        })
                    } else {
                        this.sharedDatasetService.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;
                    }
                    this.loadInterpolatedBidPriceValues('activeCurve');
                    this.loadDynamicBidPriceValues('dynamicBidPrices');

                }
            })

        this.sharedDatasetService.resetDefaultSubject$
            .subscribe(response => {

                //console.log('response ', response)
                this.sharedDatasetService.totalBookingsCollector = 0;
                this.sharedDatasetService.maxAuValue = this.sharedDatasetService.getMaxAu();

                this.sharedDatasetService.applyDataChanges();

                this.barSeriesValuesColors = this.bidPriceCalcsService.adjustPieceColorForBookingUpdates();
                this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
                this.sharedDatasetService.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;
                this.loadInterpolatedBidPriceValues('activeCurve');
                this.loadDynamicBidPriceValues('dynamicBidPrices');
                this.createChartElement();
            })


        this.sharedDatasetService.influenceInput$
            .subscribe(([response, mod, id]) => {

                if (response !== null) {
                    //console.log('response ', response, ' idx ', mod, ' id ', id)
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
                        this.adjustedCurvePoints = this.bidPriceCalcsService.applyAllInfluences(staticArray, this.modifierCollection);
                        this.sharedDatasetService.activeCurve = this.adjustedCurvePoints;

                    } else {
                        this.adjustedCurvePoints = [];
                        this.sharedDatasetService.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;
                    }

                    this.loadInterpolatedBidPriceValues('activeCurve');
                    this.barSeriesValuesColors = this.bidPriceCalcsService.adjustPieceColorForBookingUpdates();
                    this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
                    this.createChartElement();
                }
            })

    }


    public ngOnInit(): void {

        this.sharedDatasetService.maxAuValue = this.sharedDatasetService.getMaxAu();
        this.sharedDatasetService.applyDataChanges();

        this.sharedDatasetService.archivedBucketDetails = JSON.parse(JSON.stringify(this.sharedDatasetService.bucketDetails));

        this.barSeriesValuesColors = this.bidPriceCalcsService.adjustPieceColorForBookingUpdates();
        this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();

        this.sharedDatasetService.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;

        setTimeout(() => {
            this.createSvg();
        }, 0);
    }


    public ngAfterViewInit(): void {

        this.sharedDatasetService.steppedBidPriceSumSubject$
            .pipe(
                startWith(null),
                delay(0),
                distinctUntilChanged()
            ).subscribe((res => {
                this.loadDynamicBidPriceValues('dynamicBidPrices');
            }));

        this.sharedDatasetService.interpolatedBidPriceSumSubject$
            .pipe(
                startWith(null),
                delay(0),
                distinctUntilChanged()
            ).subscribe((res => {
                this.loadInterpolatedBidPriceValues('activeCurve');
            }));


    }


    public loadDynamicBidPriceValues(metric: string) {

        const sumTotal = this.sharedDatasetService[metric].reduce((accumulator, value) => {
            return accumulator + value;
        }, 0)

        this.differenceCalulation[0] = sumTotal;

        //console.log('sumTotal  ', sumTotal)
        this.sharedDatasetService.steppedBidPriceSumSubject$.next(sumTotal);
    }



    public loadInterpolatedBidPriceValues(metric: string) {

        let diff = 0;
        const interpTotal = this.sharedDatasetService[metric].reduce((accumulator, value) => {
            return accumulator + value;
        }, 0)

        this.sharedDatasetService.interpolatedBidPriceSumSubject$.next(interpTotal)

        this.differenceCalulation[1] = interpTotal;

        diff = this.differenceCalulation[1] - this.differenceCalulation[0];

        this.sharedDatasetService.differenceValueSubject$.next(diff)

        //console.log('interpTotal  ', interpTotal, ' this.differenceCalulation ', this.differenceCalulation)
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

        const updatePosition = () => {
            setChartInstance();
            setChartDragPoints();
        };



        const onPointDragging = function (dataIndex) {

            let yValue = 0;
            let dragPosition: any = [0, 0];
            const target = dataIndex + 1;
            dragPosition = self.myChart.convertFromPixel({ gridIndex: 0 }, this.position);
            yValue = self.sharedDatasetService.maxAuValue - Math.round(Math.floor(dragPosition[0]));
            //console.log('dragPosition  target ', target, ' Letter ', self.sharedDatasetService.bucketDetails[target].letter, ' BD ', self.sharedDatasetService.currAus)
            if (yValue < 1) { yValue = 0; }
            if (yValue > self.sharedDatasetService.maxAuValue) { yValue = self.sharedDatasetService.maxAuValue }
            self.sharedDatasetService.calculateBidPriceForAu(self.sharedDatasetService.currAus[target], target, yValue);
            self.sharedDatasetService.applyDataChanges();
            updatePosition();
        }


        const showTooltip = (dataIndex, params) => {
            // console.log('showTooltip ', params)
            self.myChart.dispatchAction({
                type: 'showTip',
                position: [params.offsetX - 10, params.offsetY - 50],
                seriesIndex: 0,
                dataIndex: dataIndex
            });
        }

        const hideTooltip = (dataIndex, params) => {
            // console.log('hideTooltip ', params)

            self.myChart.dispatchAction({
                type: 'hideTip',
                position: [params.offsetX - 10, params.offsetY - 50],
                seriesIndex: 0,
                dataIndex: dataIndex
            });
        }

        const setChartDragPoints = function () {

            const symbolSize = 26;
            let placeTemp = 0;
            self.myChart.setOption({

                graphic: echarts.util.map(self.sharedDatasetService.bucketDetails, (item, dataIndex) => {

                    const xPlace = placeTemp += item.protections;

                    const dragPoint = 0;
                    let doesInclude = self.selectedElement.includes(dataIndex) ? true : false;

                    const scaleHandles = (dataIndex === self.sharedDatasetService.bucketDetails.length - 1) ? [] : [xPlace, dragPoint];
                    const fillColor = doesInclude ? 'red' : 'white';
                    const strokeColor = (dataIndex === self.sharedDatasetService.bucketDetails.length - 1) ? 'transparent' : 'Blue';
                    const lineWidth = doesInclude ? 2 : 1;

                    return {
                        type: 'circle',
                        id: dataIndex,
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
                        onmousemove: echarts.util.curry(showTooltip, dataIndex),
                        //onclick: echarts.util.curry(mouseClick, dataIndex),
                        onmouseover: echarts.util.curry(showTooltip, dataIndex),
                        onmouseout: echarts.util.curry(hideTooltip, dataIndex),
                        z: 100
                    }
                })
            })
        }

        const selectElement = (dataIndex) => {
            self.selectBars(dataIndex)
            setChartDragPoints();
        };


        const setChartInstance = () => {

            // let incr = 0;

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
                    show: false,
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
                    position: function (pos, params, dom, rect, size) {
                        if ((size.viewSize[0] - pos[0]) > 140) {
                            pos[0] = pos[0] + 0
                        } else {
                            pos[0] = pos[0] - 150
                        }
                        pos[1] = pos[1] - 80;
                        return pos;
                    },
                    formatter: (params) => {
                        let bucket = null;
                        let tester = '';
                        if (self.bidPriceCalcsService.findMatchingBucketForBidPrice(this.sharedDatasetService.interpolateBidPriceCurvePoints[params[0].dataIndex])) {
                            bucket = self.bidPriceCalcsService.findMatchingBucketForBidPrice(this.sharedDatasetService.interpolateBidPriceCurvePoints[params[0].dataIndex]).letter;
                        }
                        tester = `<div style="width: 110px;">
                        <div>${params[2].marker}Continuous: <span style="float: right;">${this.sharedDatasetService.interpolateBidPriceCurvePoints[params[1].dataIndex].toFixed(0)}</span></div>
                        <div>${params[1].marker}Fixed: <span style="float: right;">${this.sharedDatasetService.dynamicBidPrices[params[2].dataIndex]}</span></div></div>`;
                        return tester;
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
                    //max: self.sharedDatasetService.dynamicBidPrices[0] + 10,
                    interval: 20,
                    max: 220,
                    scale: false,
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
                        silent: false,
                        z: 1,
                        data: self.barSeriesValuesColors.map((serie, i) => {

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
                        markLine: (this.sharedDatasetService.totalBookingsCollector > 0 && this.sharedDatasetService.totalBookingsCollector < this.sharedDatasetService.maxAuValue) ? self.bidPriceCalcsService.markVerticalLineSellingValues() : null,

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

                            data: self.sharedDatasetService.bucketDetails.map((item, i) => {

                                return [{
                                    name: item.protections > 0 ? self.sharedDatasetService.bucketDetails[i].letter : '',
                                    xAxis: self.sharedDatasetService.maxAuValue - item.Aus,
                                }, {
                                    itemStyle: {
                                        borderColor: 'rgba(100,100,100,0.5)',
                                        borderWidth: 1,
                                        color: 'rgba(0,0,100,0)'
                                    },
                                    xAxis: self.sharedDatasetService.bucketDetails[i + 1] ? self.sharedDatasetService.maxAuValue - self.sharedDatasetService.bucketDetails[i + 1].Aus : self.sharedDatasetService.maxAuValue
                                }];

                            })
                        }
                    },
                    {
                        id: 'e',
                        type: 'line',
                        animation: false,
                        silent: false,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 10,
                        itemStyle: {
                            borderColor: 'red',
                            borderWidth: 0,
                            color: 'red'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: 'rgba(120, 0, 0, 0.3)',
                            width: 0
                        },
                        data: self.sharedDatasetService.dynamicBidPrices
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
                            width: 3
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

        // self.myChart.getZr().on('contextmenu', function (params) {
        //     echarts.util.curry(showTooltip, params),
        //         console.log("right clicked ", params.topTarget)
        // });
        // self.myChart.getZr().on('mousemove', e => {

        //     // mouse position within chart, in pixels
        //     const pointInPixel = [e.offsetX, e.offsetY]
        //     console.log('pointInPixel ', pointInPixel)
        // })
        updatePosition();
    }




    // Au distribution metrics Right and Left

    // Fare class currently selling 
    public markPoint(): any {

        let coordinatesForMarkPoint = [];
        let sellingValues: any = {};
        let sellingPoint = null;

        if (this.sharedDatasetService.totalBookingsCollector > 0) {

            sellingPoint = this.sharedDatasetService.maxAuValue - this.sharedDatasetService.totalBookingsCollector;
            coordinatesForMarkPoint = [sellingPoint, this.sharedDatasetService.activeCurve[sellingPoint]];
            sellingValues = this.bidPriceCalcsService.findMatchingBucketForBidPrice(this.sharedDatasetService.activeCurve[sellingPoint]);
            const activeColor = this.adjustedCurvePoints.length ? 'green' : this.sharedDatasetService.totalBookingsCollector > 0 ? 'navy' : 'transparent';

            this.markPointContainer = {
                clickable: false,
                animation: false,
                data: [
                    {
                        coord: coordinatesForMarkPoint,
                        symbol: 'circle',
                        symbolSize: this.sharedDatasetService.totalBookingsCollector > 0 ? 22 : 'none',
                        itemStyle: {
                            color: activeColor,
                        },
                        label: {
                            show: true,
                            offset: [0, 1],
                            formatter: () => {
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
        } else {

            this.markPointContainer.data = [
                {
                    coord: coordinatesForMarkPoint,
                    symbol: 'none',
                    symbolSize: 0,
                    itemStyle: {
                        color: 'transparent',
                    },
                    label: {
                        show: false
                    }
                }
            ];
        }
        return this.markPointContainer;
    }

}
