import { Component, Input, AfterViewInit, HostListener } from '@angular/core';
import * as echarts from 'echarts';
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
    public totalBuckets: any[] = [];


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
        public themeControlService: ThemeControlService) {

        this.themeSelect = JSON.parse(window.localStorage.getItem('colorTheme'));

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

        this.sharedDatasetService.colorRangeSelection$
            .subscribe(range => {
                if (range && this.myChart) {
                    this.createChartDraggingElement(true);
                    this.myChart.setOption({
                        series: this.setChartSeries()
                    })
                }
            })

        this.themeControlService.resetThemeSubject$
            .subscribe((theme: string) => {
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


    //
    // Called by Host on window resize
    //

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



    //
    // Delete if present and then Initialize Chart Node
    //
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



    //
    // Sets up three chart series, AU, Protections and SA. SetOption() in calling function
    //

    public setChartSeries(): any {

        let mySeries = [
            {
                type: 'bar',
                name: 'Protections',
                silent: true,
                barGap: '-100%',
                barWidth: '70%',
                z: 6,
                animation: false,
                data: this.totalBuckets.map((item, i) => {
                    const showLabels: boolean = (item.adjustedAu - item.protections) < 20 ? false : true;
                    const test = item.protections > 0 && !item.isDiscrete ? item.protections : 0;
                    return {
                        value: test,
                        label: {
                            show: false,
                            width: 25,
                            height: 14,
                            backgroundColor: item.protections > 0 ? 'rgba(240,240,240,0.15' : 'rgba(240,240,240,0',
                            formatter: (params) => {
                                let active;
                                const auDiff = Math.round(this.sharedDatasetService.bucketDetailsFromApi[params.dataIndex].protections - this.sharedDatasetService.bucketDetailsFromApi[params.dataIndex].bk);
                                active = auDiff > 0 ? auDiff : '' // > self.sharedDatasetService.bucketDetailsFromApi[params.dataIndex].bookings ? Math.round(self.sharedDatasetService.bucketDetailsFromApi[params.dataIndex].protections) : '';
                                return active;
                            },
                            color: 'black',
                            fontSize: 12,
                            fontWeight: 'bold',
                            textBorderWidth: 0,
                            textBorderColor: 'black',
                            offset: [0, 4],
                            position: showLabels ? 'top' : 'insideTop',
                        },

                        itemStyle: {
                            color: '#981D97',
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
                barWidth: '70%',
                z: 8,
                animation: false,
                data: this.totalBuckets.map((item, i) => {
                    return item.bk;
                }),
                itemStyle: {
                    color: 'rgba(0, 160, 30, 1)',
                    shadowColor: 'rgba(0,0,0,0.7)',
                    shadowBlur: 3,
                    shadowOffsetX: -2,
                    decal: {
                        symbol: 'rect',
                        color: 'rgba(39, 39, 255, 0.1)',
                        dashArrayX: [3, 0],
                        dashArrayY: [4, 2],
                        symbolSize: 1,
                        rotation: Math.PI / 6
                    }
                },
            },

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

                data: this.totalBuckets.map((item, i) => {
                    const diff = item.adjustedAu - this.sharedDatasetService.totalBookingsCollector;
                    const auElement = diff > 0 ? Math.round(diff) : '';
                    const showProtections = !item.isDiscrete ? item.protections : '';

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
                                    fontSize: 12,
                                    fontWeight: 'bold',
                                    color: 'rgb(205, 40, 165)',
                                },
                            },
                            offset: item.isDiscrete ? [0, 14] : i === 0 ? [0, 6] : [0, -2],
                            position: 'top'
                        },

                        itemStyle: {
                            color: item.isDiscrete ? '#656F77' : this.themeSelect === 'dark' ? this.sharedDatasetService.colorRange[i] : blueRamp16[i],
                            shadowColor: 'rgba(0,0,0,0.2)',
                            shadowBlur: 3,
                            shadowOffsetX: -2,
                            decal: {
                                symbol: 'rect',
                                color: !item.isDiscrete ? 'rgba(39, 39, 255, 0.1)' : 'rgba(70,70,70, 0.25)',
                                dashArrayX: [3, 0],
                                dashArrayY: [4, 2],
                                symbolSize: 1,
                                rotation: Math.PI / 6
                            }
                        },
                        // emphasis: {
                        //     itemStyle: {
                        //         borderColor: '#000',
                        //         borderWidth: 1,
                        //         borderType: 'solid',
                        //     }
                        // },
                    }
                }),
            }]
        return mySeries;
    }


    public setChartInstance = () => {
        this.totalBuckets = [...this.sharedDatasetService.bucketDetailsFromApi, ...this.sharedDatasetService.discreteBucketsFromApi]
        this.myChart.setOption({

            grid: {
                show: false,
                left: 55,
                right: 20,
                top: 25,
                bottom: 25
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
                    const calc = this.sharedDatasetService.bucketDetailsFromApi[params.dataIndex].adjustedAu - this.sharedDatasetService.totalBookingsCollector;
                    const saValue = calc > 0 ? `<br>Sa: ${calc}` : ``;
                    return `Class: ${this.sharedDatasetService.bucketDetailsFromApi[params.dataIndex].letter}<br>Fare: ${this.sharedDatasetService.bucketDetailsFromApi[params.dataIndex].fare}<br>Aus: ${this.sharedDatasetService.bucketDetailsFromApi[params.dataIndex].adjustedAu}${saValue}`;
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
                        color: 'white',
                        fontSize: 11,
                        fontWeight: 'normal'
                    },
                    max: this.sharedDatasetService.bucketDetailsFromApi[0].adjustedAu + 20,
                    interval: 10,
                    inverse: false,
                    axisLine: {
                        show: true
                    },
                    axisLabel: {
                        fontSize: 9
                    },
                    data: this.sharedDatasetService.bucketDetailsFromApi.map((bp, i) => {
                        return bp.adjustedAu;
                    }),
                }],
            xAxis: [
                {
                    show: false,
                    type: 'category',
                    axisLabel: {
                        fontSize: 11,
                        fontWeight: 'normal',
                    },
                    inverse: false,
                    position: 'top',
                    axisTick: {
                        show: true,
                    },
                    data: this.totalBuckets.map((item, i) => {
                        return item.letter;
                    }),
                },
                {
                    show: true,
                    type: 'category',
                    name: '',
                    nameLocation: 'middle',
                    //nameGap: 25,
                    nameTextStyle: {
                        color: 'rgb(0,200,0)',
                        fontSize: 11,
                        fontWeight: 'normal'
                    },

                    inverse: false,
                    position: 'bottom',
                    axisTick: {
                        show: true,
                    },

                    data: this.totalBuckets.map((item, i) => {

                        let booksValue = `${item.bk}`;
                        return {
                            value: booksValue,
                            textStyle: {
                                color: 'rgba(0, 200, 30, 1)',
                                fontSize: 12,
                                fontWeight: 'normal',
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
            if (dataIndex >= self.sharedDatasetService.currAus.length) {
                self.totalBuckets[dataIndex].adjustedAu = yValue;
                setTimeout(() => {
                    self.sharedDatasetService.bucketDetailsBehaviorSubject$.next(true);
                }, 0);
            } else {
                self.sharedDatasetService.calculateBidPriceForAu(dataIndex, yValue, self.sharedDatasetService.dragDirection);
            }
        }



        const setChartDragPoints = function () {
            self.myChart.setOption({
                graphic: echarts.util.map(self.totalBuckets, (item, dataIndex) => {
                    let activeItems = {};
                    const handles = [item.letter, item.adjustedAu];
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
        if (redrawChartPoints) {
            updatePosition();
        }
    }

}

