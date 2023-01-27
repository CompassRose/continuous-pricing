import { Component, OnInit, HostListener } from '@angular/core';
import { BidPriceInfluencers, BarSeries } from '../models/dashboard.model';
import { SharedDatasetService } from '../shared-datasets.service';
import { BidPriceCalcsService } from '../bid-price-calcs';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import * as echarts from 'echarts';
import { ThemeControlService } from '../theme-control.service';


@Component({
    selector: 'continuous-bid-pricing',
    templateUrl: './continuous-bidpricing-chart.component.html',
    styleUrls: ['./continuous-bidpricing-chart.component.scss'],
    providers: [CurrencyPipe, DecimalPipe]
})

export class ContinousBidPricingComponent implements OnInit {

    public barSeriesValuesColors: BarSeries[] = [];
    public modifierCollection = [];
    public selectedElement = [];
    public options: any = {};
    public myChart: echarts.ECharts = null;
    public modifierObj = { mult: 1.00, addSub: 0, min: 0, max: 99999 } as BidPriceInfluencers;
    public colorRange: string[] = [];
    public resetChartElementView = true;
    public markPointContainer: any = {};

    public differenceCalculation: number[] = [0, 0];
    public storedInterpolateBpValues = 0;
    public storedDynamicBpValues = 0;

    public themeSelect = 'light';
    // Width observer
    public targetElement: any;
    public bidPriceObserver: any;


    constructor(

        public sharedDatasetService: SharedDatasetService,
        public bidPriceCalcsService: BidPriceCalcsService,
        public themeControlService: ThemeControlService,
        private currencyPipe: CurrencyPipe) {

        this.colorRange = this.bidPriceCalcsService.getColorValues();

        this.sharedDatasetService.apiFlightActiveSubject$
            .subscribe((response) => {
                if (response) {

                    this.createSvg();

                    this.storedInterpolateBpValues = 0;
                    this.storedDynamicBpValues = 0;
                    this.differenceCalculation = [0, 0];
                    this.sharedDatasetService.modifierObj = { mult: 1.00, addSub: 0, min: 0, max: 99999 } as BidPriceInfluencers;
                    this.sharedDatasetService.influenceInput.next([1.00, 'mult', 0])
                    this.sharedDatasetService.influenceInput.next([0, 'addSub', 1])
                    this.createChartElement();
                    //this.loadInterpolatedBidPriceValues('activeCurve');
                    // this.loadDynamicBidPriceValues('dynamicBidPrices');
                }
            })


        this.sharedDatasetService.bucketDetailsBehaviorSubject$
            .subscribe((state) => {

                if (this.myChart) {

                    this.barSeriesValuesColors = this.bidPriceCalcsService.adjustPieceColorForBookingUpdates();

                    if (state) {
                        this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
                        this.sharedDatasetService.maxAuValue = this.sharedDatasetService.getMaxAu();
                        this.sharedDatasetService.maxFareValue = this.sharedDatasetService.getMaxFare();
                    }

                    if (this.modifierCollection.length > 0) {
                        this.sharedDatasetService.adjustedCurvePoints = [];
                        this.sharedDatasetService.interpolateBidPriceCurvePoints.forEach((ip, i) => {
                            const staticArray = [...this.sharedDatasetService.interpolateBidPriceCurvePoints]
                            this.sharedDatasetService.adjustedCurvePoints = this.bidPriceCalcsService.applyAllInfluences(staticArray, this.modifierCollection);
                            this.sharedDatasetService.activeCurve = this.sharedDatasetService.adjustedCurvePoints;
                        })

                    } else {
                        this.sharedDatasetService.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;
                    }

                    this.loadInterpolatedBidPriceValues('activeCurve');
                    this.loadDynamicBidPriceValues('dynamicBidPrices');

                    this.createChartElement();
                }
            })

        this.sharedDatasetService.resetDefaultSubject$
            .subscribe(response => {
                ///console.log('resetDefaultSubject influenceInput influenceInput ', response)
                this.sharedDatasetService.totalBookingsCollector = 0;
                this.sharedDatasetService.maxAuValue = this.sharedDatasetService.getMaxAu();

                //this.sharedDatasetService.applyDataChanges();
                this.barSeriesValuesColors = this.bidPriceCalcsService.adjustPieceColorForBookingUpdates();
                this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
                this.sharedDatasetService.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;

                this.sharedDatasetService.adjustedCurvePoints = [];
                this.sharedDatasetService.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;
                this.modifierCollection = [];

                this.loadInterpolatedBidPriceValues('activeCurve');
                this.loadDynamicBidPriceValues('dynamicBidPrices');
                this.createChartElement();
            })


        this.sharedDatasetService.influenceInput$
            .subscribe(([response, mod, id]) => {
                console.log('influenceInput influenceInput influenceInput ', response)
                if (response !== null) {
                    this.modifierObj[mod] = response;
                    const staticModifierObj = { mult: 1.00, addSub: 0, min: 0, max: 99999 };

                    this.sharedDatasetService.adjustedCurvePoints = [];

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
                        this.sharedDatasetService.adjustedCurvePoints = this.bidPriceCalcsService.applyAllInfluences(staticArray, this.modifierCollection);
                        this.sharedDatasetService.activeCurve = this.sharedDatasetService.adjustedCurvePoints;
                        // console.log('adjustedCurvePoints. ', this.sharedDatasetService.adjustedCurvePoints)
                    } else {
                        this.sharedDatasetService.adjustedCurvePoints = [];
                        this.sharedDatasetService.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;
                    }
                    this.loadInterpolatedBidPriceValues('activeCurve');
                    this.loadDynamicBidPriceValues('dynamicBidPrices');

                    this.barSeriesValuesColors = this.bidPriceCalcsService.adjustPieceColorForBookingUpdates();
                    this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
                    this.createChartElement();
                }
            })


        this.themeControlService.resetThemeSubject$
            .subscribe((theme: string) => {
                console.log('resetThemeSubject. ', theme)
                this.themeSelect = theme
                this.createSvg();
            })

    }


    @HostListener('window:resize') onResize() {
        // console.log('onResize onResize onResize onResize');
        if (this.myChart) {
            this.myChart.resize();
            this.refreshChartVisual();
        }
    }


    public ngOnInit(): void {
        this.createSvg();
    }


    public onChartInit(e) {
        this.sharedDatasetService.applyDataChanges();
    }

    // Sets up Dom node and attaches myChart element
    public createSvg(): void {

        if (echarts.init(document.getElementById('continuous-bidpricing'))) {
            echarts.init(document.getElementById('continuous-bidpricing')).dispose();
        }

        const chart: HTMLCanvasElement = document.getElementById('continuous-bidpricing') as HTMLCanvasElement;
        this.myChart = echarts.init(chart, this.themeSelect);

        setTimeout(() => {
            this.createChartElement();
        }, 500);

    }


    // on window resize
    public refreshChartVisual = () => {
        this.createChartElement();
    }



    public generateCompetitorBidPriceComparison(top, bottom) {
        // console.log('|||||  generateCompetitorBidPriceComparison  ||||| ', top, ' bottom ', bottom)

        this.sharedDatasetService.competitorsCurvePoints[0] = this.sharedDatasetService.interpolateBidPriceCurvePoints.map((dbp, i) => {
            return dbp + top;
        })

        this.sharedDatasetService.competitorsCurvePoints[1] = this.sharedDatasetService.interpolateBidPriceCurvePoints.map((dbp, i) => {
            return dbp + bottom;
        })


        // console.log('this.sharedDatasetService.competitorsCurvePoints ', this.sharedDatasetService.competitorsCurvePoints)
        // this.sharedDatasetService.competitorsCurvePoints
    }



    public loadDynamicBidPriceValues(metric: string) {

        //console.log('this.sharedDatasetService  ', this.sharedDatasetService[metric])
        this.differenceCalculation[0] = this.sharedDatasetService[metric].reduce((accumulator, value) => {
            return accumulator + value;
        }, 0)

        // console.log('this.storedDynamicBpValues  ', this.storedDynamicBpValues)

        if (this.storedDynamicBpValues === 0) {
            window.localStorage.setItem('dynamic', JSON.stringify(this.differenceCalculation[0]));

            this.storedDynamicBpValues = JSON.parse(window.localStorage.getItem('dynamic'));
            //console.log('this.storedDynamicBpValues  ', this.storedDynamicBpValues)
        }
        //console.log('this.differenceCalculation[0]  ', this.differenceCalculation[0])
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
            // console.log('showTooltip params', params)
            self.myChart.dispatchAction({
                type: 'showTip',
                //position: [params.offsetX - 10, params.offsetY - 50],
                seriesIndex: 0,
                dataIndex: dataIndex
            });
        }


        const hideTooltip = (dataIndex, params) => {
            // console.log('|||||||||||||||||||||||||||hideTooltip ', params)

            self.myChart.dispatchAction({
                type: 'hideTip',
                //position: [params.offsetX - 10, params.offsetY - 50],
                seriesIndex: 0,
                dataIndex: dataIndex
            });
        }


        const setChartDragPoints = function () {

            const symbolSize = 24;
            let placeTemp = 0;
            let xPlace = 0;
            let test = {}

            self.myChart.setOption({

                graphic: echarts.util.map(self.sharedDatasetService.bucketDetails, function (item: any, dataIndex) {

                    // if (dataIndex < self.sharedDatasetService.bucketDetails.length - 1) {

                    xPlace = (placeTemp += item.protections);

                    let dragPoint = 7 //self.sharedDatasetService.maxFareValue + self.sharedDatasetService.maxFareValue / 10  //self.sharedDatasetService.maxFareValue + 20;
                    //let doesInclude = self.selectedElement.includes(dataIndex) ? true : false;
                    const scaleHandles = (dataIndex === self.sharedDatasetService.bucketDetails.length - 1) ? [1200, 1200] : [xPlace, dragPoint];
                    // console.log('xPlace ', xPlace, ' letter ', item.letter, ' scaleHandles ', scaleHandles)
                    // const fillColor = doesInclude ? 'red' : 'white';
                    // const strokeColor = (dataIndex === self.sharedDatasetService.bucketDetails.length - 1) ? 'transparent' : 'Blue';
                    // const lineWidth = doesInclude ? 2 : 1;

                    return {
                        type: 'group',
                        position: self.myChart.convertToPixel({ gridIndex: 0 }, scaleHandles),
                        //rotation: Math.PI / 4,
                        draggable: true,
                        ondrag: echarts.util.curry(onPointDragging, dataIndex),
                        children: [
                            {
                                type: 'circle',
                                z: 100,
                                shape: {
                                    cx: 11,
                                    cy: 12,
                                    r: symbolSize / 2
                                },

                                // shape: {
                                //     width: 25,
                                //     height: 25
                                // },
                                // type: 'rect',
                                // z: 100,

                                // shape: {
                                //     width: 25,
                                //     height: 25
                                // },
                                style: {
                                    fill: 'rgba(255,255,255,1)',//'#001871',
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
                                z: 100,
                                // x: 12,
                                // y: -4,

                                //rotation: -Math.PI / 4,
                                style: {
                                    text: item.letter,
                                    textPosition: 'inside',
                                    padding: 6,
                                    color: 'black',
                                    //font: 'bold 36px serif',
                                    fontSize: '15px',
                                    fontWeight: 'bold',

                                },
                            }
                        ]
                    }
                })
            })
        }


        const setChartInstance = () => {

            self.myChart.setOption({
                grid: {
                    show: false,
                    left: 40,
                    right: 40,
                    top: 40,
                    bottom: 40
                },
                //backgroundColor: 'rgba(205,225,245,0.05)',
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
                    padding: 5,
                    textStyle: {
                        fontSize: 12,
                        color: '#000'
                    },
                    //position: [10, 10],
                    position: (pos, params, dom, rect, size) => {
                        if ((size.viewSize[0] - pos[0]) > 140) {
                            pos[0] = pos[0] + 0
                        } else {
                            pos[0] = pos[0] - 150
                        }
                        pos[1] = pos[1] - 80;
                        return pos;
                    },
                    formatter: (params) => {
                        // console.log('params ', params[0])
                        let tooltipString = '';
                        tooltipString = `<div style="width: 130px;">
                        <div>Seat:${params[0].value}</div>
                        <div>${params[2].marker}Continuous: <span style="float: right;">${this.sharedDatasetService.interpolateBidPriceCurvePoints[params[1].dataIndex].toFixed(0)}</span></div>
                        <div>${params[1].marker}Fixed: <span style="float: right;">${this.sharedDatasetService.dynamicBidPrices[params[2].dataIndex]}</span></div></div>`;
                        return tooltipString;
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
                        //color: 'black',
                        interval: 1,
                        margin: 15,
                        hideOverlap: true,
                        //align: 'middle',
                        fontSize: 10,
                        showMinLabel: true,
                        showMaxLabel: true
                    },
                    data: self.sharedDatasetService.dynamicBidPrices.map((bp, i) => {
                        return self.sharedDatasetService.dynamicBidPrices.length - i;
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
                            return {
                                value: serie.value,
                                itemStyle: {
                                    normal: {
                                        color: serie.barColor
                                    }
                                }
                            }
                        }),
                        markLine: (this.sharedDatasetService.totalBookingsCollector > 0 && this.sharedDatasetService.totalBookingsCollector < this.sharedDatasetService.maxAuValue) ? self.bidPriceCalcsService.markVerticalLineSellingValues() : null,
                        markPoint: self.markAreaPoint(),
                        markArea: {
                            silent: false,
                            data: self.sharedDatasetService.bucketDetails.map((item: any, i) => {
                                return [{
                                    name: item.protections > 0 ? self.sharedDatasetService.bucketDetails[i].letter : '',
                                    xAxis: self.sharedDatasetService.maxAuValue - item.Aus,
                                    label: {
                                        show: item.protections > 0 ? true : false,
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
                                    xAxis: self.sharedDatasetService.bucketDetails[i + 1] ? self.sharedDatasetService.maxAuValue - self.sharedDatasetService.bucketDetails[i + 1].Aus : self.sharedDatasetService.maxAuValue
                                }];
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
                            borderColor: 'red',
                            borderWidth: 0,
                            color: 'red'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: 'rgba(120, 0, 0, 0.3)',
                            width: 0
                        },
                        data: self.sharedDatasetService.dynamicBidPrices,
                        markLine: (this.sharedDatasetService.totalBookingsCollector > 0 && this.sharedDatasetService.totalBookingsCollector < this.sharedDatasetService.maxAuValue) ? self.bidPriceCalcsService.markVerticalLineSellingValues() : null,
                    },
                    //
                    {
                        id: 'd',
                        type: 'line',
                        z: 1,
                        animation: false,
                        silent: true,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 10,

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
                        data: self.sharedDatasetService.adjustedCurvePoints,
                    },

                ]
            })
        }

        //self.myChart.resize();
        updatePosition();
    }


    public markAreaPoint(): any {
        // console.log('this.differenceCalculation ', this.differenceCalculation, ' this.storedInterpolateBpValues ', this.storedInterpolateBpValues, ' ', this.sharedDatasetService)
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
        let activeColor = 'navy';

        if (this.sharedDatasetService.totalBookingsCollector > 0) {

            sellingPoint = this.sharedDatasetService.maxAuValue - this.sharedDatasetService.totalBookingsCollector;
            coordinatesForMarkPoint = [sellingPoint, this.sharedDatasetService.activeCurve[sellingPoint]];
            sellingValues = this.bidPriceCalcsService.findMatchingBucketForBidPrice(this.sharedDatasetService.activeCurve[sellingPoint]);
            activeColor = this.sharedDatasetService.adjustedCurvePoints.length ? 'green' : this.sharedDatasetService.totalBookingsCollector > 0 ? 'navy' : 'transparent';

            //console.log('activeColor ', this.sharedDatasetService.adjustedCurvePoints.length, ' activeColor ', activeColor)

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
