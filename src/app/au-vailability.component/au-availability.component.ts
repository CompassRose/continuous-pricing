import { Component, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import * as echarts from 'echarts';
import { BidPriceCalcsService } from '../services/au-visualization-calcs-service';
import { ColorManagerService } from '../services/color-manager-service';
import { SharedDatasetService } from '../services/shared-datasets.service';
import { ThemeControlService } from '../services/theme-control.service';
import { blueRamp16 } from '../dashboard-constants'

@Component({
    selector: 'draggable-available',
    templateUrl: './au-availability.component.html',
    styleUrls: ['./au-availability.component.scss']
})

export class AuAvailabilityComponent implements AfterViewInit {

    public options: any = {};
    public myChart: echarts.ECharts = null;
    public selectedElement = [];
    public allSeriesData: number[][] = [];
    public themeSelect = '';
    public colorRange: string[] = [];

    constructor(public sharedDatasetService: SharedDatasetService,
        public themeControlService: ThemeControlService,
        public bidPriceCalcsService: BidPriceCalcsService,
        private colorManagerService: ColorManagerService) {

        this.themeSelect = JSON.parse(window.localStorage.getItem('colorTheme'));
        this.colorRange = this.bidPriceCalcsService.getColorValues();

        //  console.log('AuAvailabilityComponent tempSavedCollection ', this.themeSelect)

        this.themeControlService.resetThemeSubject$
            .subscribe((theme: string) => {
                // console.log('theme ', theme)
                this.themeSelect = theme;
                this.createSvg();
            })


        this.sharedDatasetService.bucketDetailsBehaviorSubject$
            .subscribe((state) => {

                if (this.myChart) {
                    //  console.log('Au Chart ', this.sharedDatasetService.bucketDetails)
                    // this.createSvg('draggable-available')
                    this.createChartElement();
                }
            })

        this.sharedDatasetService.resetDefaultSubject$
            .subscribe(response => {
                if (response) {
                    this.createSvg();
                }

            })

        // const tempSavedCollection = JSON.parse(window.localStorage.getItem('savedBucketCollection'));
    }

    @HostListener('window:resize') onResize() {

        if (this.myChart) {
            this.myChart.resize();
        }
    }

    updatePosition: () => void;

    // Called from template auto resize chart
    public onChartInit(e): void { }


    public ngAfterViewInit(): void {
        this.createSvg()
    }

    // public getColorValues(): string[] {
    //     this.colorRange = this.colorManagerService.genColors(this.sharedDatasetService.bucketDetails.length);
    //     console.log('getColorValues ', this.colorRange)
    //     return this.colorManagerService.genColors(this.sharedDatasetService.bucketDetails.length);
    // }

    // Initialize Chart Node
    public createSvg() {

        if (echarts.init(document.getElementById('draggable-available'))) {
            echarts.init(document.getElementById('draggable-available')).dispose();
        }

        const chart: HTMLCanvasElement = document.getElementById('draggable-available') as HTMLCanvasElement;
        this.myChart = echarts.init(chart, this.themeSelect);

        setTimeout(() => {
            this.createChartElement();
        }, 0);

    }


    public refreshChartVisual = () => {
        this.myChart.resize();
    }


    public selectBars(index) {

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
        //console.log(' selectedElement ', this.selectedElement)
    }

    public applyDataChanges() {
        this.sharedDatasetService.calculateAus();
    }

    public createChartElement = () => {

        const self = this;

        const updatePosition = () => {
            // console.log('updatePosition updatePosition updatePosition updatePosition')
            setChartOptions();
            setTimeout(() => {
                setChartDragPoints();

            }, 300);
        };


        const onPointDragging = function (dataIndex) {
            // const test = self.sharedDatasetService.generateBookingCounts()

            let yValue = 0;
            let dragPosition: any = [0, 0];
            dragPosition = self.myChart.convertFromPixel({ gridIndex: 0 }, this.position);

            yValue = Math.round(Math.floor(dragPosition[0]));
            console.log('yValue ', yValue)
            if (yValue < 0) { yValue = 0; }
            //if (yValue > self.maxAuValue) { yValue = self.maxAuValue }

            if (self.sharedDatasetService.bucketDetails[dataIndex].discrete) {

                self.sharedDatasetService.bucketDetails[dataIndex].Aus = yValue;
                console.log('dataIndex ', dataIndex, ' Aus ', self.sharedDatasetService.bucketDetails[dataIndex].Aus)
                // self.sharedDatasetService.calculateBidPriceForAu(self.sharedDatasetService.currAus[dataIndex], dataIndex, yValue);

                //self.applyDataChanges();
                // self.sharedDatasetService.generateBucketValues();
                //updatePosition();
                setChartDragPoints()
            }

        }


        const setChartDragPoints = function () {

            const symbolSize = 28;

            self.myChart.setOption({

                graphic: echarts.util.map(self.sharedDatasetService.bucketDetails, (item, dataIndex) => {

                    //if (item.discrete) {
                    //console.log('util ', item, ' dataIndex ', dataIndex)
                    let activeItems = {}
                    const handles = item.discrete ? [item.letter, self.sharedDatasetService.bucketDetails[dataIndex].Aus] : [];
                    const fillColor = 'Blue';
                    const strokeColor = '#d1c027';
                    const lineWidth = 2;

                    activeItems = {
                        type: 'circle',
                        position: self.myChart.convertToPixel('grid', handles),
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
                        z: 100
                    }

                    //}
                    return activeItems;
                })

            })
        }

        const setChartOptions = function () {

            self.myChart.setOption({

                grid: {
                    show: false,
                    left: 55,
                    right: 20,
                    top: 55,
                    bottom: 50
                },
                tooltip: {
                    show: true,
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1,
                    borderColor: 'Blue',
                    extraCssText: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);',
                    padding: [5, 10],
                    axisPointer: {
                        trigger: 'line',
                    },
                    textStyle: {
                        fontSize: 14,
                        color: '#000'
                    },
                    formatter: (params) => {
                        const calc = self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.totalBookingsCollector;
                        const saValue = calc > 0 ? `<br>Sa: ${calc}` : ``;
                        return `Class: ${self.sharedDatasetService.bucketDetails[params.dataIndex].letter}<br>Fare: ${self.sharedDatasetService.bucketDetails[params.dataIndex].fare}<br>Aus: ${self.sharedDatasetService.bucketDetails[params.dataIndex].Aus}${saValue}`;
                    }
                },
                legend: {
                    show: true,
                    selectedMode: false,
                    textStyle: {
                        fontSize: 13,
                        //lineHeight: 45,
                        //height: 33,
                    },
                    //top: 0,
                    itemWidth: 30,
                    itemHeight: 14,

                    right: 80,
                    data: [
                        {
                            name: 'SA',
                            icon: 'rect',
                            itemStyle: {
                                color: 'rgb(65, 65, 255)', //'#0000A0',  //rgba(32, 96, 248, 1)
                                borderColor: 'transparent',
                                borderWidth: 0,
                                borderType: 'solid',

                                decal: {
                                    symbol: 'rect',
                                    color: 'rgba(39, 39, 255, 0.32)',
                                    dashArrayX: [3, 0],
                                    dashArrayY: [4, 2],
                                    symbolSize: 1,
                                    rotation: Math.PI / 6
                                }
                            }
                        },
                        {
                            name: 'Protections',
                            icon: 'rect',
                            itemStyle: {
                                color: '#5F1BAF',
                                opacity: 1,
                                decal: {
                                    symbol: 'rect',
                                    color: 'rgba(0, 0, 0, 0.1)',
                                    dashArrayX: [1, 0],
                                    dashArrayY: [4, 4],
                                    symbolSize: 1,
                                    rotation: Math.PI / 6
                                },
                            }
                        },
                        {
                            name: 'Bookings',
                            icon: 'rect'
                        },]
                },
                yAxis: [
                    {
                        type: 'value',
                        id: 0,
                        name: 'Seats',
                        position: 'left',
                        nameLocation: 'middle',
                        nameRotate: 90,
                        nameGap: 35,
                        nameTextStyle: {
                            fontSize: 14,
                            fontWeight: 'normal'
                        },
                        max: function (value) {
                            return value.max + 15;
                        },
                        //max: (self.sharedDatasetService.bucketDetails[0].Aus) + 20,
                        interval: 10,
                        inverse: false,
                        axisLine: {
                            show: true
                        },
                        axisLabel: {
                            fontSize: 12
                        },
                    },
                ],
                xAxis: [
                    {
                        show: true,
                        type: 'category',
                        axisLabel: {
                            fontSize: 14,
                            fontWeight: 'bold',
                        },
                        inverse: false,
                        position: 'top',
                        axisTick: {
                            show: true,
                        },
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            return item.letter;
                        }),
                    },
                    {
                        show: true,
                        type: 'category',
                        name: 'Bookings',
                        nameLocation: 'middle',
                        nameGap: 25,
                        nameTextStyle: {
                            fontSize: 14,
                            fontWeight: 'bold'
                        },

                        inverse: false,
                        position: 'bottom',
                        axisTick: {
                            show: true,
                        },

                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {

                            let booksValue = `${item.bookings}`;
                            return {
                                value: booksValue,
                                textStyle: {
                                    color: 'rgb(55, 165, 55)',
                                    fontSize: 13,
                                    fontWeight: 'bold',

                                }
                            }

                        }),
                    }
                ],
                series: [
                    {
                        type: 'bar',
                        barGap: '-100%',
                        showBackground: false,
                        name: 'AUs',
                        z: 1,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {

                            //return self.sharedDatasetService.bucketDetails[i].Aus;
                            let discreteItems = {};

                            if (self.sharedDatasetService.bucketDetails[i].discrete) {

                                const test = self.sharedDatasetService.bucketDetails[i].Aus;

                                discreteItems = {
                                    value: test,
                                    label: {
                                        // itemStyle: {
                                        //     color: () => {
                                        //         return self.themeSelect === 'dark' ? 'rgba(255, 245, 6, .65)' : 'rgba(255, 245, 6, .4)'
                                        //     },
                                        //     decal: {
                                        //         //symbol: 'rect',
                                        //         color: 'rgba(50, 50, 70, 1 )',
                                        //         //backgroundColor: 'rgba(200, 200, 0, .5)',
                                        //         dashArrayX: [1, 0],
                                        //         dashArrayY: [2, 3],
                                        //         symbolSize: 0.5,
                                        //         rotation: Math.PI / 6
                                        //     }
                                        // },

                                        show: true,
                                        formatter: (params) => {
                                            // console.log('params ', params, ' BD ', self.sharedDatasetService.bucketDetails[params.dataIndex])
                                            let active;
                                            // let fareString = self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.bucketDetails[params.dataIndex].protections;
                                            const fareString = self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.totalBookingsCollector
                                            if (self.sharedDatasetService.bucketDetails[params.dataIndex]) {
                                                const auDiff = Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].Aus);
                                                active = auDiff//< self.sharedDatasetService.bucketDetails[params.dataIndex].Aus ? Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].Aus) : '';
                                            }
                                            return `${active}`
                                        },

                                        color: self.themeSelect === 'dark' ? 'white' : 'black',
                                        fontSize: 12,
                                        fontWeight: 'normal',
                                        // padding: 5,
                                        offset: item.bookings > 0 ? [0, -10] : [0, -10],
                                        position: 'top',
                                    },
                                    itemStyle: {
                                        color: 'rgba(255, 255, 4, 0.0)',//'#1F45FC', //'#0000A0',  //rgba(32, 96, 248, 1)
                                        // shadowColor: 'gold',
                                        // shadowOffsetY: -2,
                                        decal: {
                                            symbol: 'rect',
                                            color: 'rgba(255, 255, 4, 0.28)',
                                            dashArrayX: [2, 1],
                                            dashArrayY: [2, 4],
                                            symbolSize: 4,
                                            rotation: Math.PI / 6
                                        }
                                    },
                                }

                            }
                            return discreteItems;
                        }),
                    },

                    {
                        type: 'bar',
                        name: 'Protections',
                        silent: true,
                        barGap: '-100%',
                        barWidth: '90%',
                        stack: 'total',
                        z: 6,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {

                            // item.discrete ? false : true
                            const test = item.protections > 0 && !item.discrete ? item.protections : 0;
                            return {
                                value: test,
                                label: {
                                    show: false,// temp > 0 ? true : false,
                                    width: 25,
                                    height: 14,
                                    backgroundColor: '#5F1BAF',
                                    //padding: 3,
                                    formatter: (params) => {
                                        let active;
                                        const auDiff = Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].protections - self.sharedDatasetService.bucketDetails[params.dataIndex].bookings);

                                        //console.log('params.dataIndex, letter ', self.sharedDatasetService.bucketDetails[params.dataIndex].letter, ' auDiff ', auDiff)
                                        active = auDiff > 0 ? auDiff : '' // > self.sharedDatasetService.bucketDetails[params.dataIndex].bookings ? Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].protections) : '';

                                        return active;
                                    },
                                    color: 'white',
                                    fontSize: 11,
                                    fontWeight: 'normal',
                                    textBorderWidth: 0,
                                    textBorderColor: 'black',
                                    offset: [0, 11],
                                    position: 'top',
                                },

                                itemStyle: {
                                    color: '#981D97',
                                    opacity: 1,
                                    // borderColor: 'black',
                                    // borderWidth: 0,
                                    // shadowColor: 'black',
                                    // shadowOffsetY: -2,
                                    // decal: {
                                    //     symbol: 'rect',
                                    //     color: 'rgba(0, 0, 0, 0.1)',
                                    //     dashArrayX: [1, 0],
                                    //     dashArrayY: [4, 2],
                                    //     symbolSize: 1,
                                    //     rotation: Math.PI / 6
                                    // },
                                }
                            }
                        })
                    },
                    {
                        type: 'bar',
                        name: 'Bookings',
                        barGap: '-100%',
                        //stack: 'total',
                        barWidth: '90%',
                        z: 8,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            return item.bookings;
                        }),
                        itemStyle: {
                            color: 'rgb(55, 165, 55)',
                            decal: {
                                symbol: 'rect',
                                color: 'rgba(0, 0, 0, 0.12)',
                                dashArrayX: [1, 0],
                                dashArrayY: [4, 2],
                                symbolSize: 1,
                                rotation: Math.PI / 6
                            }
                        },
                    },
                    {
                        type: 'bar',
                        stack: 'total',
                        barWidth: '90%',
                        name: 'SA',
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(180, 130, 10, 0.05)'
                        },
                        z: 2,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            // console.log('item ', item)
                            const diff = item.Aus - self.sharedDatasetService.totalBookingsCollector;
                            const auValue = item.Aus;
                            const auDiff = Math.round(item.protections - item.bookings);
                            const test = diff > 0 ? Math.round(diff) : '';
                            return {
                                value: test,
                                label: {

                                    show: true,
                                    formatter: () => {
                                        let fareString = test;
                                        return `${fareString}` /// ${active}\n
                                    },

                                    color: self.themeSelect === 'dark' ? 'white' : 'black',
                                    fontSize: 12,
                                    fontWeight: 'normal',
                                    // padding: 5,
                                    offset: [0, 4],
                                    position: 'top' ///item.bookings > 0 ? 'top' : 'insideTop',
                                },
                                itemStyle: {
                                    color: blueRamp16[i],
                                    ////'rgb(65, 65, 255)', //'#0000A0',  //rgba(32, 96, 248, 1)
                                    borderColor: 'transparent',
                                    borderWidth: 0,
                                    borderType: 'solid',
                                    // shadowColor: 'black',
                                    // shadowOffsetY: -2,
                                    // decal: {
                                    //     symbol: 'rect',
                                    //     color: 'rgba(39, 39, 255, 0.22)',
                                    //     dashArrayX: [3, 0],
                                    //     dashArrayY: [4, 2],
                                    //     symbolSize: 1,
                                    //     rotation: Math.PI / 6
                                    // }
                                },
                                emphasis: {
                                    itemStyle: {
                                        borderColor: '#000',
                                        borderWidth: 1,
                                        borderType: 'solid',
                                    }
                                },
                            }
                        }),
                    }]
            });
        }

        updatePosition();
    }


    private getTextColor(idx) {
        return this.sharedDatasetService.bucketDetails[idx].fare;
    }

    private currYAvailValue(idx: number) {
        return this.sharedDatasetService.currAus[idx];
    }

}

