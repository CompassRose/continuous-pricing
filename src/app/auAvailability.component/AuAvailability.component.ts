import { Component, ElementRef, AfterViewInit } from '@angular/core';
import * as echarts from 'echarts';
import { SharedDatasetService } from '../shared-datasets.service';
import { ContinousColors, ColorObject } from '../dashboard-constants';
import { end } from '@popperjs/core';
import { ThemeControlService } from '../theme-control.service';


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
    public themeSelect = 'light';

    constructor(public sharedDatasetService: SharedDatasetService, public themeControlService: ThemeControlService, private host: ElementRef) {

        this.themeControlService.resetThemeSubject$
            .subscribe((theme: string) => {
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
        this.createSvg()
    }


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


    public createChartElement = () => {

        const self = this;

        const updatePosition = () => {
            setChartOptions();
        };


        const setChartOptions = function () {

            self.myChart.setOption({
                // backgroundColor: 'rgba(205,225,245,0.05)',
                grid: {
                    show: false,
                    left: 55,
                    right: 20,
                    top: 55,
                    bottom: 40
                },
                tooltip: {
                    show: true,
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1,
                    borderColor: 'Blue',
                    extraCssText: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);',
                    padding: [5, 10],
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
                                color: 'rgba(155, 145, 156, 0.35)'
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
                            fontWeight: 'normal'
                        },

                        axisLabel: {
                            fontSize: 13,
                            fontWeight: 'bold',
                            color: 'rgba(12, 163, 85, 1)',
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
                                return 'rgba(155, 145, 156, 0.35)'
                            },
                        },
                        label: {
                            show: true,
                            formatter: (params) => {
                                // console.log('params ', params, ' BD ', self.sharedDatasetService.bucketDetails[params.dataIndex])
                                let active;

                                if (self.sharedDatasetService.bucketDetails[params.dataIndex]) {
                                    const auDiff = Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.totalBookingsCollector);
                                    active = auDiff < self.sharedDatasetService.bucketDetails[params.dataIndex].Aus ? Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].Aus) : '';
                                }
                                return active;
                            },
                            color: 'black',
                            fontSize: 10,
                            fontWeight: 'normal',
                            padding: 5,
                            offset: [0, -5],
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
                            return item.protections;
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
                    },
                    {
                        type: 'bar',
                        name: 'Bookings',
                        barGap: '-100%',
                        z: 7,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            return item.bookings;
                        }),
                        itemStyle: {
                            color: 'rgba(12, 163, 85, 1)',
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
                        backgroundStyle: {
                            color: 'rgba(180, 130, 10, 0.05)'
                        },
                        z: 2,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            return item.Aus - self.sharedDatasetService.totalBookingsCollector > 0 ? item.Aus - self.sharedDatasetService.totalBookingsCollector : '';
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
                                let fareString = '';
                                self.sharedDatasetService.bucketDetails.map((bd, i) => {

                                    //  console.log('bd ', bd)
                                    if (self.sharedDatasetService.bucketDetails[params.dataIndex]) {
                                        const netAus = Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.totalBookingsCollector)

                                        // 26 is so numbers don't overlap TODO
                                        if (self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.totalBookingsCollector > 26) {

                                            labelString = self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.totalBookingsCollector > 0 ?
                                                `${netAus}` : self.sharedDatasetService.bucketDetails[params.dataIndex].fare;
                                            fareString = `${self.sharedDatasetService.bucketDetails[params.dataIndex].fare}`
                                        } else {
                                            labelString = ''
                                        }
                                    }

                                })

                                return `{a|${fareString}}\n{b|${labelString}}`
                            },
                            rich: {
                                a: {
                                    align: 'center',
                                    fontSize: 12,
                                    padding: [-3, 0],
                                    fontWeight: 'normal',
                                    color: self.themeControlService.chartTextColor,
                                },
                                b: {
                                    align: 'center',
                                    fontSize: 12,
                                    padding: [9, 0],
                                    fontWeight: 'normal',
                                    color: 'white',
                                },
                            },
                            position: 'insideTop',
                            offset: [0, -17]
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

