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
                //  console.log('bucketDetailsBehaviorSubject$ ', state, ' this.myChart ', this.myChart)
                if (this.myChart) {
                    setTimeout(() => {
                        this.createChartDraggingElement(true);
                        this.myChart.setOption({
                            series: this.setChartSeries()
                        })
                    }, 0);
                }
            })

        // this.sharedDatasetService.apiFlightClientSubject$
        //     .subscribe(response => {

        //     })

        this.sharedDatasetService.apiActiveBucketsSubject$
            .subscribe(response => {
                //console.log('response ', response)
                if (response.length > 0) {
                    this.createSvg();
                    this.setChartInstance();
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



    // Called from template auto resize chart


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
                barWidth: '80%',
                //stack: 'total',
                z: 6,
                animation: false,
                data: this.sharedDatasetService.nonDiscreteBuckets.map((item, i) => {

                    // item.discrete ? false : true
                    const showLabels: boolean = (item.Aus - item.protections) < 20 ? false : true;
                    // console.log('showLabels ', showLabels, ' --- ', item.Aus - item.protections)
                    const test = item.protections > 0 && !item.discrete ? item.protections : 0;
                    return {
                        value: test,
                        label: {
                            show: showLabels ? true : true,// temp > 0 ? true : false,
                            width: 25,
                            height: 14,
                            backgroundColor: item.protections > 0 ? 'rgba(240,240,240,0.15' : 'rgba(240,240,240,0',
                            formatter: (params) => {
                                let active;
                                const auDiff = Math.round(this.sharedDatasetService.nonDiscreteBuckets[params.dataIndex].protections - this.sharedDatasetService.nonDiscreteBuckets[params.dataIndex].bookings);
                                //console.log('params.dataIndex, letter ', self.sharedDatasetService.nonDiscreteBuckets[params.dataIndex].letter, ' auDiff ', auDiff)
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

            // {
            //     type: 'bar',
            //     name: 'Bookings',
            //     barGap: '-100%',
            //     //stack: 'total',
            //     barWidth: '90%',
            //     z: 8,
            //     animation: false,
            //     data: self.sharedDatasetService.nonDiscreteBuckets.map((item, i) => {
            //         return item.bookings;
            //     }),
            //     itemStyle: {
            //         color: 'rgb(55, 165, 55)',
            //         decal: {
            //             symbol: 'rect',
            //             color: 'rgba(0, 0, 0, 0.12)',
            //             dashArrayX: [1, 0],
            //             dashArrayY: [4, 2],
            //             symbolSize: 1,
            //             rotation: Math.PI / 6
            //         }
            //     },
            // },
            {
                type: 'bar',
                stack: 'total',
                barWidth: '80%',
                name: 'SA',
                showBackground: true,
                backgroundStyle: {
                    color: 'rgba(100, 70, 100, 0.05)'
                },
                z: 2,
                animation: false,

                data: this.sharedDatasetService.nonDiscreteBuckets.map((item, i) => {

                    // console.log('item ', item)
                    const diff = item.Aus - this.sharedDatasetService.totalBookingsCollector;
                    const auValue = item.Aus;
                    const auDiff = Math.round(item.protections - item.bookings);
                    const test = diff > 0 ? Math.round(diff) : '';
                    // console.log('test ', test)
                    return {
                        value: test,
                        label: {

                            show: true,
                            formatter: () => {
                                let fareString = test;
                                return `${fareString}` /// ${active}\n
                            },

                            color: this.themeSelect === 'dark' ? 'white' : 'black',
                            fontSize: 12,
                            fontWeight: 'normal',
                            offset: [0, -10],
                            position: 'top'
                        },
                        itemStyle: {
                            color: this.themeSelect === 'dark' ? this.sharedDatasetService.colorRange[i] : item.discrete ? 'rgba(80,80,80,1)' : blueRamp16[i],
                            //borderColor: 'transparent',
                            //borderWidth: 0,
                            // borderType: 'solid',
                            shadowColor: 'rgba(0,0,0,0.2)',
                            shadowBlur: 3,
                            shadowOffsetX: -2,
                            //shadowOffsetY: -2,
                            decal: {
                                symbol: 'rect',
                                color: !item.discrete ? 'rgba(39, 39, 255, 0.1)' : 'rgba(70,70,70, 0)',
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
        // console.log('Avail mySeries ', mySeries, '\n\n')
        return mySeries
    }


    public setChartInstance = () => {

        console.log('          setChartInstance')

        this.myChart.setOption({

            grid: {
                show: false,
                left: 55,
                right: 20,
                top: 55,
                bottom: 50
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
            // legend: {
            //     show: true,
            //     selectedMode: false,
            //     textStyle: {
            //         fontSize: 13,
            //         //lineHeight: 45,
            //         //height: 33,
            //     },
            //     itemWidth: 30,
            //     itemHeight: 14,
            //     right: 80,
            //     data: [
            //         {
            //             name: 'SA',
            //             icon: 'rect',
            //             itemStyle: {
            //                 color: 'rgb(65, 65, 255)', //'#0000A0',  //rgba(32, 96, 248, 1)
            //                 borderColor: 'transparent',
            //                 borderWidth: 0,
            //                 borderType: 'solid',
            //                 decal: {
            //                     symbol: 'rect',
            //                     color: 'rgba(39, 39, 255, 0.32)',
            //                     dashArrayX: [3, 0],
            //                     dashArrayY: [4, 2],
            //                     symbolSize: 1,
            //                     rotation: Math.PI / 6
            //                 }
            //             }
            //         },
            //         {
            //             name: 'Protections',
            //             icon: 'rect',
            //             itemStyle: {
            //                 color: '#981D97',
            //                 opacity: 1,
            //                 decal: {
            //                     symbol: 'rect',
            //                     color: 'rgba(0, 0, 0, 0.1)',
            //                     dashArrayX: [1, 0],
            //                     dashArrayY: [4, 4],
            //                     symbolSize: 1,
            //                     rotation: Math.PI / 6
            //                 },
            //             }
            //         },
            //         {
            //             name: 'Bookings',
            //             icon: 'rect'
            //         },]
            // },
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
                    max: this.sharedDatasetService.nonDiscreteBuckets[0].Aus + 20,
                    interval: 10,
                    inverse: false,
                    axisLine: {
                        show: true
                    },
                    axisLabel: {
                        fontSize: 12
                    },
                    data: this.sharedDatasetService.nonDiscreteBuckets.map((bp, i) => {
                        return bp.Aus;
                    }),
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
                    data: this.sharedDatasetService.nonDiscreteBuckets.map((item, i) => {
                        return item.letter;
                    }),
                },
            ],

            series: []
        })
    }

    // Re-generates chart elements

    public createChartDraggingElement(redrawChartPoints: boolean): void {

        // console.log('||||||  AU AVAIL createChartDraggingElement ')
        const self = this;


        const updatePosition = () => {
            // console.log('           ||||||  AU AVAIL updatePosition ', redrawChartPoints)
            setChartDragPoints();
        };



        const onPointDragging = function (dataIndex) {

            let yValue = 0;
            let dragPosition: any = [0, 0];
            dragPosition = self.myChart.convertFromPixel({ gridIndex: 0 }, this.position);
            yValue = Math.round(Math.floor(dragPosition[1]));
            if (yValue < 0) { yValue = 0; }
            if (yValue > self.sharedDatasetService.maxAuValue) { yValue = self.sharedDatasetService.maxAuValue }
            self.sharedDatasetService.calculateBidPriceForAu(self.sharedDatasetService.nonDiscreteBuckets[dataIndex].Aus, dataIndex, yValue);
            // self.sharedDatasetService.applyDataChanges();

            updatePosition();

        }



        const setChartDragPoints = function () {

            // console.log(' self.sharedDatasetService.buckets ', self.sharedDatasetService.buckets)
            self.myChart.setOption({

                graphic: echarts.util.map(self.sharedDatasetService.buckets, (item, dataIndex) => {

                    let activeItems = {};

                    const handles = [item, self.sharedDatasetService.nonDiscreteBuckets[dataIndex].Aus];

                    activeItems = {
                        type: 'group',
                        position: self.myChart.convertToPixel('grid', handles),
                        draggable: true,
                        ondrag: echarts.util.curry(onPointDragging, dataIndex),
                        children: [
                            {
                                type: 'circle',
                                z: 101,
                                shape: {
                                    r: 12
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
                                x: -12,
                                y: -12,
                                style: {
                                    text: dataIndex !== 0 ? self.sharedDatasetService.nonDiscreteBuckets[dataIndex].letter : '',
                                    textPosition: 'inside',
                                    padding: 6,
                                    fill: !self.sharedDatasetService.selectedElement.includes(dataIndex) ? 'black' : 'white',
                                    fontSize: '15px',
                                    fontWeight: 'bold'
                                },
                            }
                        ]
                    }
                    if (dataIndex === 0) {
                        activeItems = null
                    }
                    // console.log('activeItems ', activeItems)
                    return activeItems;
                })
            })
        }

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
            console.log('onPointSelect ', dataIndex, ' selectedElement ', self.sharedDatasetService.selectedElement)
            self.sharedDatasetService.multiSelectedNodeSubject$.next(self.sharedDatasetService.selectedElement)
            setChartDragPoints();
        }

        // if (redrawChartPoints) {
        updatePosition();
        // }

    }


    private getTextColor(idx) {
        return this.sharedDatasetService.nonDiscreteBuckets[idx].fare;
    }


}

