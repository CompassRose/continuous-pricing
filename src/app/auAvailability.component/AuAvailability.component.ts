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
                    //this.sharedDatasetService.totalProtections = this.sharedDatasetService.generateBookingCounts('protections');
                    // this.sharedDatasetService.totalBookingsCollector = this.sharedDatasetService.generateBookingCounts('bookings');
                    //console.log('dataIndex ', this.sharedDatasetService.totalBookingsCollector)
                    this.sharedDatasetService.totalLoadFactor = ((this.sharedDatasetService.totalBookingsCollector / this.sharedDatasetService.totalProtections) * 100).toFixed(0);
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
        this.sharedDatasetService.applyDataChanges();

        this.createSvg('draggable-available')
    }


    // Initialize Chart Node
    public createSvg(type) {

        const chart: HTMLCanvasElement = document.getElementById(type) as HTMLCanvasElement;
        this.myChart = echarts.init(chart, 'light');

        setTimeout(() => {
            this.sharedDatasetService.maxAuValue = this.sharedDatasetService.getMaxAu();
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
                title: {
                    show: true,
                    left: 0,
                    top: 5,
                    textStyle: {
                        fontSize: 11,
                        fontWeight: 'bold'
                    },
                    text: '            DF       AU       SA     Book'
                },
                backgroundColor: 'rgba(205,225,245,0.05)',
                grid: {
                    show: false,
                    left: 205,
                    right: 10,
                    top: 20,
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
                            name: 'Protections',
                            icon: 'roundRect'
                        },
                        {
                            name: 'AUs',
                            icon: 'roundRect'
                        },
                        {
                            name: 'Seat Availability',
                            icon: 'roundRect'
                        }]
                },
                xAxis: {
                    type: 'value',
                    min: 0,
                    max(value) {
                        return value.max + 20;
                    },
                    inverse: false,
                    axisLine: {
                        show: false
                    },
                    axisLabel: {
                        fontSize: 0
                    },
                },
                yAxis:
                {
                    show: true,
                    type: 'category',
                    boundaryGap: true,
                    inverse: true,
                    position: 'left',
                    axisTick: {
                        show: true,
                    },
                    axisLine: {
                        show: true,
                        onZero: false,
                    },
                    // data: self.sharedDatasetService.bucketDetails.map((val, i) => {
                    //     return val.letter;
                    // }), 
                    axisLabel: {
                        formatter: (params, i) => {
                            const bookings = self.sharedDatasetService.bucketDetails[i].bookings;
                            const letter = self.sharedDatasetService.bucketDetails[i].letter;
                            const fare = self.sharedDatasetService.bucketDetails[i].fare;
                            const sa = self.sharedDatasetService.bucketDetails[i].Sa;
                            const au = self.sharedDatasetService.bucketDetails[i].Aus;
                            // const loadFactor = (self.sharedDatasetService.bucketDetails[i].bookings / self.sharedDatasetService.bucketDetails[i].protections) * 100;
                            return '{f|' + letter + '}{a|' + fare + '}{h|' + au + '}{d|' + sa + '}{i|' + bookings + '}';
                        },
                        margin: 20,
                        verticalAlign: 'middle',
                        rich: {
                            f: {
                                align: 'center',
                                width: 30,
                                fontSize: 12,
                                padding: [4, 0, 4, 0],
                                borderColor: 'rgba(0,0,0,0.2)',
                                backgroundColor: 'rgba(255,255,255,1)',
                                borderWidth: 1,
                                fontWeight: 'bold',
                                color: 'black',
                            },
                            a: {
                                color: 'black',
                                borderColor: 'rgba(0,0,0,0.2)',
                                backgroundColor: 'rgba(255,255,255,1)',
                                borderWidth: 1,
                                align: 'center',
                                width: 40,
                                fontSize: 12,
                                padding: [4, 0, 4, 0],
                            },
                            d: {
                                borderColor: 'rgba(0,0,0,0.2)',
                                backgroundColor: 'rgba(255,255,255,1)',
                                borderWidth: 1,
                                align: 'center',
                                width: 40,
                                fontSize: 12,
                                color: 'black',
                                padding: [4, 0, 4, 0],
                            },
                            l: {
                                borderColor: 'rgba(0,0,0,0.2)',
                                backgroundColor: 'rgba(255,255,255,1)',
                                borderWidth: 1,
                                align: 'center',
                                width: 50,
                                fontSize: 12,
                                color: '#313F4A',
                                padding: [4, 0, 4, 0],
                            },
                            h: {
                                borderColor: 'rgba(0,0,0,0.2)',
                                backgroundColor: 'rgba(255,255,255,1)',
                                borderWidth: 1,
                                align: 'center',
                                width: 35,
                                fontSize: 12,
                                color: '#313F4A',
                                padding: [4, 0, 4, 0],
                            },
                            i: {
                                borderColor: 'rgba(0,0,0,0.2)',
                                backgroundColor: 'rgba(255,255,255,1)',
                                borderWidth: 2,
                                align: 'center',
                                //fontWeight: 'bold',
                                width: 35,
                                fontSize: 12,
                                color: '#313F4A',
                                padding: [4, 0, 4, 0],
                            },
                        },
                    },
                },

                series: [
                    {
                        type: 'bar',
                        barGap: '-100%',
                        barWidth: 6,
                        showBackground: false,
                        roundCap: true,
                        name: 'Seat Availability',
                        z: 9,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            return item.Sa;
                        }),
                        itemStyle: {
                            normal: {
                                color: 'rgb(0,218,90)',
                                opacity: 1
                            }
                        },
                        label: {
                            show: true,
                            formatter: (params) => {
                                return self.sharedDatasetService.bucketDetails[params.dataIndex].Sa
                            },
                            color: 'white',
                            fontSize: 11,
                            fontWeight: 'bold',
                            offset: [-10, 10],
                            position: 'insideRight',
                        }
                    },
                    {
                        type: 'bar',
                        stack: 'total',
                        name: 'Protections',
                        silent: true,
                        barGap: '-100%',
                        z: 6,
                        animation: false,
                        data: self.sharedDatasetService.currAus.map((item, i) => {
                            return self.protectionYValue(i) > 0 ? self.protectionYValue(i) - self.sharedDatasetService.bucketDetails[i].bookings : 0;
                        }),

                        itemStyle: {
                            color: 'rgb(12, 63, 185)',
                            shadowColor: 'Purple',
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
                            show: false,
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
                            offset: [26, 2],
                            position: 'insideRight',
                        }
                    },

                    {
                        type: 'bar',
                        stack: 'total',
                        name: 'AUs',
                        barWidth: 20,
                        showBackground: true,
                        z: 1,
                        animation: false,
                        data: self.sharedDatasetService.currAus.map((item, i) => {
                            return item - self.protectionYValue(i)
                        }),
                        itemStyle: {
                            color: (params) => {
                                return 'rgb(92, 136, 248)'
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
                            formatter: (params) => {
                                const labelValues = `${self.sharedDatasetService.currAus[params.dataIndex]} ${self.sharedDatasetService.bucketDetails[params.dataIndex].fare}`
                                return '{a|' + labelValues + '}';
                            },
                            rich: {
                                a: {
                                    color: 'black',
                                    fontSize: 10,
                                    fontWeight: 'bold',
                                    padding: [10, 3, 0, 3]
                                },
                            },
                            position: 'right',
                            offset: [0, -4]
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

