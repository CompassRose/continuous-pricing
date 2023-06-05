import { Component, Input, HostListener } from '@angular/core';
import { BidPriceInfluencers, BucketDetails } from '../models/dashboard.model';
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

    public chartSeriesCollection: any[] = [];

    public dragPosition: any;
    public previousDrag: number;

    public lastMultiselectDataIndex = 0;


    @Input()
    set gridPointsDeSelected(state: boolean) {

        if (this.sharedDatasetService.selectedElement.length > 0) {
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

        this.bidPriceCalcsService.showCompetitionSubject$
            .subscribe((res) => {
                this.myChart.setOption({
                    series: this.setChartSeries()
                })
            })

        this.sharedDatasetService.colorRangeSelection$
            .subscribe(range => {
                if (range && this.myChart) {
                    //console.log('|||||||||||||range ', range)
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
                // console.log('XXXX  theme ', theme)
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
                        //console.log('XXXXXXXXXXXXXXXXXXXXXX  apiActiveBucketsSubject$')
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
                    this.sharedDatasetService.applyDataChanges(1);
                    this.sharedDatasetService.setGroupingMethod(0);

                    if (this.showAllCurves) {
                        this.sharedDatasetService.interpolateBidPriceCurvePoints = this.bidPriceCalcsService.generateInterpolatedCurvePoints();
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
            this.createChartDraggingElement(false);
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

            // {
            //     id: 'e',
            //     type: 'line',
            //     z: 1,
            //     animation: false,
            //     silent: false,
            //     showSymbol: false,
            //     selectedMode: false,
            //     symbolSize: 0,
            //     areaStyle: {
            //         color: 'rgba(0,0,0,.8)'
            //     },
            //     lineStyle: {
            //         type: 'solid',
            //         color: this.themeSelect === 'dark' ? 'rgba(220, 220, 0, 1)' : originalCurveColor(1),
            //         width: this.themeSelect === 'dark' ? 2 : 2
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
                data: this.sharedDatasetService.dynamicChartObject,
                markArea: this.setMarkArea(0),
                markPoint: this.markPoint(),
                markLine: this.bidPriceCalcsService.markVerticalLineSellingValues(),
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
                // markPoint: this.markAreaPoint(),
                data: this.sharedDatasetService.interpolateBidPriceCurvePoints,

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

        this.sharedDatasetService.maxAuValue = this.sharedDatasetService.bucketDetailsFromApi[0].adjustedAu;

        this.myChart.setOption({

            grid: {
                show: false,
                left: 60,
                right: 20,
                top: 15,
                bottom: 35
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
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 'normal'
                    },
                    showGrid: false,
                    max: this.sharedDatasetService.bucketDetailsFromApi[0].fare + 30,
                    interval: this.sharedDatasetService.bucketDetailsFromApi[0].fare < 400 ? 20 : this.sharedDatasetService.bucketDetailsFromApi[0].fare > 1000 ? 350 : 35,
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
        //console.log('?????????? \ncreateChartDraggingElement\n ???????????????')
        const self = this;

        const updatePosition = () => {
            setChartDragPoints();
        };

        let xValue;

        const onPointDragging = function (dataIndex: number, pos: number[], item: number) {

            self.dragPosition = self.myChart.convertFromPixel('grid', pos);
            self.sharedDatasetService.lastDataIndex = Math.round(JSON.parse(JSON.stringify(pos[0])));

            xValue = self.sharedDatasetService.maxAuValue - self.dragPosition[0];
            if (xValue > self.sharedDatasetService.maxAuValue) {
                xValue = self.sharedDatasetService.maxAuValue
            };
            if (xValue < 1) { xValue = 0; };

            if (self.sharedDatasetService.selectedElement.length > 1) {
                // Not able to drag unselected elements
                if (self.sharedDatasetService.selectedElement.includes(dataIndex)) {
                    self.sharedDatasetService.calculateBidPriceForAu(dataIndex, xValue, self.sharedDatasetService.dragDirection);
                }
                // Single Selection
            } else {
                self.sharedDatasetService.calculateBidPriceForAu(dataIndex, xValue, self.sharedDatasetService.dragDirection);
            }

        }


        const selectElement = (dataIndex) => {
            self.onPointSelect(dataIndex);
            self.lastMultiselectDataIndex = self.sharedDatasetService.bucketDetailsFromApi[dataIndex].adjustedAu
            setChartDragPoints();
        };


        let xPlace = 0;

        const setChartDragPoints = function () {

            // console.log('\nsetChartDragPoints \n', redrawChartPoints)
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
                                    text: dataIndex === 0 ? `` : self.sharedDatasetService.selectedElement.includes(dataIndex) ? `${self.sharedDatasetService.bucketDetailsFromApi[dataIndex].letter}` : `${self.sharedDatasetService.bucketDetailsFromApi[dataIndex].letter}`,
                                    textPosition: 'inside',
                                    fill: !self.sharedDatasetService.selectedElement.includes(dataIndex) ? 'black' : 'white',
                                    fontSize: '13px',
                                    fontWeight: 'bold'
                                },
                            }
                        ]
                    }
                    xPlace = (placeTemp += self.sharedDatasetService.bucketDetailsFromApi[dataIndex].protections);
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
            data: this.sharedDatasetService.bucketDetailsFromApi.map((item: any, i) => {
                if (!item.isDiscrete) {
                    itemDiscreteFalse = [{
                        name: item.letter,
                        xAxis: (this.sharedDatasetService.maxAuValue - item.adjustedAu) + item.protections,
                        label: {
                            show: item.adjustedAu > 0 ? true : false,
                            backgroundColor: i > 0 ? item.color : 'rgba(245,245,255,1)',
                            padding: [4, 5, 1, 5],
                            fontSize: 12,
                            fontWeight: 'bold',
                            color: this.bidPriceCalcsService.generateContrastingFontColors(item.color),
                            borderColor: i > 0 ? 'rgba(105,105,115,0.8)' : 'transparent',
                            borderWidth: 0.5,
                            position: 'insideTop',
                            offset: [0, -5],
                        },
                    }, {
                        itemStyle: {
                            borderColor: '#001871',
                            borderWidth: this.sharedDatasetService.bucketDetailsFromApi[i + 1] ? 1 : 0,
                            color: 'rgba(100,100,100,0)'
                        },
                        xAxis: item.adjustedAu && this.sharedDatasetService.bucketDetailsFromApi[i + 1] ? this.sharedDatasetService.maxAuValue - item.adjustedAu : this.sharedDatasetService.maxAuValue
                    }]
                }
                return itemDiscreteFalse;
            })
        }
        return markArea;
    }

    //
    // Top right stat box // Temporarily removed
    //
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

        let sellingPoint = this.sharedDatasetService.dynamicBidPrices.length > 130 ? 120 : 10;

        coordinatesForMarkPoint = [sellingPoint, this.sharedDatasetService.dynamicBidPrices[sellingPoint]];

        sellingValues = this.bidPriceCalcsService.findMatchingBucketForBidPrice(this.sharedDatasetService.dynamicBidPrices[sellingPoint]);

        if (this.sharedDatasetService.dynamicBidPrices[sellingPoint]) {
            this.markPointContainer = {
                clickable: false,
                animation: false,
                data: [
                    {
                        coord: coordinatesForMarkPoint,
                        symbol: 'circle',
                        symbolSize: this.sharedDatasetService.totalBookingsCollector > 0 ? 25 : 25,
                        itemStyle: {
                            color: sellingValues.color,
                            borderColor: 'white',
                            borderWidth: 1,
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
                                    fontWeight: 'bold',
                                    fontSize: 13,
                                    color: this.bidPriceCalcsService.generateContrastingFontColors(sellingValues.color)
                                },
                            },
                        }
                    }
                ]
            };

        }
        // console.log('this.markPointContainer ', this.markPointContainer)
        return this.markPointContainer;
    }
}
