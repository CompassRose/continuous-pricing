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
            .subscribe(([buckets, state]) => {
                if (this.myChart) {
                    this.sharedDatasetService.totalProtections = this.sharedDatasetService.generateBookingCounts('protections');
                    this.sharedDatasetService.totalBookingsCollector = this.sharedDatasetService.generateBookingCounts('bookings');
                    // console.log('dataIndex ', this.sharedDatasetService.totalBookingsCollector)
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
            // setTimeout(() => {
            //     setChartDragPoints();
            // }, 100);
        };




        const onPointDragging = function (dataIndex) {

            let yValue = 0;
            let dragPosition: any = [0, 0];

            dragPosition = self.myChart.convertFromPixel({ gridIndex: 0 }, this.position);
            yValue = Math.round(Math.floor(dragPosition[0]));

            if (yValue < 1) { yValue = 1; }
            if (yValue > self.sharedDatasetService.maxAuValue) { yValue = self.sharedDatasetService.maxAuValue }

            //console.log('AVAIL  dragPosition ', dragPosition, ' Letter ', self.sharedDatasetService.bucketDetails[dataIndex].letter)
            self.sharedDatasetService.calculateBidPriceForAu(self.sharedDatasetService.currAus[dataIndex], dataIndex, yValue);

            self.sharedDatasetService.applyDataChanges();
            self.sharedDatasetService.generateBucketValues();
            updatePosition();

        }



        const setChartDragPoints = function () {

            const symbolSize = 32;

            self.myChart.setOption({

                graphic: echarts.util.map(self.sharedDatasetService.bucketDetails, (item, dataIndex) => {
                    // console.log('setChartDragPoints ', item.protections, ' bookings ', item.bookings)

                    const handles = (item.bookings < item.protections) ? [item.Aus, item.letter] : [];
                    const scaleHandles = [item.Aus, item.letter]
                    let doesInclude = self.selectedElement.includes(dataIndex) ? true : false;

                    const fillColor = doesInclude ? 'Red' : 'white';
                    const strokeColor = 'Blue';
                    const lineWidth = doesInclude ? 4 : 2;

                    return {
                        type: 'circle',
                        position: self.myChart.convertToPixel('grid', scaleHandles),
                        shape: {
                            cx: 0,
                            cy: 2,
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

                        //},
                        //onmouseover: echarts.util.curry(selectElement, dataIndex),
                        onclick: echarts.util.curry(selectElement, dataIndex),
                        // onmouseover: function (ev) {
                        //     console.log('onmouseover onmouseover ', ev)
                        //     // showTooltip(dataIndex);
                        // },
                        // onmouseout: function () {
                        //     //hideTooltip(dataIndex);
                        // },
                        z: 100
                    };
                })
            })
        }

        const selectElement = (dataIndex) => {
            //console.log('selectElement ', dataIndex)
            self.selectBars(dataIndex)
            //setChartDragPoints();
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
                    text: '             DF       AU      SA         LF       Book'
                },
                backgroundColor: 'rgba(205,225,245,0.05)',
                grid: {
                    show: false,
                    left: 265,
                    right: 0,
                    top: 20,
                    bottom: 10
                },
                legend: {
                    show: true,
                    selectedMode: true,
                    textStyle: {
                        fontSize: 13
                    },
                    top: -5,
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
                            name: 'Bookings',
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
                // tooltip: {
                //     trigger: 'item',
                //     //triggerOn: 'none',
                //     formatter: function (params) {
                //         console.log('params ', params)
                //         return (
                //             'X: ' +
                //             params.value +
                //             '<br>Y: ' +
                //             params.name
                //         );
                //     }
                // },
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
                    data: self.sharedDatasetService.bucketDetails.map((val, i) => {
                        return val.letter;
                    }), axisLabel: {
                        formatter: (params, i) => {
                            const bookings = self.sharedDatasetService.bucketDetails[i].bookings;
                            const letter = self.sharedDatasetService.bucketDetails[i].letter;
                            const fare = self.sharedDatasetService.bucketDetails[i].fare;
                            const sa = self.sharedDatasetService.bucketDetails[i].Sa;
                            const au = self.sharedDatasetService.bucketDetails[i].Aus;
                            const loadFactor = (self.sharedDatasetService.bucketDetails[i].bookings / self.sharedDatasetService.bucketDetails[i].protections) * 100;
                            return '{f|' + letter + '}{a|' + fare + '}{h|' + au + '}{d|' + sa + '}{l|' + loadFactor.toFixed(0) + '%' + '}{i|' + bookings + '}';
                        },
                        margin: 20,
                        verticalAlign: 'middle',
                        rich: {
                            f: {
                                align: 'center',
                                width: 40,
                                fontSize: 13,
                                padding: [7, 0, 6, 0],
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
                                fontSize: 13,
                                padding: [7, 0, 6, 0],
                            },
                            d: {
                                borderColor: 'rgba(0,0,0,0.2)',
                                backgroundColor: 'rgba(255,255,255,1)',
                                borderWidth: 1,
                                align: 'center',
                                width: 40,
                                fontSize: 13,
                                color: 'black',
                                padding: [7, 0, 6, 0],
                            },
                            l: {
                                borderColor: 'rgba(0,0,0,0.2)',
                                backgroundColor: 'rgba(255,255,255,1)',
                                borderWidth: 1,
                                align: 'center',
                                width: 50,
                                fontSize: 13,
                                color: '#313F4A',
                                padding: [7, 0, 6, 0],
                            },
                            h: {
                                borderColor: 'rgba(0,0,0,0.2)',
                                backgroundColor: 'rgba(255,255,255,1)',
                                borderWidth: 1,
                                align: 'center',
                                width: 35,
                                fontSize: 13,
                                color: '#313F4A',
                                padding: [7, 0, 6, 0],
                            },
                            i: {
                                borderColor: 'Blue',
                                backgroundColor: 'rgba(255,255,255,1)',
                                borderWidth: 2,
                                align: 'center',
                                fontWeight: 'bold',
                                width: 35,
                                fontSize: 13,
                                color: 'black',
                                padding: [7, 0, 6, 0],
                            },
                        },
                    },
                },

                series: [
                    {
                        type: 'line',
                        name: 'AU Line',
                        showSymbol: false,
                        symbolSize: 0,
                        data: self.sharedDatasetService.currAus.map((item, i) => {
                            return self.currYAvailValue(i);
                        }),

                        itemStyle: {
                            color: 'blue',
                            borderColor: '#001871',
                            borderWidth: 0
                        },
                        lineStyle: {
                            width: 0
                        }
                    },
                    // {
                    //     type: 'bar',
                    //     barGap: '-100%',
                    //     //barWidth: 0,
                    //     showBackground: false,
                    //     roundCap: true,
                    //     name: 'Seat Availability',
                    //     z: 9,
                    //     animation: false,
                    //     data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                    //         return item.Sa;
                    //     }),
                    //     itemStyle: {
                    //         normal: {
                    //             color: '#fae529',
                    //             opacity: 1
                    //         }
                    //     },
                    //     label: {
                    //         show: false,
                    //         formatter: (params) => {
                    //             return self.sharedDatasetService.bucketDetails[params.dataIndex].Aus - self.sharedDatasetService.bucketDetails[params.dataIndex].Sa > 10 ? self.sharedDatasetService.bucketDetails[params.dataIndex].Sa : ''
                    //         },
                    //         color: 'Yellow',
                    //         fontSize: 11,
                    //         fontWeight: 'bold',
                    //         offset: [10, 10],
                    //         position: 'insideRight',
                    //     }
                    // },
                    // {
                    //     type: 'bar',
                    //     showBackground: false,
                    //     name: 'Bookings',
                    //     barWidth: 26,
                    //     z: 8,
                    //     animation: false,
                    //     data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                    //         return item.bookings > 0 ? item.bookings : 0;
                    //     }),

                    //     itemStyle: {
                    //         color: 'Blue',
                    //         shadowColor: 'Purple',
                    //         shadowOffsetX: 0,
                    //         shadowOffsetY: 0,
                    //         shadowBlur: 2,
                    //         opacity: 1
                    //     },
                    //     // label: {
                    //     //     show: false,
                    //     //     formatter: (params) => {
                    //     //         if (self.sharedDatasetService.bucketDetails[params.dataIndex].bookings > 0) {
                    //     //             return self.sharedDatasetService.bucketDetails[params.dataIndex].bookings
                    //     //         } else {
                    //     //             return ''
                    //     //         }
                    //     //     },
                    //     //     //z: 12,
                    //     //     //fontSize: 12,
                    //     //     //rotate: -90,
                    //     //     //fontWeight: 'bold',
                    //     //     //position: 'insideRight',
                    //     //     //offset: [5, 13]
                    //     // }
                    // },
                    {
                        type: 'bar',
                        stack: 'total',
                        name: 'Protections',
                        //barWidth: 26,
                        barGap: '-100%',
                        z: 6,
                        animation: false,
                        data: self.sharedDatasetService.currAus.map((item, i) => {
                            return self.protectionYValue(i) > 0 ? self.protectionYValue(i) - self.sharedDatasetService.bucketDetails[i].bookings : 0;
                        }),

                        itemStyle: {
                            color: 'rgba(0,10,190,0.63',
                            shadowColor: 'Purple',
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            shadowBlur: 2,
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
                            offset: [26, 2],
                            position: 'insideRight',
                        }
                    },

                    {
                        type: 'bar',
                        stack: 'total',
                        name: 'AUs',
                        //barWidth: 30,
                        showBackground: true,
                        //selectedMode: 'multiple',
                        //roundCap: true,
                        z: 1,
                        animation: false,
                        data: self.sharedDatasetService.currAus.map((item, i) => {
                            return item - self.protectionYValue(i)
                        }),
                        itemStyle: {
                            color: (params) => {
                                return 'Purple'
                                //return self.colorRange.value[0];

                            },
                            decal: {
                                symbol: 'rect',
                                color: 'rgba(0, 0, 0, 0.32)',
                                dashArrayX: [1, 0],
                                dashArrayY: [4, 4],
                                symbolSize: 1,
                                rotation: Math.PI / 6
                            }
                        },
                        // itemStyle: {
                        //     color: '#7B46E3',
                        //     shadowColor: 'Purple',
                        //     shadowOffsetX: 0,
                        //     shadowOffsetY: 0,
                        //     shadowBlur: 2,
                        //     opacity: 1,
                        //     borderColor: 'yellow',
                        //     borderWidth: 0,
                        //     borderStyle: 'solid',
                        //     decal: {
                        //         symbol: 'rect',
                        //         color: 'rgba(0, 0, 0, 0.12)',
                        //         dashArrayX: [1, 0],
                        //         dashArrayY: [4, 4],
                        //         symbolSize: 1,
                        //         rotation: Math.PI / 6
                        //     }
                        // },
                        select: {
                            itemStyle: {
                                borderWidth: 3,
                                borderColor: 'red',
                            }
                        },
                        label: {
                            show: true,
                            formatter: (params) => {
                                const labelValues = `${self.sharedDatasetService.currAus[params.dataIndex]}   ${self.sharedDatasetService.bucketDetails[params.dataIndex].fare}`
                                return '{a|' + labelValues + '}';
                            },
                            rich: {
                                a: {
                                    color: 'black',
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    padding: [10, 5, 0, 5]
                                },
                            },
                            position: 'right',
                            offset: [2, -4]
                        }
                    }
                ]
            });

            // window.addEventListener('keyup', (event: any) => {
            //     if (event.isComposing) {
            //         return;
            //     }
            //     event.stopImmediatePropagation();
            //     console.log('keyup keyup ', event)
            //     //logKey(event.key);
            // });

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

