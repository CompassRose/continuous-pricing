import { Component, Input, HostListener } from '@angular/core';
import { BidPriceInfluencers, BarSeries, BucketDetails } from '../models/dashboard.model';
import { SharedDatasetService } from '../services/shared-datasets.service';
import { BidPriceCalcsService } from '../services/au-visualization-calcs-service';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import * as echarts from 'echarts';
import { ThemeControlService } from '../services/theme-control.service';

export const adjustedCurveColor = (val) => {
    return `rgba(142,19,141,${val})`;
};

export const originalCurveColor = (val) => {
    return `rgba(0, 139, 125,${val})`;
};

export const modifiedCurveColor = (val) => {
    return `rgba(25, 42, 243,${val})`;
};


@Component({
    selector: 'continuous-bid-pricing',
    templateUrl: './au-visualization-chart.component.html',
    styleUrls: ['./au-visualization-chart.component.scss'],
    providers: [CurrencyPipe, DecimalPipe]
})



export class ContinousBidPricingComponent {

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

    public dragPosition: any;
    public previousDrag: number;

    public lastMultiselectDataIndex = 0;
    //public lastDataIndex = 0;
    //public dragDirection: string = '';

    @Input()
    set gridPointsDeSelected(state: boolean) {

        if (this.sharedDatasetService.selectedElement.length > 0) {
            console.log('gridPointsDeSelected ', state)
            this.sharedDatasetService.selectedElement = [];
            this.sharedDatasetService.setGroupingMethod(0);
            this.sharedDatasetService.multiSelectedNodeSubject$.next([])
            this.createChartDraggingElement(true);
        }
    }


    @Input()
    set showBidPriceCurve(state: boolean) {
        if (this.myChart) {
            this.showAllCurves = state;
            //console.log('{{{}}}}}showAllCurves ', this.showAllCurves)

            if (state) {
                this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
            }

            this.setChartInstance();
            this.createChartDraggingElement(false);
            this.myChart.setOption({
                series: this.setChartSeries()
            })
        }
    }


    constructor(

        public sharedDatasetService: SharedDatasetService,
        public bidPriceCalcsService: BidPriceCalcsService,
        public themeControlService: ThemeControlService,
        private currencyPipe: CurrencyPipe) {

        this.themeSelect = JSON.parse(window.localStorage.getItem('colorTheme'));

        this.sharedDatasetService.colorRangeSelection$
            .subscribe(range => {
                if (range && this.myChart) {
                    console.log('range ', range)
                    this.sharedDatasetService.adjustPieceColorForBookingUpdates();
                    this.createSvg();
                    this.setChartInstance();
                    this.createChartDraggingElement(true);
                    this.myChart.setOption({
                        series: this.setChartSeries()
                    })
                }

            })

        this.themeControlService.resetThemeSubject$
            .subscribe((theme: string) => {
                console.log('XXXX  theme ', theme)
                this.themeSelect = theme;
                this.createSvg();
                this.setChartInstance();
                this.createChartDraggingElement(true);
                this.myChart.setOption({
                    series: this.setChartSeries()
                })
            })



        this.sharedDatasetService.apiActiveBucketsSubject$
            .subscribe(response => {
                if (response.length > 0) {
                    this.createSvg();
                    setTimeout(() => {
                        this.setChartInstance();
                    }, 0);
                }
            })


        this.sharedDatasetService.resetDefaultSubject$
            .subscribe(response => {

                if (response) {
                    this.sharedDatasetService.totalBookingsCollector = 0;
                    this.sharedDatasetService.influenceInput.next([1.00, 'mult', 0]);
                    this.sharedDatasetService.influenceInput.next([0, 'addSub', 1]);

                    this.sharedDatasetService.modifierCollection = [];
                    this.sharedDatasetService.selectedElement = [];
                    this.sharedDatasetService.applyDataChanges();
                    this.sharedDatasetService.setGroupingMethod(0);

                    // console.log('this.showAllCurves ', this.showAllCurves)
                    if (this.showAllCurves) {
                        this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
                        //this.sharedDatasetService.activeCurve = this.sharedDatasetService.interpolateBidPriceCurvePoints;
                    }

                    if (this.sharedDatasetService.selectedElement.length > 0) {
                        this.sharedDatasetService.selectedElement = [];
                        this.sharedDatasetService.setGroupingMethod(0);
                    }
                    this.createChartDraggingElement(true);
                }
            })


        this.sharedDatasetService.bucketDetailsBehaviorSubject$
            .subscribe((state: boolean) => {
                if (this.myChart) {
                    if (this.showAllCurves) {
                        this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
                    }
                    setTimeout(() => {
                        //  console.log(' ---- bucketDetailsBehaviorSubject$ ', state, ' this.myChart ', this.myChart)
                        this.createChartDraggingElement(true);
                        this.myChart.setOption({
                            series: this.setChartSeries()
                        })
                    }, 0);

                }
            })
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
        setTimeout(() => {
            this.createChartDraggingElement(true);
        }, 100);
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



    // No need to reset axis's 
    // Called once at start
    public setChartSeries(): any[] {

        let mySeries = [

            {
                id: 'e',
                type: 'line',
                z: 1,
                animation: false,
                silent: false,
                showSymbol: false,
                selectedMode: false,
                symbolSize: 0,
                areaStyle: {
                    color: 'rgba(0,0,0,.8)'
                },
                lineStyle: {
                    type: 'solid',
                    color: this.themeSelect === 'dark' ? 'rgba(220, 220, 0, 1)' : originalCurveColor(1),
                    width: this.themeSelect === 'dark' ? 2 : 2
                },
                data: this.sharedDatasetService.dynamicBidPrices
            },
            {
                id: 'f',
                type: 'bar',
                animation: false,
                animationDuration: 1,
                showBackground: false,
                colorBy: 'series',
                silent: true,
                z: 2,
                data: this.sharedDatasetService.dynamicChartObject,
                markArea: this.setMarkArea(0)
            },

            {
                id: 'd',
                type: 'line',
                z: 3,
                animation: false,
                silent: true,
                showSymbol: false,
                selectedMode: false,
                symbolSize: this.showAllCurves ? 10 : 0,
                areaStyle: {
                    color: this.showAllCurves ? originalCurveColor(.25) : originalCurveColor(0)
                },
                itemStyle: {
                    borderColor: 'transparent',
                    borderWidth: this.showAllCurves ? 1 : 0,
                    color: this.showAllCurves ? 'blue' : 'transparent' // 
                },
                lineStyle: {
                    type: 'solid',
                    color: originalCurveColor(1),
                    width: this.showAllCurves ? 3 : 0
                },
                data: this.sharedDatasetService.interpolateBidPriceCurvePoints,
                markPoint: this.markPoint()
            },
        ]
        return mySeries;
    }



    public onPointSelect = function (dataIndex) {

        // Sorts low to high

        function compareNumbers(a, b) {
            return a - b;
        }
        //console.log('onPointSelect ', dataIndex, ' selectedElement ', this.sharedDatasetService.selectedElement)
        if (this.sharedDatasetService.selectedElement.includes(dataIndex)) {
            if (this.sharedDatasetService.selectedElement.length === 1) {
                this.sharedDatasetService.selectedElement = [];
            }
            if (dataIndex <= this.sharedDatasetService.selectedElement[0] ||
                dataIndex >= this.sharedDatasetService.selectedElement[this.sharedDatasetService.selectedElement.length - 1]) {
                this.sharedDatasetService.selectedElement.splice(this.sharedDatasetService.selectedElement.findIndex(idx => idx === dataIndex), 1);
            }
        } else {
            if (this.sharedDatasetService.selectedElement.length === 0 || this.sharedDatasetService.selectedElement.includes(dataIndex + 1) || this.sharedDatasetService.selectedElement.includes(dataIndex - 1)) {
                this.sharedDatasetService.selectedElement.push(dataIndex);
            }
        }
        this.sharedDatasetService.selectedElement.sort(compareNumbers);
        this.sharedDatasetService.multiSelectedNodeSubject$.next(this.sharedDatasetService.selectedElement);
    }



    public setChartInstance = () => {

        console.log('\n\n\n Calling INIT Chart setChartInstance ')
        this.sharedDatasetService.maxAuValue = this.sharedDatasetService.nonDiscreteBuckets[0].Aus;

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
                    fontSize: 11,
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
                    max: this.sharedDatasetService.nonDiscreteBuckets[0].fare + 5,
                    interval: this.sharedDatasetService.nonDiscreteBuckets[0].fare < 400 ? 20 : this.sharedDatasetService.nonDiscreteBuckets[0].fare > 1000 ? 350 : 35,
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
        //console.log('XXXXXXXXXXXXXXXXX  createChartDraggingElement ', redrawChartPoints)
        const self = this;

        const updatePosition = () => {
            /// console.log('updatePosition ')
            setChartDragPoints();
        };
        let xValue;
        let previousDrag = 0;

        const onPointDragging = function (dataIndex: number, pos: number[], item: number) {

            // console.log('self.previousDrag  ', self.previousDrag)

            self.dragPosition = self.myChart.convertFromPixel('grid', pos);

            // console.log(' self.dragPosition[0] ', self.dragPosition[0])

            self.sharedDatasetService.lastDataIndex = Math.round(JSON.parse(JSON.stringify(pos[0])));

            xValue = self.sharedDatasetService.maxAuValue - self.dragPosition[0];

            if (xValue === self.sharedDatasetService.maxAuValue) { xValue = self.sharedDatasetService.maxAuValue };

            if (xValue < 1) { xValue = 0; };

            // if (self.sharedDatasetService.selectedElement.length > 1) {
            //     xValue = item
            //     // console.log('item ', item, ' xValue ', xValue, '\nlastDataIndex ', self.sharedDatasetService.lastDataIndex, '\nselectedElement \n', self.sharedDatasetService.nonDiscreteBuckets[self.sharedDatasetService.selectedElement[0]].letter, ' prot 0 ',
            //     //     self.sharedDatasetService.nonDiscreteBuckets[self.sharedDatasetService.selectedElement[0]].Aus,
            //     //     '\n', self.sharedDatasetService.nonDiscreteBuckets[self.sharedDatasetService.selectedElement[1]].letter, ' prot 1 ', self.sharedDatasetService.nonDiscreteBuckets[self.sharedDatasetService.selectedElement[1]].Aus,

            //     //     '\n lastMultiselectDataIndex ', self.lastMultiselectDataIndex
            //     // )

            //     if (self.previousDrag > self.dragPosition[0]) {
            //         //self.lastMultiselectDataIndex = xValue - 1;
            //         self.sharedDatasetService.dragDirection = 'up'
            //     } else {
            //         //self.lastMultiselectDataIndex = xValue + 1;
            //         self.sharedDatasetService.dragDirection = 'down'
            //     }
            // }
            // console.log('xValue ', xValue, ' protections ', self.sharedDatasetService.nonDiscreteBuckets[dataIndex].protections, ' book ', self.sharedDatasetService.nonDiscreteBuckets[dataIndex].bookings)
            self.sharedDatasetService.calculateBidPriceForAu(dataIndex, xValue, self.sharedDatasetService.dragDirection);
            self.previousDrag = JSON.parse(JSON.stringify(self.dragPosition[0]));
        }


        const selectElement = (dataIndex) => {
            //console.log('dataIndex ', self.sharedDatasetService.nonDiscreteBuckets[dataIndex].letter, ' Aus ', self.sharedDatasetService.nonDiscreteBuckets[dataIndex].Aus)
            self.onPointSelect(dataIndex);
            //const handles = [self.sharedDatasetService.maxAuValue - self.sharedDatasetService.nonDiscreteBuckets[dataIndex].Aus, 0];
            self.lastMultiselectDataIndex = self.sharedDatasetService.nonDiscreteBuckets[dataIndex].Aus
            setChartDragPoints();
        };


        let xPlace = 0;
        const setChartDragPoints = function () {
            // console.log('setChartDragPoints ')
            let stackValues = [];
            let activeItems: any = {};
            let placeTemp = 0;

            let scaleHandles = [];

            self.myChart.setOption({
                graphic: echarts.util.map(self.sharedDatasetService.currAus, (item, dataIndex) => {
                    let stacker = 120 - dataIndex;
                    stackValues.push(stacker);
                    let dragPoint = 0;
                    if (dataIndex !== 0) {
                        scaleHandles = [xPlace, dragPoint];
                    }

                    // const handles = [self.sharedDatasetService.maxAuValue - item, dragPoint];

                    // console.log('stackValues ', self.sharedDatasetService.nonDiscreteBuckets[dataIndex].letter, ' scaleHandles ', scaleHandles)


                    // if (self.sharedDatasetService.nonDiscreteBuckets[dataIndex - 1] &&
                    //     self.sharedDatasetService.nonDiscreteBuckets[dataIndex].Aus === self.sharedDatasetService.nonDiscreteBuckets[dataIndex - 1].Aus) {
                    //     //stackValues[dataIndex] -= 1;
                    //     stackValues[dataIndex] += 2;
                    //    // console.log('\nINSIDE PRE\n',
                    //         self.sharedDatasetService.nonDiscreteBuckets[dataIndex].letter, 'stackValues[dataIndex] ', stackValues[dataIndex],
                    //         '\n- 1', self.sharedDatasetService.nonDiscreteBuckets[dataIndex - 1].letter, 'stackValues[dataIndex] ', stackValues[dataIndex - 1])

                    // }

                    activeItems = {
                        type: 'group',
                        position: self.myChart.convertToPixel('grid', scaleHandles),
                        draggable: true,
                        //z: stackValues[dataIndex],

                        ondrag: function (dx, dy) {

                            if (self.sharedDatasetService.selectedElement.length < 2) {

                                if (dx.target.x > self.sharedDatasetService.lastDataIndex) {
                                    self.sharedDatasetService.dragDirection = 'up';
                                } else {
                                    self.sharedDatasetService.dragDirection = 'down';

                                }
                            }
                            //else {

                            //  console.log(' Multiple selected  ', self.sharedDatasetService.selectedElement, ' item ', item)

                            //}

                            // console.log('|||||||||||||  dragDirection ', self.sharedDatasetService.dragDirection, '\n lastDataIndex ', self.sharedDatasetService.lastDataIndex)
                            onPointDragging(dataIndex, [this.x, 0], item);
                        },

                        onclick: echarts.util.curry(selectElement, dataIndex),
                        // onmousedown: echarts.util.curry(selectElement, dataIndex),
                        children: [
                            {
                                type: 'circle',
                                z: stackValues[dataIndex], //stackValues[dataIndex],
                                shape: {
                                    r: dataIndex > 0 ? 10 : 0
                                },
                                cursor: self.sharedDatasetService.selectedElement.includes(dataIndex) ? 'move' : 'pointer',
                                style: {
                                    fill: dataIndex === 0 ? 'transparent' : self.sharedDatasetService.selectedElement.includes(dataIndex) ? 'red' : 'rgba(255,255,255,1)',
                                    stroke: dataIndex > 0 ? 'black' : 'transparent',
                                    shadowBlur: 10,
                                    shadowOffsetX: -1,
                                    shadowOffsetY: -1,
                                    shadowColor: dataIndex > 0 ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
                                },
                            },
                            {
                                type: 'text',
                                z: stackValues[dataIndex],
                                x: -5,
                                y: -6,
                                cursor: self.sharedDatasetService.selectedElement.includes(dataIndex) ? 'move' : 'pointer',
                                style: {
                                    text: dataIndex === 0 ? `` : self.sharedDatasetService.selectedElement.includes(dataIndex) ? `${self.sharedDatasetService.nonDiscreteBuckets[dataIndex].letter}` : `${self.sharedDatasetService.nonDiscreteBuckets[dataIndex].letter}`,
                                    textPosition: 'inside',
                                    fill: !self.sharedDatasetService.selectedElement.includes(dataIndex) ? 'black' : 'white',
                                    fontSize: '13px',
                                    fontWeight: 'bold'
                                },
                            }
                        ]
                    }
                    xPlace = (placeTemp += self.sharedDatasetService.nonDiscreteBuckets[dataIndex].protections);
                    //  console.log('xPlace ', xPlace)
                    return activeItems;
                })
            })
        }

        if (redrawChartPoints) {
            updatePosition();
        }
    }



    // Sets Fare class regions on top of chart
    public setMarkArea(index: number) {

        let itemDiscreteFalse;

        const markArea = {
            silent: false,
            data: this.sharedDatasetService.nonDiscreteBuckets.map((item: any, i) => {

                itemDiscreteFalse = [{
                    name: item.letter,
                    xAxis: (this.sharedDatasetService.maxAuValue - item.Aus) + item.protections,
                    label: {
                        show: item.Aus > 0 ? true : false,
                        backgroundColor: i > 0 ? 'rgba(245,245,255,1)' : 'rgba(245,245,255,1)',
                        padding: [3, 4, 0, 4],
                        fontSize: 12,
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
                return itemDiscreteFalse;
            })
        }
        return markArea;
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
            activeColor = 'blue'
            // this.sharedDatasetService.adjustedCurvePoints.length ? 'green' : this.sharedDatasetService.totalBookingsCollector > 0 ? 'blue' : 'transparent';
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
