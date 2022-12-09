import { Component, ElementRef, AfterViewInit } from '@angular/core';
import * as echarts from 'echarts';
import { SharedDatasetService } from '../shared-datasets.service';
import { ContinousColors, ColorObject } from '../dashboard-constants';
import { end } from '@popperjs/core';


@Component({
    selector: 'draggable-available',
    templateUrl: './AuAvailability.component.html',
    styleUrls: ['./AuAvailability.component.scss']
})

export class AuAvailabilityComponent implements AfterViewInit {

    public options: any = {};
    public myChart: echarts.ECharts = null;
    public selectedElement = [];
    public allSeriesData: number[][] = [];
    public colorCollections: ColorObject[] = ContinousColors;
    public colorRange: ColorObject = this.colorCollections[0];
    // Width observer
    public targetElement: any;
    public bidPriceObserver: any;

    constructor(public sharedDatasetService: SharedDatasetService, private host: ElementRef) {


        this.sharedDatasetService.bucketDetailsBehaviorSubject$
            .subscribe((state) => {
                if (this.myChart) {
                    this.createChartElement();
                }
            })
    }


    updatePosition: () => void;

    // Called from template auto resize chart
    public onChartInit(e): void {

        this.targetElement = this.host.nativeElement.querySelector('#draggable-available');
        // @ts-ignore
        this.bidPriceObserver = new ResizeObserver(entries => {
            if (this.myChart) {
                this.refreshChartVisual();
            }
        });
        this.bidPriceObserver.observe(this.targetElement);
    }


    public ngAfterViewInit(): void {
        this.createSvg('draggable-available')
    }


    // Initialize Chart Node
    public createSvg(type) {

        const chart: HTMLCanvasElement = document.getElementById(type) as HTMLCanvasElement;
        this.myChart = echarts.init(chart, 'light');

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


    public createChartElement = () => {

        const self = this;

        const updatePosition = () => {
            setChartOptions();
        };


        const setChartOptions = function () {

            self.myChart.setOption({
                // title: {
                //     show: true,
                //     left: 0,
                //     top: 5,
                //     textStyle: {
                //         fontSize: 11,
                //         fontWeight: 'bold'
                //     },
                //     text: '            DF       AU       SA     Book'
                // },
                backgroundColor: 'rgba(205,225,245,0.05)',
                grid: {
                    show: false,
                    left: 55,
                    right: 20,
                    top: 55,
                    bottom: 40
                },
                tooltip: {
                    show: true,
                    //triggerOn: 'item',
                    //appendToBody: 'true',
                    //trigger: 'axis',
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 2,
                    borderColor: 'Blue',
                    extraCssText: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);',
                    padding: 5,
                    textStyle: {
                        fontSize: 14,
                        color: '#000'
                    },
                    // axisPointer: {
                    //     // link: { xAxisIndex: 'all' },
                    //     type: 'line',
                    //     snap: true,
                    //     label: {
                    //         backgroundColor: '#6a7985'
                    //     }
                    // },
                    formatter: (params) => {
                        //console.log('params ', params)
                        let tester = `${params.marker}  ${self.sharedDatasetService.bucketDetails[params.dataIndex].letter}<br>Aus: ${self.sharedDatasetService.bucketDetails[params.dataIndex].Aus}<br>Fare: ${self.sharedDatasetService.bucketDetails[params.dataIndex].fare}`;
                        return tester;
                    }
                },
                legend: {
                    show: true,
                    selectedMode: true,
                    textStyle: {
                        fontSize: 13
                    },
                    top: 0,
                    itemWidth: 18,
                    itemHeight: 10,
                    right: 80,
                    data: [
                        {
                            name: 'Seat Availability',
                            icon: 'roundRect'
                        },
                        {
                            name: 'AUs',
                            icon: 'roundRect',
                            itemStyle: {
                                color: 'rgba(241, 255, 135, 0.75)'
                            }
                        },
                        {
                            name: 'Protections',
                            icon: 'roundRect'
                        },
                        {
                            name: 'Bookings',
                            icon: 'roundRect'
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
                        max: self.sharedDatasetService.bucketDetails[0].Aus + 20,
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
                            fontSize: 13,
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

                        axisLabel: {
                            fontSize: 13,
                            fontWeight: 'normal',
                            color: 'green'
                        },

                        inverse: false,
                        position: 'bottom',
                        axisTick: {
                            show: true,
                        },
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            return `${item.bookings}`
                            // return booked;
                        }),
                    },
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
                            return self.sharedDatasetService.bucketDetails[i].Aus;
                        }),
                        itemStyle: {
                            color: (params) => {
                                return 'rgba(255, 245, 66, 0.65)'
                            },
                        },
                        label: {
                            show: true,
                            formatter: (params) => {
                                const auDiff = Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.totalBookingsCollector);
                                return auDiff < self.sharedDatasetService.bucketDetails[params.dataIndex].Aus ? Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].Aus) : ''
                            },
                            color: 'black',
                            fontSize: 10,
                            fontWeight: 'normal',
                            padding: 5,
                            offset: [0, 10],
                            position: 'top',
                        }
                    },
                    {
                        type: 'bar',
                        name: 'Protections',
                        silent: true,
                        barGap: '-100%',
                        z: 6,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            return self.sharedDatasetService.protectionLevel(i);
                        }),

                        itemStyle: {
                            color: 'rgb(12, 63, 185)',
                            opacity: 1,
                            decal: {
                                symbol: 'rect',
                                color: 'rgba(0, 0, 0, 0.12)',
                                dashArrayX: [1, 0],
                                dashArrayY: [4, 4],
                                symbolSize: 1,
                                rotation: Math.PI / 6
                            },
                        },
                        // label: {
                        //     show: true,
                        //     color: 'black',

                        //     shadowBlur: 4,
                        //     shadowOffsetX: 1,
                        //     shadowOffsetY: 1,
                        //     formatter: (params) => {
                        //         if (self.sharedDatasetService.bucketDetails[params.dataIndex].protections !== self.sharedDatasetService.bucketDetails[params.dataIndex].bookings) {
                        //             return self.protectionYValue(params.dataIndex) - self.sharedDatasetService.bucketDetails[params.dataIndex].bookings
                        //         } else {
                        //             return ''
                        //         }
                        //     },
                        //     fontSize: 12,
                        //     fontWeight: 'bold',
                        //     offset: [-45, -15],
                        //     position: 'bottom',
                        // }
                    },
                    {
                        type: 'bar',
                        //stack: 'total',
                        name: 'Bookings',
                        //silent: true,
                        barGap: '-100%',
                        z: 7,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            //console.log('book ', item.bookings)
                            return item.bookings;
                        }),
                        // label: {
                        //     show: true,
                        //     color: 'green',

                        //     shadowBlur: 4,
                        //     shadowOffsetX: 1,
                        //     shadowOffsetY: 1,
                        //     formatter: (params) => {
                        //         // if (self.sharedDatasetService.bucketDetails[params.dataIndex].protections !== self.sharedDatasetService.bucketDetails[params.dataIndex].bookings) {
                        //         return self.sharedDatasetService.bucketDetails[params.dataIndex].bookings
                        //         // } else {
                        //         //     return ''
                        //         //}
                        //     },
                        //     fontSize: 12,
                        //     fontWeight: 'bold',
                        //     offset: [-45, -20],
                        //     position: 'bottom',
                        // },
                        itemStyle: {
                            color: 'rgba(12, 163, 85, 0.75)',
                            decal: {
                                symbol: 'rect',
                                color: 'rgba(0, 0, 0, 0.12)',
                                dashArrayX: [1, 0],
                                dashArrayY: [4, 4],
                                symbolSize: 1,
                                rotation: Math.PI / 6
                            }
                        },
                    },
                    {
                        type: 'bar',
                        stack: 'total',
                        name: 'Seat Availability',
                        showBackground: true,
                        z: 2,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            // console.log('item ', item.Aus - self.sharedDatasetService.totalBookingsCollector > 0 ? item.Aus - self.sharedDatasetService.totalBookingsCollector : 0)
                            return item.Aus - self.sharedDatasetService.totalBookingsCollector > 0 ? item.Aus - self.sharedDatasetService.totalBookingsCollector : 0;
                        }),
                        itemStyle: {
                            color: 'rgba(32, 96, 248, 1)',
                            borderColor: 'transparent',
                            borderWidth: 1,
                            borderType: 'solid',
                            decal: {
                                symbol: 'rect',
                                color: 'rgba(0, 0, 0, 0.2)',
                                dashArrayX: [3, 0],
                                dashArrayY: [4, 2],
                                symbolSize: 1,
                                rotation: Math.PI / 6
                            }
                        },
                        emphasis: {
                            itemStyle: {
                                borderColor: '#000',
                                borderWidth: 1,
                                borderType: 'solid',
                            }
                        },
                        label: {
                            show: true,
                            fontSize: 12,
                            fontWeight: 'normal',
                            formatter: (params) => {
                                let labelString: any;
                                self.sharedDatasetService.bucketDetails.map((bd, i) => {
                                    // console.log('dis ', self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.totalBookingsCollector)
                                    const tom = Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.totalBookingsCollector)
                                    if (self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.totalBookingsCollector > 26) {

                                        labelString = self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.totalBookingsCollector > 0 ?
                                            `${tom}`
                                            : self.sharedDatasetService.bucketDetails[params.dataIndex].fare;

                                    } else {
                                        labelString = ''
                                    }

                                })
                                return `{a|${self.sharedDatasetService.bucketDetails[params.dataIndex].fare}}\n{b|${labelString}}`
                                //return `{ a|${labelString}}`
                            },
                            rich: {
                                a: {
                                    align: 'center',
                                    fontSize: 13,
                                    fontWeight: 'bold',
                                    color: 'white',
                                },
                                b: {
                                    align: 'center',
                                    fontSize: 12,
                                    fontWeight: 'normal',
                                    color: 'white',
                                },
                            },
                            position: 'insideTop',
                            //offset: [0, 0]
                            // offset: self.sharedDatasetService.bucketDetails.map((bd, i) => {
                            //     console.log('lllll ', bd.Aus - self.sharedDatasetService.totalBookingsCollector)
                            //     return bd.Aus - self.sharedDatasetService.totalBookingsCollector > 0 ? [0, -40] : [0, -40]
                            // })
                        }
                    }
                ]
            });

        }


        updatePosition();
        window.addEventListener('resize', updatePosition);
    }


    private getTextColor(idx) {
        return this.sharedDatasetService.bucketDetails[idx].fare;
    }

    private currYAvailValue(idx: number) {
        return this.sharedDatasetService.currAus[idx];
    }

}

