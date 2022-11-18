import { Component, ElementRef, AfterViewInit } from '@angular/core';
import * as echarts from 'echarts';
import { SharedDatasetService } from '../shared-datasets.service';
import { ContinousColors, ColorObject } from '../dashboard-constants';


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

                    this.sharedDatasetService.bucketDetails.forEach((bd, i) => {
                        //console.log('  i ', i, ' protections ', this.sharedDatasetService.bucketDetails[i])
                    })


                    //this.sharedDatasetService.totalProtections = this.sharedDatasetService.generateBookingCounts('protections');
                    // this.sharedDatasetService.totalBookingsCollector = this.sharedDatasetService.generateBookingCounts('bookings');
                    //console.log('dataIndex ', this.sharedDatasetService.totalBookingsCollector)
                    // this.sharedDatasetService.totalLoadFactor = ((this.sharedDatasetService.totalBookingsCollector / this.sharedDatasetService.totalProtections) * 100).toFixed(0);
                    this.createChartElement();
                }
            })

        this.sharedDatasetService.selectedColorRangeBehaviorSubject$
            .subscribe(color => {
                this.colorRange = color;
                if (this.myChart) {
                    this.createChartElement();
                }
                //console.log('Avail selectedColorRangeBehaviorSubject this.colorRange ', this.colorRange)
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
        }, 200);

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
                    left: 35,
                    right: 10,
                    top: 25,
                    bottom: 30
                },
                legend: {
                    show: true,
                    selectedMode: true,
                    textStyle: {
                        fontSize: 13
                    },
                    top: 0,
                    itemWidth: 18,
                    itemHeight: 12,
                    right: 80,
                    data: [
                        {
                            name: 'AUs',
                            icon: 'roundRect'
                        },
                        {
                            name: 'Seat Availability',
                            icon: 'roundRect'
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
                yAxis: {
                    type: 'value',
                    min: 0,
                    max(value) {
                        return value.max + 40;
                    },
                    inverse: false,
                    axisLine: {
                        show: false
                    },
                    axisLabel: {
                        fontSize: 10
                    },
                },
                xAxis:
                {
                    show: true,
                    type: 'category',
                    boundaryGap: true,
                    scale: false,
                    inverse: false,
                    position: 'left',
                    axisTick: {
                        show: true,
                    },
                    axisLine: {
                        show: true,
                        onZero: false,
                    }
                },

                series: [
                    {
                        type: 'bar',
                        barGap: '-100%',
                        //barWidth: 3,
                        showBackground: false,
                        roundCap: true,
                        name: 'Seat Availability',
                        z: 5,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            // console.log('item ', item)
                            return item.Sa - item.protections;
                        }),
                        itemStyle: {
                            color: (params) => {
                                return 'rgba(72, 116, 228, 1)'
                                //return self.colorRange.value[0];
                            },
                            decal: {
                                symbol: 'rect',
                                color: 'rgba(0, 0, 0, 0.2)',
                                dashArrayX: [3, 0],
                                dashArrayY: [4, 2],
                                symbolSize: 1,
                                rotation: Math.PI / 6
                            }
                        },
                        label: {
                            show: true,
                            formatter: (params) => {
                                return Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].Sa)
                            },
                            color: 'white',
                            fontSize: 10,
                            fontWeight: 'normal',
                            offset: [0, 26],
                            position: 'top',
                        }
                    },
                    {
                        type: 'bar',
                        // stack: 'total',
                        name: 'Protections',
                        silent: true,
                        barGap: '-100%',
                        z: 6,
                        animation: false,
                        data: self.sharedDatasetService.currAus.map((item, i) => {
                            return self.protectionYValue(i);
                        }),

                        itemStyle: {
                            color: 'rgb(12, 63, 185)',
                            //shadowColor: 'Purple',
                            opacity: 1,
                            decal: {
                                symbol: 'rect',
                                color: 'rgba(0, 0, 0, 0.12)',
                                dashArrayX: [1, 0],
                                dashArrayY: [4, 4],
                                symbolSize: 1,
                                rotation: Math.PI / 6
                            }
                        },

                        label: {
                            show: true,
                            color: 'white',
                            formatter: (params) => {
                                if (self.protectionYValue(params.dataIndex) > 0 && self.protectionYValue(params.dataIndex) !== self.sharedDatasetService.bucketDetails[params.dataIndex].bookings) {
                                    return self.protectionYValue(params.dataIndex) - self.sharedDatasetService.bucketDetails[params.dataIndex].bookings
                                } else {
                                    return ''
                                }
                            },
                            fontSize: 11,
                            fontWeight: 'bold',
                            offset: [0, 18],
                            position: 'top',
                        }
                    },
                    {
                        type: 'bar',
                        //stack: 'total',
                        name: 'Bookings',
                        silent: true,
                        barGap: '-100%',
                        z: 7,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            return item.bookings;
                        }),

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
                        name: 'AUs',
                        //barWidth: 13,
                        showBackground: true,
                        z: 1,
                        animation: false,

                        data: self.sharedDatasetService.currAus.map((item, i) => {
                            return item - self.protectionYValue(i);
                        }),

                        itemStyle: {
                            color: (params) => {
                                return 'rgba(92, 136, 248, 1)'
                                //return self.colorRange.value[0];
                            },
                            decal: {
                                symbol: 'rect',
                                color: 'rgba(0, 0, 0, 0.2)',
                                dashArrayX: [3, 0],
                                dashArrayY: [4, 2],
                                symbolSize: 1,
                                rotation: Math.PI / 6
                            }
                        },
                        select: {
                            itemStyle: {
                                borderWidth: 3,
                                borderColor: 'red',
                            }
                        },
                        label: {
                            show: true,
                            fontSize: 12,
                            fontWeight: 'bold',
                            formatter: (params) => {
                                const labelValues = `${Math.round(self.sharedDatasetService.currAus[params.dataIndex])}\n${Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].fare)}`
                                return labelValues;
                            },
                            // rich: {
                            //     a: {
                            //         color: 'black',
                            //         fontSize: 10,
                            //         fontWeight: 'bold',
                            //         padding: [10, 3, 0, 3]
                            //     },
                            // },
                            position: 'top',
                            //offset: [0, -4]
                        }
                    }
                ]
            });

        }


        updatePosition();
        window.addEventListener('resize', updatePosition);
    }

    public protectionYValue(idx: number) {
        return this.sharedDatasetService.protectionLevel(idx);
    }

    private getTextColor(idx) {
        return this.sharedDatasetService.bucketDetails[idx].fare;
    }

    private currYAvailValue(idx: number) {
        return this.sharedDatasetService.currAus[idx];
    }

}

