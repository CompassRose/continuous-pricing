import { Component, Input, AfterViewInit, HostListener } from '@angular/core';
import { BidPriceInfluencers, BarSeries, BucketDetails } from '../models/dashboard.model';
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

    //public barSeriesValuesColors: any[] = [];
    public options: any = {};
    public myChart: echarts.ECharts = null;
    public modifierObj = { mult: 1.00, addSub: 0, partialMax: '' } as BidPriceInfluencers;
    //public colorRange: string[] = [];
    public resetChartElementView = true;
    public markPointContainer: any = {};

    public differenceCalculation: number[] = [0, 0];
    public storedInterpolateBpValues = 0;
    public storedDynamicBpValues = 0;

    public themeSelect = '';
    public showAllCurves = false;
    public nonDiscreteBuckets: BucketDetails[] = [];
    public chartSeriesCollection: any[] = [];


    @Input()
    set gridPointsDeSelected(state: boolean) {
        if (this.sharedDatasetService.selectedElement.length > 0) {
            this.sharedDatasetService.selectedElement = [];
            this.sharedDatasetService.setGroupingMethod(0);
            this.sharedDatasetService.multiSelectedNodeSubject$.next([])
            this.createChartDraggingElement(false);
        }
    }


    @Input()
    set showBidPriceCurve(state: boolean) {
        if (this.myChart) {
            this.showAllCurves = state;
            // console.log('showAllCurves ', this.showAllCurves)

            if (state) {
                this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
            }
            this.setChartInstance();
            this.createChartDraggingElement(false);
        }
    }


    constructor(

        public sharedDatasetService: SharedDatasetService,
        public bidPriceCalcsService: BidPriceCalcsService,
        public themeControlService: ThemeControlService,
        private currencyPipe: CurrencyPipe) {

        this.themeSelect = JSON.parse(window.localStorage.getItem('colorTheme'));

        this.themeControlService.resetThemeSubject$
            .subscribe((theme: string) => {
                console.log('theme ', theme)
                this.themeSelect = theme;
                this.createSvg();
                this.setChartInstance();
                this.createChartDraggingElement(true);
                this.myChart.setOption({
                    series: this.setChartSeries()
                })
            })


        this.sharedDatasetService.apiFlightActiveSubject$
            .subscribe((response) => {

                if (response) {
                    console.log('apiFlightActiveSubject$ ||||||   response ', response)
                    //             this.sharedDatasetService.totalBookingsCollector = 0;
                    //             this.storedInterpolateBpValues = 0;
                    //             this.storedDynamicBpValues = 0;
                    //             this.differenceCalculation = [0, 0];
                    this.sharedDatasetService.modifierObj = { mult: 1.00, addSub: 0, partialMax: '' } as BidPriceInfluencers;

                    this.sharedDatasetService.influenceInput.next([1.00, 'mult', 0]);
                    this.sharedDatasetService.influenceInput.next([0, 'addSub', 1]);

                    //this.sharedDatasetService.resetDefaultSubject$.next(true);
                    //this.loadInterpolatedBidPriceValues('activeCurve');
                    //this.loadDynamicBidPriceValues('dynamicBidPrices');
                    this.setChartInstance();
                    // this.createChartDraggingElement(true);
                }
            })




        this.sharedDatasetService.resetDefaultSubject$
            .subscribe(response => {

                if (response) {
                    this.sharedDatasetService.totalBookingsCollector = 0;
                    this.bidPriceCalcsService.adjustPieceColorForBookingUpdates(this.sharedDatasetService.selectedElement);
                    this.sharedDatasetService.adjustedCurvePoints = [];
                    this.sharedDatasetService.influenceInput.next([1.00, 'mult', 0]);
                    this.sharedDatasetService.influenceInput.next([0, 'addSub', 1]);
                    this.sharedDatasetService.modifierCollection = [];
                    this.sharedDatasetService.selectedElement = [];
                    this.sharedDatasetService.applyDataChanges();
                    this.sharedDatasetService.setGroupingMethod(0);

                    // console.log('this.showAllCurves ', this.showAllCurves)
                    if (this.showAllCurves) {
                        this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
                        this.sharedDatasetService.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;
                    }


                    // this.loadInterpolatedBidPriceValues('activeCurve');
                    // this.loadDynamicBidPriceValues('dynamicBidPrices');

                    if (this.sharedDatasetService.selectedElement.length > 0) {
                        this.sharedDatasetService.selectedElement = [];
                        this.sharedDatasetService.setGroupingMethod(0);
                    }
                    this.createChartDraggingElement(false);
                }

            })

        // Truncated Bucket list
        this.sharedDatasetService.bucketDetailsConcatBehaviorSubject$
            .subscribe(buckets => {
                if (buckets.length) {
                    this.nonDiscreteBuckets = buckets;
                }
            })


        this.sharedDatasetService.bucketDetailsBehaviorSubject$
            .subscribe((state: boolean) => {

                if (this.myChart) {
                    //console.log(' AU VISUAIZATION ((((((((  bucketDetailsBehaviorSubject$ createChartElement )))))))))))  state ', state)
                    if (this.sharedDatasetService.modifierCollection.length > 0) {

                        this.sharedDatasetService.adjustedCurvePoints = [];

                        this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();

                        const staticArray = [...this.sharedDatasetService.interpolateBidPriceCurvePoints];

                        this.sharedDatasetService.adjustedCurvePoints = this.bidPriceCalcsService.applyAllInfluences(this.sharedDatasetService.selectedElement, this.showAllCurves, staticArray, this.sharedDatasetService.modifierCollection);

                        if (this.sharedDatasetService.selectedElement.length > 0) {
                            //  console.log('1   createChartElement <<<<<<<<>>>>>>>>>>>>selectedElement.length > 0')
                            this.bidPriceCalcsService.adjustPieceColorForBookingUpdates(this.sharedDatasetService.selectedElement);
                            /// this.sharedDatasetService.activeCurve = this.sharedDatasetService.adjustedCurvePoints;
                            this.sharedDatasetService.selectedElement = [];
                            this.createChartDraggingElement(true);
                            this.sharedDatasetService.modifierCollection = [];
                        }
                        /// No Modifiers 
                    } else {

                        this.bidPriceCalcsService.adjustPieceColorForBookingUpdates(this.sharedDatasetService.selectedElement);
                        if (this.showAllCurves) {
                            this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
                        }

                        this.sharedDatasetService.activeCurve = this.sharedDatasetService.dynamicBidPrices;

                        setTimeout(() => {
                            this.createChartDraggingElement(true);
                            this.myChart.setOption({
                                series: this.setChartSeries()
                            })
                        }, 0);

                        /// this.loadInterpolatedBidPriceValues('activeCurve');
                        // this.loadDynamicBidPriceValues('dynamicBidPrices');
                    }
                }
            })
    }



    public ngAfterViewInit(): void {
        this.createSvg();
        this.bidPriceCalcsService.adjustPieceColorForBookingUpdates(this.sharedDatasetService.selectedElement);
        setTimeout(() => {

            this.setChartInstance();
        }, 0);
    }


    @HostListener('window:resize', ['$event'])
    onResize(event) {
        // console.log('event ', event)
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
        this.createChartDraggingElement(true);
    }




    // Out for now
    public loadDynamicBidPriceValues(metric: string) {
        this.differenceCalculation[0] = this.sharedDatasetService[metric].reduce((accumulator, value) => {
            return accumulator + value;
        }, 0)

        if (this.storedDynamicBpValues === 0) {
            window.localStorage.setItem('dynamic', JSON.stringify(this.differenceCalculation[0]));
            this.storedDynamicBpValues = JSON.parse(window.localStorage.getItem('dynamic'));
        }
    }


    // Out for now
    public loadInterpolatedBidPriceValues(metric: string) {

        this.differenceCalculation[1] = this.sharedDatasetService[metric].reduce((accumulator, value) => {
            return accumulator + value;
        }, 0)

        if (this.storedInterpolateBpValues === 0) {
            window.localStorage.setItem('interpolate', JSON.stringify(this.differenceCalculation[1]));
            this.storedInterpolateBpValues = JSON.parse(window.localStorage.getItem('interpolate'));
        } else { }
    }



    // Sets Fare class regions on top of chart
    public setMarkArea(index: number) {

        let itemDiscreteFalse;

        const markArea = {
            silent: false,
            data: this.sharedDatasetService.nonDiscreteBuckets.map((item: any, i) => {
                itemDiscreteFalse = [{
                    name: i > 0 ? item.letter : '',
                    xAxis: this.sharedDatasetService.maxAuValue - item.Aus,
                    label: {
                        show: item.Aus > 0 ? true : false,
                        backgroundColor: i > 0 ? 'rgba(245,245,255,1)' : 'transparent',
                        padding: [5, 8, 2, 8],
                        fontSize: 13,
                        fontWeight: 'bold',
                        color: '#001871',
                        borderColor: i > 0 ? 'rgba(105,105,115,0.8)' : 'transparent',
                        borderWidth: 0.5,
                        offset: [0, 3],
                    },
                }, {
                    itemStyle: {
                        borderColor: '#001871',
                        borderWidth: this.sharedDatasetService.nonDiscreteBuckets[i + 1] ? 1 : 0,
                        color: 'rgba(100,100,100,0)'
                    },
                    xAxis: item.Aus && this.sharedDatasetService.nonDiscreteBuckets[i + 1] ? this.sharedDatasetService.maxAuValue - item.Aus : this.sharedDatasetService.maxAuValue
                }]
                // console.log('itemDiscreteFalse ', itemDiscreteFalse)
                return itemDiscreteFalse;
            })
        }
        return markArea;
    }


    // No need to reset axis's 
    // Called once at start
    public setChartSeries(): any[] {
        let colorSeries = [];
        this.sharedDatasetService.maxAuValue = this.nonDiscreteBuckets[0].Aus;
        let colorIncrementor = 0 ///self.sharedDatasetService.dynamicBidPrices[0];

        let chartObj = {
            value: 0,
            itemStyle: {
                color: ''
            }
        };

        let mySeries = [

            // {
            //     id: 'e',
            //     type: 'line',
            //     z: 5,
            //     animation: false,
            //     silent: false,
            //     showSymbol: false,
            //     selectedMode: false,
            //     symbolSize: 10,
            //     itemStyle: {
            //         borderColor: 'yellow',
            //         borderWidth: 5,
            //         color: 'red'
            //     },
            //     lineStyle: {
            //         type: 'solid',
            //         color: this.themeSelect === 'dark' ? 'rgba(220, 220, 0, 1)' : 'rgba(220, 220, 0, 1)',
            //         width: this.themeSelect === 'dark' ? 4 : 4
            //     },
            //     data: this.sharedDatasetService.dynamicBidPrices
            // },

            {
                id: 'f',
                type: 'bar',
                animation: false,
                animationDuration: 1,
                showBackground: false,
                colorBy: 'series',
                silent: true,
                z: 2,
                data: this.sharedDatasetService.dynamicBidPrices.map((point: any, i: number) => {

                    if (!colorSeries.includes(point)) {

                        colorSeries.push(point)
                        colorIncrementor += 1;
                    }
                    chartObj = {
                        value: point,
                        itemStyle: {
                            color: this.sharedDatasetService.colorRange[colorIncrementor]
                        }
                    }

                    return chartObj;
                }),

                markArea: this.setMarkArea(0)

            },

            {
                id: 'd',
                type: 'line',
                z: 1,
                animation: false,
                silent: true,
                showSymbol: false,
                selectedMode: false,
                symbolSize: this.showAllCurves ? 10 : 0,

                itemStyle: {
                    borderColor: 'transparent',
                    borderWidth: this.showAllCurves ? 1 : 0,
                    color: this.showAllCurves ? 'blue' : 'transparent' // 
                },
                lineStyle: {
                    type: 'solid',
                    color: 'blue',
                    width: this.showAllCurves ? 3 : 0
                },
                data: this.sharedDatasetService.interpolateBidPriceCurvePoints,
                markPoint: this.markPoint()
            },
        ]
        // console.log('mySeries ', mySeries)
        // console.log('this.colorSeries ', colorSeries)
        return mySeries;
    }


    public setChartInstance = () => {

        // console.log('\n\n\n Calling INIT Chart setChartInstance ')
        this.sharedDatasetService.maxAuValue = this.nonDiscreteBuckets[0].Aus;

        // if (!self.myChart) {

        this.myChart.setOption({

            grid: {
                show: false,
                left: 60,
                right: 20,
                top: 40,
                bottom: 40
            },
            // backgroundColor: 'rgba(205,225,245,1)',
            xAxis: {
                inverse: false,
                scale: true,
                type: 'category',
                silent: false,
                position: 'bottom',
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
                        //         show: true
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
                data: this.sharedDatasetService.dynamicBidPrices.map((bp, i) => {
                    return this.sharedDatasetService.maxAuValue - i;
                }),
            },
            yAxis: [
                {
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
                    max: this.sharedDatasetService.modifierCollection.length === 0 ? this.nonDiscreteBuckets[0].fare + 5 : this.sharedDatasetService.adjustedCurvePoints[0] + 5,
                    interval: this.nonDiscreteBuckets[0].fare < 400 ? 20 : this.nonDiscreteBuckets[0].fare > 1000 ? 350 : 35,
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
            series: []
        })
    }


    // Re-generates chart elements
    public createChartDraggingElement(redrawChartPoints: boolean): void {

        const self = this;

        const updatePosition = () => {
            setChartDragPoints();
        };



        const onPointDragging = function (dataIndex) {

            let xValue = 0;
            let dragPosition: any = [0, 0];

            const target = dataIndex;

            dragPosition = self.myChart.convertFromPixel({ gridIndex: 0 }, this.position);

            xValue = self.sharedDatasetService.maxAuValue - Math.round((dragPosition[0]))

            // console.log(
            //     '\n\n--------------------  letter ', self.nonDiscreteBuckets[target].letter,
            //     '\nAus ', self.nonDiscreteBuckets[target].Aus,
            //     '\ntarget letter ', self.nonDiscreteBuckets[target].letter,
            //     '\n[targetPlus].Aus, ', self.nonDiscreteBuckets[target].Aus,
            //     ' \nxValue ', xValue)

            if (xValue < 1) { xValue = 0; };

            if (xValue > self.sharedDatasetService.maxAuValue) { xValue = self.sharedDatasetService.maxAuValue };

            self.sharedDatasetService.calculateBidPriceForAu(self.sharedDatasetService.nonDiscreteBuckets[dataIndex].Aus, dataIndex, xValue);
            self.sharedDatasetService.applyDataChanges();

            updatePosition();

            self.myChart.setOption({
                series: self.setChartSeries()
            })
        }


        // Drag Point Selection System
        // Must select/deselect adjacent points 
        // With any points selected only single/multiple dragging permitted


        const onPointSelect = function (dataIndex) {
            // Sorts low to high
            function compareNumbers(a, b) {
                return a - b;
            }

            //console.log('onPointSelect ', dataIndex, ' selectedElement ', self.sharedDatasetService.selectedElement)

            if (self.sharedDatasetService.selectedElement.includes(dataIndex)) {
                if (self.sharedDatasetService.selectedElement.length === 1) {
                    self.sharedDatasetService.selectedElement = [];
                }
                if (dataIndex <= self.sharedDatasetService.selectedElement[0] ||
                    dataIndex >= self.sharedDatasetService.selectedElement[self.sharedDatasetService.selectedElement.length - 1]) {
                    self.sharedDatasetService.selectedElement.splice(self.sharedDatasetService.selectedElement.findIndex(idx => idx === dataIndex), 1);
                }
            } else {
                if (self.sharedDatasetService.selectedElement.length === 0 || self.sharedDatasetService.selectedElement.includes(dataIndex + 1) || self.sharedDatasetService.selectedElement.includes(dataIndex - 1)) {
                    self.sharedDatasetService.selectedElement.push(dataIndex);
                }
            }

            self.sharedDatasetService.selectedElement.sort(compareNumbers);
            self.sharedDatasetService.multiSelectedNodeSubject$.next(self.sharedDatasetService.selectedElement)
            setChartDragPoints();
        }



        const setChartDragPoints = function () {

            let placeTemp = 0;
            let xPlace = 0;
            let scaleHandles = [];
            let stackValues = [];
            let activeItems: any = {};

            self.myChart.setOption({
                graphic: echarts.util.map(self.sharedDatasetService.buckets, function (item: any, dataIndex) {

                    let stacker = 120 - dataIndex;

                    stackValues.push(stacker);

                    let dragPoint = 0;
                    if (dataIndex !== 0) {
                        scaleHandles = [xPlace, dragPoint];
                    }

                    if (self.nonDiscreteBuckets[dataIndex - 1] && self.nonDiscreteBuckets[dataIndex].Aus === self.sharedDatasetService.maxAuValue && self.nonDiscreteBuckets[dataIndex - 1].Aus === self.sharedDatasetService.maxAuValue) {
                        stackValues[dataIndex] = stackValues[dataIndex - 1] + 2;
                    }
                    // if (!self.nonDiscreteBuckets[dataIndex].discrete) {
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
                                    r: dataIndex > 0 ? 12 : 0
                                },
                                style: {
                                    fill: dataIndex === 0 ? 'transparent' : self.sharedDatasetService.selectedElement.includes(dataIndex) ? 'red' : 'rgba(255,255,255,1)',
                                    stroke: dataIndex > 0 ? 'black' : 'trnsparent',
                                    shadowBlur: 10,
                                    shadowOffsetX: -1,
                                    shadowOffsetY: -1,
                                    shadowColor: dataIndex > 0 ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
                                },
                            },
                            {
                                type: 'text',
                                z: stackValues[dataIndex],
                                x: -12,
                                y: -12,
                                style: {
                                    text: dataIndex > 0 ? `${item}` : ``,
                                    textPosition: 'inside',
                                    padding: 6,
                                    fill: !self.sharedDatasetService.selectedElement.includes(dataIndex) ? 'black' : 'white',
                                    fontSize: '15px',
                                    fontWeight: 'bold'
                                },
                            }
                        ]
                    }
                    // }
                    xPlace = (placeTemp += self.nonDiscreteBuckets[dataIndex].protections);
                    return activeItems;
                })
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
            dynamicDiff = `${sign}${pipedDynamicCurrency} `;
        }

        if (this.differenceCalculation[1] !== this.storedInterpolateBpValues) {

            const sign = this.differenceCalculation[1] > this.storedInterpolateBpValues ? '+' : '';
            const pipedCurrency = this.currencyPipe.transform((this.differenceCalculation[1] - this.storedInterpolateBpValues), 'EUR', 'symbol', '1.0-0').replace("€", "");
            interpDiff = `${sign}${pipedCurrency} `;

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
                            return `{ c | Continuous: } { dc | ${activeCurrency} } { iDiff | ${interpDiff} } \n{ f | Fixed: } { fc | ${dynCurrency} } { dDiff | ${dynamicDiff} } `;
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
