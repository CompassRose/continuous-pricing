import { Component, Input, AfterViewInit, HostListener } from '@angular/core';
import * as echarts from 'echarts';
import { BidPriceCalcsService } from '../services/au-visualization-calcs-service';
import { SharedDatasetService } from '../services/shared-datasets.service';
import { ThemeControlService } from '../services/theme-control.service';
import { blueRamp16 } from '../dashboard-constants';
import { BucketDetails } from '../models/dashboard.model';

@Component({
    selector: 'draggable-available',
    templateUrl: './au-availability.component.html',
    styleUrls: ['./au-availability.component.scss']
})

export class AuAvailabilityComponent {

    public options: any = {};
    public chart: HTMLCanvasElement;
    public myChart: echarts.ECharts = null;
    public selectedElement = [];
    public allSeriesData: number[][] = [];
    public themeSelect = '';



    // @Input()
    // gridPointsDeSelected(state: boolean) {
    //     console.log('XXXXXXXXXXXXXXXX  gridPointsDeSelected createChartElement ', state)
    //     if (this.sharedDatasetService.selectedElement.length > 0) {
    //         // this.sharedDatasetService.selectedElement = [];
    //         // this.sharedDatasetService.setGroupingMethod(0);
    //         this.createChartElement(true);
    //     }
    // }


    @Input()
    set collapseInfluences(state: boolean) {

        if (this.myChart) {
            this.myChart.resize();
            this.refreshChartVisual();
        }
    }


    constructor(public sharedDatasetService: SharedDatasetService,
        public themeControlService: ThemeControlService,
        public bidPriceCalcsService: BidPriceCalcsService) {

        this.themeSelect = JSON.parse(window.localStorage.getItem('colorTheme'));

        //  console.log('AuAvailabilityComponent tempSavedCollection ', this.themeSelect)

        // If chart drag nodes are selected
        this.sharedDatasetService.multiSelectedNodeSubject$
            .subscribe((node) => {

                if (this.myChart) {
                    this.createChartDraggingElement(true);
                    this.myChart.setOption({
                        series: this.setChartSeries()
                    })
                }
            })

        // this.sharedDatasetService.apiFlightActiveSubject$
        //     .subscribe((response) => {

        //         if (response) {
        //             console.log('Availability apiFlightActiveSubject$  apiFlightActiveSubject$ apiFlightActiveSubject$ ', response)

        //             this.createSvg();
        //             this.setChartInstance();
        //             this.createChartDraggingElement(true);
        //             this.myChart.setOption({
        //                 series: this.setChartSeries()
        //             })
        //         }
        //     })

        this.sharedDatasetService.colorRangeSelection$
            .subscribe(range => {
                if (range && this.myChart) {
                    console.log('range ', range)

                    this.createChartDraggingElement(true);
                    this.myChart.setOption({
                        series: this.setChartSeries()
                    })
                }
            })

        this.themeControlService.resetThemeSubject$
            .subscribe((theme: string) => {
                console.log('resetThemeSubject createChartDraggingElement ')
                this.themeSelect = theme;
                this.createSvg();
                this.setChartInstance();
                this.createChartDraggingElement(true);
                this.myChart.setOption({
                    series: this.setChartSeries()
                })
            })



        this.sharedDatasetService.bucketDetailsBehaviorSubject$
            .subscribe((state) => {

                if (this.myChart) {
                    setTimeout(() => {
                        // console.log('bucketDetailsBehaviorSubject$ ', state, ' this.myChart ', this.myChart)
                        this.createChartDraggingElement(true);
                        this.myChart.setOption({
                            series: this.setChartSeries()
                        })
                    }, 0);
                }
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


        /// Deselect all nodes reset chart to default values
        this.sharedDatasetService.resetDefaultSubject$
            .subscribe(response => {
                if (response) {
                    this.createChartDraggingElement(true);

                    this.myChart.setOption({
                        series: this.setChartSeries()
                    })
                }
            })
    }



    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if (this.myChart) {
            this.myChart.resize();
            this.refreshChartVisual();
        }
    }

    public refreshChartVisual = () => {
        this.myChart.resize();
        this.createChartDraggingElement(true);
    }




    // Initialize Chart Node
    public createSvg() {

        if (echarts.init(document.getElementById('draggable-available'))) {
            echarts.init(document.getElementById('draggable-available')).dispose();
        }

        this.chart = document.getElementById('draggable-available') as HTMLCanvasElement;
        this.myChart = echarts.init(this.chart, this.themeSelect);

        setTimeout(() => {
            this.createChartDraggingElement(true);
        }, 100);
    }



    public setChartSeries(): any {

        let mySeries = [
            {
                type: 'bar',
                name: 'Protections',
                silent: true,
                barGap: '-100%',
                barWidth: '70%',
                //stack: 'total',
                z: 6,
                animation: false,
                data: this.sharedDatasetService.nonDiscreteBuckets.map((item, i) => {
                    const showLabels: boolean = (item.Aus - item.protections) < 20 ? false : true;
                    const test = item.protections > 0 && !item.discrete ? item.protections : 0;
                    return {
                        value: test,
                        label: {
                            show: false,
                            width: 25,
                            height: 14,
                            backgroundColor: item.protections > 0 ? 'rgba(240,240,240,0.15' : 'rgba(240,240,240,0',
                            formatter: (params) => {
                                let active;
                                const auDiff = Math.round(this.sharedDatasetService.nonDiscreteBuckets[params.dataIndex].protections - this.sharedDatasetService.nonDiscreteBuckets[params.dataIndex].bookings);
                                active = auDiff > 0 ? auDiff : '' // > self.sharedDatasetService.nonDiscreteBuckets[params.dataIndex].bookings ? Math.round(self.sharedDatasetService.nonDiscreteBuckets[params.dataIndex].protections) : '';
                                return active;
                            },
                            color: 'black',
                            fontSize: 12,
                            fontWeight: 'bold',
                            textBorderWidth: 0,
                            textBorderColor: 'black',
                            //offset: [0, showLabels ? 4 : 10],
                            offset: [0, 4],
                            position: showLabels ? 'top' : 'insideTop',
                        },

                        itemStyle: {
                            color: '#981D97',
                            //opacity: 1,
                            // borderColor: 'black',
                            // borderWidth: 0,
                            shadowColor: 'rgba(60, 13, 250, 0.73)',
                            shadowOffsetY: -1,
                            decal: {
                                symbol: 'rect',
                                color: 'rgba(20, 13, 250, 0.03)',
                                dashArrayX: [1, 0],
                                dashArrayY: [4, 2],
                                symbolSize: 1,
                                rotation: Math.PI / 6
                            },
                        }
                    }
                })
            },

            {
                type: 'bar',
                name: 'Bookings',
                barGap: '-100%',
                //stack: 'total',
                barWidth: '70%',
                z: 8,
                animation: false,
                data: this.sharedDatasetService.nonDiscreteBuckets.map((item, i) => {
                    return item.bookings;
                }),
                itemStyle: {
                    color: 'rgba(240, 0, 0, 1)',
                },
            },
            // 
            {
                type: 'bar',
                stack: 'total',
                barWidth: '70%',
                name: 'SA',
                showBackground: true,
                backgroundStyle: {
                    color: 'rgba(100, 70, 100, 0.05)'
                },
                z: 2,
                animation: false,

                data: this.sharedDatasetService.bucketDetails.map((item, i) => {
                    const diff = item.Aus - this.sharedDatasetService.totalBookingsCollector;
                    const auElement = diff > 0 ? Math.round(diff) : '';

                    // const fareString = `${auElement}<br>${Math.round(item.protections - item.bookings)}`
                    const showProtections = !item.discrete ? item.protections : '';
                    return {
                        value: auElement,
                        label: {
                            show: true,
                            formatter: () => {
                                return `{a|${auElement}}\n{b|${showProtections}}`;
                            },
                            lineHeight: 20,
                            rich: {
                                a: {
                                    align: 'center',
                                    fontSize: 12,
                                    padding: [0, 0, -12, 0],
                                    fontWeight: 'normal',
                                    color: this.themeSelect === 'dark' ? 'white' : 'black',
                                },
                                b: {
                                    align: 'center',
                                    padding: [0, 0, 0, 0],
                                    fontSize: 13,
                                    fontWeight: 'bold',
                                    color: 'rgb(205, 40, 165)',
                                },
                            },
                            offset: item.discrete ? [0, 14] : i === 0 ? [0, 6] : [0, -2],
                            position: 'top'
                        },
                        itemStyle: {
                            color: this.themeSelect === 'dark' ? this.sharedDatasetService.colorRange[i] : item.discrete ? 'rgba(80,80,80,1)' : blueRamp16[i],
                            shadowColor: 'rgba(0,0,0,0.2)',
                            shadowBlur: 3,
                            shadowOffsetX: -2,
                            decal: {
                                symbol: 'rect',
                                color: !item.discrete ? 'rgba(39, 39, 255, 0.1)' : 'rgba(70,70,70, 0.25)',
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
                    }
                }),
            }]
        return mySeries;
    }


    public setChartInstance = () => {

        this.myChart.setOption({

            grid: {
                show: false,
                left: 55,
                right: 20,
                top: 25,
                bottom: 45
            },
            tooltip: {
                show: false,
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
                    const calc = this.sharedDatasetService.nonDiscreteBuckets[params.dataIndex].Aus - this.sharedDatasetService.totalBookingsCollector;
                    const saValue = calc > 0 ? `<br>Sa: ${calc}` : ``;
                    return `Class: ${this.sharedDatasetService.nonDiscreteBuckets[params.dataIndex].letter}<br>Fare: ${this.sharedDatasetService.nonDiscreteBuckets[params.dataIndex].fare}<br>Aus: ${this.sharedDatasetService.nonDiscreteBuckets[params.dataIndex].Aus}${saValue}`;
                }
            },
            legend: {
                show: false,
                selectedMode: false,
                textStyle: {
                    fontSize: 13
                },
                itemWidth: 30,
                itemHeight: 14,
                right: 80,
                data: [
                    {
                        name: 'SA',
                        icon: 'rect',
                        itemStyle: {
                            color: 'rgb(65, 65, 255)',
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
                            color: '#981D97',
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
                    name: 'Seats',
                    position: 'left',
                    id: 0,
                    nameLocation: 'middle',
                    nameRotate: 90,
                    nameGap: 35,
                    nameTextStyle: {
                        fontSize: 14,
                        fontWeight: 'normal'
                    },
                    max: this.sharedDatasetService.bucketDetails[0].Aus + 20,
                    interval: 10,
                    inverse: false,
                    axisLine: {
                        show: true
                    },
                    axisLabel: {
                        fontSize: 10
                    },
                    data: this.sharedDatasetService.bucketDetails.map((bp, i) => {
                        return bp.Aus;
                    }),
                }],
            xAxis: [
                {
                    show: false,
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
                    data: this.sharedDatasetService.bucketDetails.map((item, i) => {
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
                        fontSize: 13,
                        fontWeight: 'normal'
                    },

                    inverse: false,
                    position: 'bottom',
                    axisTick: {
                        show: true,
                    },

                    data: this.sharedDatasetService.bucketDetails.map((item, i) => {

                        let booksValue = `${item.bookings}`;
                        return {
                            value: booksValue,
                            textStyle: {
                                color: 'rgb(255, 5, 5)',
                                fontSize: 13,
                                fontWeight: 'bold',

                            }
                        }

                    }),
                }
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



        const onPointDragging = function (dataIndex, pos) {

            let yValue = 0;
            let dragPosition: any = [0, 0];
            dragPosition = self.myChart.convertFromPixel('grid', pos);
            yValue = Math.round(dragPosition[1]);

            if (yValue <= 0) { yValue = 0; }
            if (yValue > self.sharedDatasetService.maxAuValue) {
                yValue = self.sharedDatasetService.maxAuValue
            }
            if (dataIndex >= self.sharedDatasetService.nonDiscreteBuckets.length) {
                self.sharedDatasetService.bucketDetails[dataIndex].Aus = yValue;
                //console.log('>>>>> dataIndex ', dataIndex, ' bucketDetails ', self.sharedDatasetService.bucketDetails[dataIndex])
                self.sharedDatasetService.applyDataChanges()
            } else {
                //console.log('>>>>> yValue ', yValue)
                self.sharedDatasetService.calculateBidPriceForAu(dataIndex, yValue, self.sharedDatasetService.dragDirection);
            }
        }



        const setChartDragPoints = function () {
            self.myChart.setOption({
                graphic: echarts.util.map(self.sharedDatasetService.bucketDetails, (item, dataIndex) => {
                    let activeItems = {};
                    const handles = [item.letter, item.Aus];
                    activeItems = {
                        type: 'group',
                        position: self.myChart.convertToPixel({ gridIndex: 0 }, handles),
                        draggable: true,
                        ondrag: function (dx, dy) {

                            if (self.sharedDatasetService.selectedElement.length < 2) {

                                if (dx.target.x > self.sharedDatasetService.lastDataIndex) {
                                    self.sharedDatasetService.dragDirection = 'up';
                                } else {
                                    self.sharedDatasetService.dragDirection = 'down';
                                }
                            }
                            onPointDragging(dataIndex, [0, this.y]);
                        },
                        children: [
                            {
                                type: 'circle',
                                z: 101,
                                cursor: 'move',
                                shape: {
                                    r: 10
                                },
                                style: {
                                    fill: !self.sharedDatasetService.selectedElement.includes(dataIndex) ? 'rgba(255,255,255,1)' : 'red',
                                    stroke: dataIndex > 0 ? 'black' : 'trnsparent',
                                    shadowBlur: 10,
                                    shadowOffsetX: -1,
                                    shadowOffsetY: -1,
                                    shadowColor: dataIndex > 0 ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0)',
                                },
                            },
                            {
                                type: 'text',
                                z: 102,
                                x: -4,
                                y: -6,
                                cursor: 'move',
                                style: {
                                    text: dataIndex !== 0 ? item.letter : '',
                                    textPosition: 'inside',
                                    fill: !self.sharedDatasetService.selectedElement.includes(dataIndex) ? 'black' : 'white',
                                    fontSize: '13px',
                                    fontWeight: 'bold'
                                },
                            }
                        ]
                    }
                    if (dataIndex === 0) {
                        activeItems = null
                    }
                    return activeItems;
                })
            })
        }


        //  console.log('AU SAupdatePosition ', redrawChartPoints)
        if (redrawChartPoints) {
            updatePosition();
        }

    }


    private getTextColor(idx) {
        return this.sharedDatasetService.nonDiscreteBuckets[idx].fare;
    }


}

