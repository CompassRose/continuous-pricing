import { Component, Input, AfterViewInit, HostListener } from '@angular/core';
import { BidPriceInfluencers, BarSeries } from '../models/dashboard.model';
import { SharedDatasetService } from '../services/shared-datasets.service';
import { BidPriceCalcsService } from '../services/au-visualization-calcs-service';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import * as echarts from 'echarts';
import { ThemeControlService } from '../services/theme-control.service';


@Component({
    selector: 'continuous-bid-pricing',
    templateUrl: './au-visualization-chart.component.html',
    styleUrls: ['./au-visualization-chart.component.scss'],
    providers: [CurrencyPipe, DecimalPipe]
})



export class ContinousBidPricingComponent implements AfterViewInit {

    public barSeriesValuesColors: BarSeries[] = [];
    public modifierCollection = [];
    public selectedElement: any[] = [];
    public options: any = {};
    public myChart: echarts.ECharts = null;
    public modifierObj = { mult: 1.00, addSub: 0, partialMax: '' } as BidPriceInfluencers;
    public colorRange: string[] = [];
    public resetChartElementView = true;
    public markPointContainer: any = {};

    public differenceCalculation: number[] = [0, 0];
    public storedInterpolateBpValues = 0;
    public storedDynamicBpValues = 0;

    public themeSelect = '';
    public showAllCurves = false;

    @Input()
    set showBidPriceCurve(state: boolean) {
        if (this.myChart) {
            this.showAllCurves = state;
            console.log('showAllCurves ', this.showAllCurves)

            this.createChartElement(true);
        }
    }


    constructor(

        public sharedDatasetService: SharedDatasetService,
        public bidPriceCalcsService: BidPriceCalcsService,
        public themeControlService: ThemeControlService,
        private currencyPipe: CurrencyPipe) {

        this.themeSelect = JSON.parse(window.localStorage.getItem('colorTheme'));

        // console.log('AuAvailabilityComponent tempSavedCollection ', this.themeSelect)

        this.themeControlService.resetThemeSubject$
            .subscribe((theme: string) => {
                // console.log('theme ', theme)
                this.themeSelect = theme;
                this.createSvg();
                this.createChartElement(true);
            })


        this.colorRange = this.bidPriceCalcsService.getColorValues();

        // this.sharedDatasetService.apiFlightActiveSubject$
        //     .subscribe((response) => {
        //         console.log('apiFlightActiveSubject$ ||||||   response ', response)
        //         if (response) {

        //             this.sharedDatasetService.totalBookingsCollector = 0;
        //             this.storedInterpolateBpValues = 0;
        //             this.storedDynamicBpValues = 0;
        //             this.differenceCalculation = [0, 0];
        //             this.sharedDatasetService.modifierObj = { mult: 1.00, addSub: 0, partialMax: '' } as BidPriceInfluencers;

        //             // this.sharedDatasetService.influenceInput.next([1.00, 'mult', 0]);
        //             // this.sharedDatasetService.influenceInput.next([0, 'addSub', 1]);

        //             this.sharedDatasetService.resetDefaultSubject$.next(true);
        //             this.loadInterpolatedBidPriceValues('activeCurve');
        //             this.loadDynamicBidPriceValues('dynamicBidPrices');
        //             this.createChartElement(true);
        //         }
        //     })


        this.sharedDatasetService.resetDefaultSubject$
            .subscribe(response => {
                if (response) {
                    console.log('resetDefaultSubject {{{{{{{{{{{{{}}}}}}}}}}}}}  adjustPieceColorForBookingUpdates ', response)
                    this.sharedDatasetService.totalBookingsCollector = 0;
                    this.barSeriesValuesColors = this.bidPriceCalcsService.adjustPieceColorForBookingUpdates(this.selectedElement);
                    this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
                    this.sharedDatasetService.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;
                    this.sharedDatasetService.adjustedCurvePoints = [];
                    this.sharedDatasetService.influenceInput.next([1.00, 'mult', 0]);
                    this.sharedDatasetService.influenceInput.next([0, 'addSub', 1]);
                    this.modifierCollection = [];
                    this.loadInterpolatedBidPriceValues('activeCurve');
                    this.loadDynamicBidPriceValues('dynamicBidPrices');
                    this.createChartElement(true);
                }

            })


        this.sharedDatasetService.bucketDetailsBehaviorSubject$
            .subscribe((state: boolean) => {

                if (this.myChart) {
                    // console.log('\n****************  \n ||||||    bucketDetailsBehaviorSubject$ this.modifierCollection ', this.sharedDatasetService.modifierCollection, '\nthis.selectedElement. ', this.selectedElement, '\nbucketDetails ', this.sharedDatasetService.bucketDetails)

                    if (this.sharedDatasetService.modifierCollection.length > 0) {

                        this.sharedDatasetService.adjustedCurvePoints = [];

                        this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();

                        const staticArray = [...this.sharedDatasetService.interpolateBidPriceCurvePoints];

                        this.sharedDatasetService.adjustedCurvePoints = this.bidPriceCalcsService.applyAllInfluences(this.selectedElement, this.showAllCurves, staticArray, this.sharedDatasetService.modifierCollection);

                        if (this.selectedElement.length > 0) {
                            //   console.log('resetDefaultSubject {{{{{{{{{{{{{}}}}}}}}}}}}}  adjustPieceColorForBookingUpdates ')
                            this.barSeriesValuesColors = this.bidPriceCalcsService.adjustPieceColorForBookingUpdates(this.selectedElement);
                            this.sharedDatasetService.activeCurve = this.sharedDatasetService.adjustedCurvePoints;
                            this.selectedElement = [];
                            this.createChartElement(true);
                            this.sharedDatasetService.modifierCollection = [];
                        }
                        /// No Modifiers 
                    } else {
                        this.barSeriesValuesColors = this.bidPriceCalcsService.adjustPieceColorForBookingUpdates(this.selectedElement);

                        if (state) {
                            this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();

                        } else {
                            this.createChartElement(true);
                        }

                        this.sharedDatasetService.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;

                        this.loadInterpolatedBidPriceValues('activeCurve');
                        this.loadDynamicBidPriceValues('dynamicBidPrices');
                    }
                }
            })
    }

    public ngAfterViewInit(): void {

        this.createSvg();

        this.sharedDatasetService.applyDataChanges();
        setTimeout(() => {
            // this.createChartElement(true);
        }, 300);
    }


    @HostListener('window:resize') onResize() {
        if (this.myChart) {
            this.myChart.resize();
            this.refreshChartVisual();
        }
    }



    // Sets up Dom node and attaches myChart element
    public createSvg(): void {

        if (echarts.init(document.getElementById('continuous-bidpricing'))) {
            echarts.init(document.getElementById('continuous-bidpricing')).dispose();
        }
        const chart: HTMLCanvasElement = document.getElementById('continuous-bidpricing') as HTMLCanvasElement;
        this.myChart = echarts.init(chart, this.themeSelect);
    }


    // on window resize
    public refreshChartVisual = () => {
        //  console.log('refreshChartVisual refreshChartVisual, refreshChartVisual')
        //  console.log('\n\n ||||||||||||| refreshChartVisual TRUE createChartElement ||||||||||| ')
        this.createChartElement(true);
    }



    public generateCompetitorBidPriceComparison(top, bottom) {
        // console.log('|||||  generateCompetitorBidPriceComparison  ||||| ', top, ' bottom ', bottom)

        this.sharedDatasetService.competitorsCurvePoints[0] = this.sharedDatasetService.interpolateBidPriceCurvePoints.map((dbp, i) => {
            return dbp + top;
        })

        this.sharedDatasetService.competitorsCurvePoints[1] = this.sharedDatasetService.interpolateBidPriceCurvePoints.map((dbp, i) => {
            return dbp + bottom;
        })

    }



    public loadDynamicBidPriceValues(metric: string) {

        //console.log('this.sharedDatasetService  ', this.sharedDatasetService[metric])
        this.differenceCalculation[0] = this.sharedDatasetService[metric].reduce((accumulator, value) => {
            return accumulator + value;
        }, 0)

        if (this.storedDynamicBpValues === 0) {
            window.localStorage.setItem('dynamic', JSON.stringify(this.differenceCalculation[0]));
            this.storedDynamicBpValues = JSON.parse(window.localStorage.getItem('dynamic'));
        }
    }



    public loadInterpolatedBidPriceValues(metric: string) {

        this.differenceCalculation[1] = this.sharedDatasetService[metric].reduce((accumulator, value) => {
            return accumulator + value;
        }, 0)

        if (this.storedInterpolateBpValues === 0) {
            window.localStorage.setItem('interpolate', JSON.stringify(this.differenceCalculation[1]));
            this.storedInterpolateBpValues = JSON.parse(window.localStorage.getItem('interpolate'));
        } else { }
        // console.log('this.differenceCalculation[1]  ', this.differenceCalculation[1])
    }



    // Re-generates chart elements
    public createChartElement(redrawChartPoints: boolean): void {
        console.log('createChartElement  target ', redrawChartPoints)
        const self = this;

        const updatePosition = () => {

            if (redrawChartPoints) {
                setChartInstance();
            }
            setChartDragPoints();
        };


        const onPointDragging = function (dataIndex) {
            let xValue = 0;
            let dragPosition: any = [0, 0];
            const target = dataIndex;

            dragPosition = self.myChart.convertFromPixel({ gridIndex: 0 }, this.position);

            xValue = self.sharedDatasetService.maxAuValue - Math.round(Math.floor(dragPosition[0]));

            // console.log('target ', target, ' dragPosition ', dragPosition[0])
            // console.log('dragPosition  dataIndex ', target, ' xValue ', xValue,
            //     '\n Letter ', self.sharedDatasetService.bucketDetails[target].letter,
            //     '\n-1 ', self.sharedDatasetService.bucketDetails[target + 1].letter,
            //     '\nBD ', self.sharedDatasetService.currAus[target],
            //     '\ncurrAu -1 ', self.sharedDatasetService.currAus[target + 1]);

            if (xValue < 1) { xValue = 0; };

            if (xValue > self.sharedDatasetService.maxAuValue) { xValue = self.sharedDatasetService.maxAuValue };

            // console.log('  yValue ', xValue, ' maxAuValue ')

            self.sharedDatasetService.calculateBidPriceForAu(self.sharedDatasetService.currAus[target], target, xValue);

            self.sharedDatasetService.applyDataChanges();

            updatePosition();
        }


        const showTooltip = (dataIndex, params) => {
            self.myChart.dispatchAction({
                type: 'showTip',
                //position: [params.offsetX - 10, params.offsetY - 50],
                seriesIndex: 0,
                dataIndex: dataIndex
            });
        }


        const hideTooltip = (dataIndex, params) => {
            self.myChart.dispatchAction({
                type: 'hideTip',
                //position: [params.offsetX - 10, params.offsetY - 50],
                seriesIndex: 0,
                dataIndex: dataIndex
            });
        }


        const onPointSelect = function (dataIndex) {
            if (self.selectedElement.includes(dataIndex)) {
                self.selectedElement.splice(self.selectedElement.findIndex(idx => idx === dataIndex), 1);
            } else {
                self.selectedElement.push(dataIndex);
            }

            console.log('onPointSelect ', dataIndex, ' selectedElement ', self.selectedElement)
            setChartDragPoints()
        }


        const setChartDragPoints = function () {
            let placeTemp = 0;
            let xPlace = 0;
            let scaleHandles = [];
            /// stackValues sets z depth for group
            let stackValues = [];
            let activeItems: any = {};

            self.myChart.setOption({

                //graphic: echarts.util.map(self.sharedDatasetService.bucketDetails, function (item: any, dataIndex) {
                graphic: echarts.util.map(self.sharedDatasetService.currAus, function (item: any, dataIndex) {
                    //  if (!item.discrete) {
                    // console.log('dataIndex ', dataIndex, '  ------- item ', item, ' ', self.sharedDatasetService.bucketDetails[dataIndex].letter, ' Au ', self.sharedDatasetService.bucketDetails[dataIndex].Aus, ' currAus ', self.sharedDatasetService.currAus[dataIndex])

                    let stacker = 120 - dataIndex;

                    stackValues.push(stacker)

                    //console.log(' ------- item ', self.sharedDatasetService.bucketDetails[dataIndex].letter, ' Au ', item, ' xPlace ', xPlace)

                    let dragPoint = 0;

                    if (dataIndex !== 0) {
                        scaleHandles = [xPlace, dragPoint];
                    }

                    if (self.sharedDatasetService.bucketDetails[dataIndex - 1] && self.sharedDatasetService.bucketDetails[dataIndex].Aus === self.sharedDatasetService.maxAuValue && self.sharedDatasetService.bucketDetails[dataIndex - 1].Aus === self.sharedDatasetService.maxAuValue) {
                        stackValues[dataIndex] = stackValues[dataIndex - 1] + 2;
                    }
                    // console.log(' stackValues[dataIndex] ', stackValues[dataIndex])
                    activeItems = {
                        type: 'group',
                        position: self.myChart.convertToPixel({ gridIndex: 0 }, scaleHandles),
                        draggable: true,
                        ondrag: echarts.util.curry(onPointDragging, dataIndex),
                        onclick: echarts.util.curry(onPointSelect, dataIndex),
                        children: [
                            {
                                type: 'circle',
                                z: stackValues[dataIndex],
                                shape: {
                                    r: 12
                                },
                                style: {
                                    fill: !self.selectedElement.includes(dataIndex) ? 'rgba(255,255,255,1)' : 'red',
                                    stroke: 'black',
                                    lineWidth: 0.5,
                                    shadowBlur: 10,
                                    shadowOffsetX: -1,
                                    shadowOffsetY: -1,
                                    shadowColor: 'rgba(0,0,0,0.4)',
                                },
                            },
                            {
                                type: 'text',
                                z: stackValues[dataIndex],
                                x: -12,
                                y: -12,
                                style: {
                                    text: `${self.sharedDatasetService.bucketDetails[dataIndex].letter}`,
                                    textPosition: 'inside',
                                    padding: 6,
                                    fill: !self.selectedElement.includes(dataIndex) ? 'black' : 'white',
                                    fontSize: '15px',
                                    fontWeight: 'bold'
                                },
                            }
                        ]
                    }
                    xPlace = (placeTemp += self.sharedDatasetService.bucketDetails[dataIndex].protections);
                    //console.log('activeItems ', activeItems.children[1].style.text, ' dataIndex ', dataIndex, ' xPlace ', xPlace, ' maxAuValue ', self.sharedDatasetService.maxAuValue)
                    return activeItems;
                    //}
                })

            })
        }


        const setChartInstance = () => {

            let itemDiscreteFalse = [];
            self.myChart.setOption({

                grid: {
                    show: false,
                    left: 60,
                    right: 20,
                    top: 40,
                    bottom: 40
                },
                // backgroundColor: 'rgba(205,225,245,1)',
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
                            show: false,
                            yAxisIndex: 'none',
                            iconStyle: {
                                textBackgroundColor: 'white'
                            },
                            emphasis: {
                                iconStyle: {
                                    borderColor: 'blue'
                                }
                            },
                            brushStyle: {
                                borderColor: 'lightBlue',
                                borderWidth: 1
                            }
                        }
                    }
                },
                tooltip: {
                    show: true,
                    trigger: 'axis',
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 2,
                    borderColor: 'Blue',
                    extraCssText: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);',
                    // axisPointer: {
                    //     trigger: 'axis'
                    // },
                    padding: 5,
                    textStyle: {
                        fontSize: 12,
                        color: '#000'
                    },
                    //position: [10, 10],
                    position: (pos, params, dom, rect, size) => {
                        if ((size.viewSize[0] - pos[0]) > 140) {
                            pos[0] = pos[0] + 30
                        } else {
                            pos[0] = pos[0] - 150
                        }
                        pos[1] = pos[1] - 80;
                        return pos;
                    },
                    formatter: (params) => {

                        let tooltipString = '';
                        tooltipString = `<div style="width: 130px;">
                        <div>Seat: ${params[0].axisValue}</div>
                        <div>${params[2].marker}Continuous: <span style="float: right;">${this.sharedDatasetService.interpolateBidPriceCurvePoints[params[1].dataIndex].toFixed(0)}</span></div>
                        <div>${params[1].marker}Fixed: <span style="float: right;">${this.sharedDatasetService.dynamicBidPrices[params[2].dataIndex]}</span></div></div>`;
                        return tooltipString;
                    },
                    rich: {
                        a: {
                            align: 'right',
                            fontSize: 23,
                            width: 70,
                            fontWeight: 'normal',
                            color: 'black'
                        },
                    }
                },
                xAxis: {
                    silent: false,
                    position: 'bottom',
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
                        length: 20,
                        minorTick: {
                            show: true
                        }
                    },
                    showGrid: true,
                    axisLabel: {
                        interval: 1,
                        margin: 15,
                        hideOverlap: true,
                        fontSize: 10,
                        showMinLabel: true,
                        showMaxLabel: true
                    },
                    data: self.sharedDatasetService.dynamicBidPrices.map((bp, i) => {

                        return self.sharedDatasetService.maxAuValue - i;
                    }),
                },
                yAxis: [
                    // {
                    //     //silent: true,
                    //     show: true,
                    //     animation: false,
                    //     min: 'dataMin',
                    //     max: 'dataMax',
                    //     type: 'log',
                    //     // position: 'right',
                    //     //type: 'value',
                    //     showGrid: false,
                    //     //max: this.modifierCollection.length === 0 ? self.sharedDatasetService.maxFareValue + self.sharedDatasetService.maxFareValue / 10 : self.sharedDatasetService.adjustedCurvePoints[0] + 10,
                    //     interval: 10,
                    //     scale: false,
                    //     splitLine: {
                    //         show: true
                    //     },
                    //     axisLine: {
                    //         show: true,
                    //         onZero: false
                    //     }
                    // },
                    {
                        //silent: true,
                        show: true,
                        animation: false,
                        type: 'value',
                        name: 'Fares',
                        position: 'left',
                        nameLocation: 'middle',
                        nameRotate: 90,
                        nameGap: 35,
                        nameTextStyle: {
                            fontSize: 14,
                            fontWeight: 'normal'
                        },
                        // position: 'left',
                        showGrid: false,
                        max: this.modifierCollection.length === 0 ? self.sharedDatasetService.maxFareValue + 5 : self.sharedDatasetService.adjustedCurvePoints[0] + 5,
                        interval: self.sharedDatasetService.maxFareValue < 400 ? 20 : self.sharedDatasetService.maxFareValue > 1000 ? 350 : 35,
                        scale: false,
                        splitLine: {
                            show: true
                        },
                        axisLine: {
                            show: true,
                            onZero: false
                        }
                    },
                ],

                series: [
                    {
                        type: 'bar',
                        animation: false,
                        animationDuration: 1,
                        showBackground: false,
                        colorBy: 'series',
                        silent: true,
                        z: 2,
                        data: self.barSeriesValuesColors.map((serie, i) => {

                            // console.log('serie ', serie)
                            return {
                                value: serie.value,
                                itemStyle: {
                                    color: serie.barColor
                                }
                            }
                        }),
                        markLine: (this.sharedDatasetService.totalBookingsCollector > 0 && this.sharedDatasetService.totalBookingsCollector < this.sharedDatasetService.maxAuValue) ? self.bidPriceCalcsService.markVerticalLineSellingValues() : null,
                        //markPoint: self.markAreaPoint(),
                        markArea: {
                            silent: false,
                            data: self.sharedDatasetService.currAus.map((item: any, i) => {

                                //  console.log('i ', i, ' item ', item, ' letter', self.sharedDatasetService.bucketDetails[i].letter, ' ------  ', self.sharedDatasetService.maxAuValue - item)

                                //  if (!item.discrete) {
                                itemDiscreteFalse = [{
                                    name: item > 0 ? self.sharedDatasetService.bucketDetails[i].letter : '',
                                    xAxis: self.sharedDatasetService.maxAuValue - item,
                                    label: {
                                        show: item > 0 ? true : false,
                                        backgroundColor: 'rgba(245,245,255,1)',
                                        padding: [5, 8, 2, 8],

                                        fontSize: 13,
                                        fontWeight: 'bold',
                                        color: '#001871',
                                        borderColor: 'rgba(105,105,115,0.8)',
                                        borderWidth: 0.5,
                                        offset: [0, 3],
                                    },
                                }, {
                                    itemStyle: {
                                        borderColor: '#001871',
                                        borderWidth: 1,
                                        color: 'rgba(100,100,100,0)'
                                    },
                                    xAxis: item && self.sharedDatasetService.currAus[i + 1] ? self.sharedDatasetService.maxAuValue - self.sharedDatasetService.currAus[i] : self.sharedDatasetService.maxAuValue
                                }]
                                // }
                                // console.log('itemDiscreteFalse ', itemDiscreteFalse)
                                return itemDiscreteFalse;
                            })
                        }
                    },
                    {
                        id: 'e',
                        type: 'line',
                        z: 5,
                        animation: false,
                        silent: false,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 10,
                        itemStyle: {
                            borderColor: 'yellow',
                            borderWidth: 0,
                            color: 'red'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: this.themeSelect === 'dark' ? 'rgba(220, 220, 0, 1)' : 'rgba(220, 220, 0, 1)',
                            width: this.themeSelect === 'dark' ? 0 : 0
                        },
                        data: self.sharedDatasetService.dynamicBidPrices
                    },

                    {
                        id: 'd',
                        type: 'line',
                        z: 1,
                        animation: false,
                        silent: true,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: self.showAllCurves ? 10 : 0,

                        itemStyle: {
                            borderColor: 'blue',
                            borderWidth: 1,
                            color: 'blue'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: 'blue',
                            width: self.showAllCurves ? 3 : 0
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
                            width: this.showAllCurves ? 3 : 0
                        },
                        data: self.sharedDatasetService.adjustedCurvePoints,
                    },

                ]
            })
        }
        updatePosition();
    }


    public markAreaPoint(): any {

        let dynamicDiff = '';
        let interpDiff = '';
        let dynCurrency;
        let activeCurrency;

        if (this.differenceCalculation[0] !== this.storedDynamicBpValues) {
            const sign = this.differenceCalculation[0] > this.storedDynamicBpValues ? '+' : '';
            const pipedDynamicCurrency = this.currencyPipe.transform((this.differenceCalculation[0] - this.storedDynamicBpValues), 'EUR', 'symbol', '1.0-0').replace("€", "");
            dynamicDiff = `${sign}${pipedDynamicCurrency}`;
        }

        if (this.differenceCalculation[1] !== this.storedInterpolateBpValues) {

            const sign = this.differenceCalculation[1] > this.storedInterpolateBpValues ? '+' : '';
            const pipedCurrency = this.currencyPipe.transform((this.differenceCalculation[1] - this.storedInterpolateBpValues), 'EUR', 'symbol', '1.0-0').replace("€", "");
            interpDiff = `${sign}${pipedCurrency}`;

        }
        dynCurrency = this.currencyPipe.transform(this.differenceCalculation[0], 'EUR', 'symbol', '1.0-0').replace("€", "");
        activeCurrency = this.currencyPipe.transform(this.differenceCalculation[1], 'EUR', 'symbol', '1.0-0').replace("€", "").replace("€", "");

        return {
            clickable: false,
            animation: false,
            data: [
                {
                    x: '85%',
                    y: '15%',
                    symbol: 'rect',
                    itemStyle: {
                        color: 'transparent',
                    },

                    label: {
                        show: true,
                        offset: [0, 17],
                        borderColor: 'blue',
                        padding: [5, 20],
                        borderWidth: 1,
                        shadowColor: 'rgba(0, 0, 0, 0.25)',
                        shadowOffsetX: 0,
                        shadowOffsetY: 2,
                        shadowBlur: 5,
                        backgroundColor: 'white',
                        color: 'black',
                        formatter: () => {
                            return `{c|Continuous:}{dc|${activeCurrency}}{iDiff|${interpDiff}}\n{f|Fixed:}{fc|${dynCurrency}}{dDiff|${dynamicDiff}}`;
                        },
                        lineHeight: 20,
                        rich: {
                            dc: {
                                align: 'right',
                                fontSize: 13,
                                width: 70,
                                fontWeight: 'normal',
                                color: 'black'
                            },
                            fc: {
                                align: 'right',
                                width: 75,
                                fontSize: 13,
                                fontWeight: 'normal',
                                color: 'black'
                            },
                            c: {
                                align: 'left',
                                width: 75,
                                fontSize: 13,
                                fontWeight: 'bold',
                                color: 'black'
                            },
                            f: {
                                align: 'left',
                                width: 70,
                                fontSize: 13,
                                fontWeight: 'bold',
                                color: 'black'
                            },
                            iDiff: {
                                align: 'left',
                                width: 30,
                                fontSize: 12,
                                fontWeight: 'bold',
                                color: this.differenceCalculation[1] > this.storedInterpolateBpValues ? 'green' : 'red'
                            },
                            dDiff: {
                                align: 'left',
                                width: 30,
                                fontSize: 12,
                                fontWeight: 'bold',
                                color: this.differenceCalculation[0] > this.storedDynamicBpValues ? 'green' : 'red'
                            },
                        },
                    }
                }
            ]
        };
    }

    // Au distribution metrics Right and Left

    // Fare class currently selling 
    public markPoint(): any {

        let coordinatesForMarkPoint = [];
        let sellingValues: any = {};
        let sellingPoint = null;
        let activeColor = 'blue';

        if (this.sharedDatasetService.totalBookingsCollector > 0) {

            sellingPoint = this.sharedDatasetService.maxAuValue - this.sharedDatasetService.totalBookingsCollector;
            coordinatesForMarkPoint = [sellingPoint, this.sharedDatasetService.activeCurve[sellingPoint]];
            sellingValues = this.bidPriceCalcsService.findMatchingBucketForBidPrice(this.sharedDatasetService.activeCurve[sellingPoint]);
            activeColor = this.sharedDatasetService.adjustedCurvePoints.length ? 'green' : this.sharedDatasetService.totalBookingsCollector > 0 ? 'blue' : 'transparent';
            //console.log('sellingValues ', sellingValues)
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
