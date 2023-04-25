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

export class AuAvailabilityComponent implements AfterViewInit {

    public options: any = {};
    public chart: HTMLCanvasElement;
    public myChart: echarts.ECharts = null;
    public selectedElement = [];
    public allSeriesData: number[][] = [];
    public themeSelect = '';

    public bucketDetails: BucketDetails[] = [];

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
                if (node.length > 0) {
                    this.createChartElement(false);
                } else {
                    // Don't call on start, only on deselect all
                    if (this.myChart) {
                        this.createChartElement(false);
                    }
                }

            })


        this.themeControlService.resetThemeSubject$
            .subscribe((theme: string) => {
                this.themeSelect = theme;
                this.createSvg();
                this.createChartElement(true);
            })



        this.sharedDatasetService.bucketDetailsBehaviorSubject$
            .subscribe((state) => {
                if (this.myChart) {
                    // if (state) {
                    this.createChartElement(true);
                    //}
                }
            })



        /// Deselect all nodes reset chart to default values
        this.sharedDatasetService.resetDefaultSubject$
            .subscribe(response => {
                if (response) {
                    this.createChartElement(true);
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
        this.createChartElement(true);
    }



    // Called from template auto resize chart
    // public onChartInit(e): void { }



    public ngAfterViewInit(): void {
        // console.log('ngAfterViewInit createSvg ')
        this.createSvg();
    }



    // Initialize Chart Node
    public createSvg() {

        if (echarts.init(document.getElementById('draggable-available'))) {
            echarts.init(document.getElementById('draggable-available')).dispose();
        }

        this.chart = document.getElementById('draggable-available') as HTMLCanvasElement;
        this.myChart = echarts.init(this.chart, this.themeSelect);

        setTimeout(() => {
            this.createChartElement(true);
        }, 100);
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



    // Re-generates chart elements

    public createChartElement(redrawChartPoints: boolean): void {

        //console.log('||||||  createChartElement ', redrawChartPoints)
        const self = this;

        const updatePosition = () => {
            // console.log('           updatePosition', redrawChartPoints)
            if (redrawChartPoints) {
                setChartOptions();
            }
            setChartDragPoints();
        };



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


        const onPointDragging = function (dataIndex) {

            let yValue = 0;
            let dragPosition: any = [0, 0];
            dragPosition = self.myChart.convertFromPixel({ gridIndex: 0 }, this.position);

            // console.log('dragPositionY ', dragPositionY)

            yValue = Math.round(Math.floor(dragPosition[1]));
            // console.log('yValue ', dragPosition)
            if (yValue < 0) { yValue = 0; }
            if (yValue > self.sharedDatasetService.maxAuValue) { yValue = self.sharedDatasetService.maxAuValue }

            // console.log('dataIndex ', dataIndex, ' Aus ', self.sharedDatasetService.bucketDetails[dataIndex]);
            self.sharedDatasetService.calculateBidPriceForAu(self.sharedDatasetService.bucketDetails[dataIndex].Aus, dataIndex, yValue);
            self.sharedDatasetService.applyDataChanges();
            updatePosition();

        }



        const setChartDragPoints = function () {

            // console.log(' self.sharedDatasetService.buckets ', self.sharedDatasetService.buckets)
            self.myChart.setOption({
                //self.sharedDatasetService.bucketDetails
                graphic: echarts.util.map(self.sharedDatasetService.buckets, (item, dataIndex) => {

                    let activeItems = {};

                    const handles = [item, self.sharedDatasetService.bucketDetails[dataIndex].Aus];

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
                                    text: dataIndex !== 0 ? self.sharedDatasetService.bucketDetails[dataIndex].letter : '',
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

        const setChartOptions = function () {
            // console.log('           setChartOptions setChartOptions setChartOptions')
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
                        data: self.sharedDatasetService.bucketDetails.map((bp, i) => {
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
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {
                            return item.letter;
                        }),
                    },
                ],

                series: [
                    {
                        type: 'bar',
                        name: 'Protections',
                        silent: true,
                        barGap: '-100%',
                        barWidth: '85%',
                        //stack: 'total',
                        z: 6,
                        animation: false,
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {

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
                                        const auDiff = Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].protections - self.sharedDatasetService.bucketDetails[params.dataIndex].bookings);
                                        //console.log('params.dataIndex, letter ', self.sharedDatasetService.bucketDetails[params.dataIndex].letter, ' auDiff ', auDiff)
                                        active = auDiff > 0 ? auDiff : '' // > self.sharedDatasetService.bucketDetails[params.dataIndex].bookings ? Math.round(self.sharedDatasetService.bucketDetails[params.dataIndex].protections) : '';
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
                                    color: 'rgba(128,128,25,0.4)',
                                    //opacity: 1,
                                    // borderColor: 'black',
                                    // borderWidth: 0,
                                    shadowColor: 'black',
                                    shadowOffsetY: -1,
                                    decal: {
                                        symbol: 'rect',
                                        color: 'rgba(20, 13, 250, 0.23)',
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
                    //     data: self.sharedDatasetService.bucketDetails.map((item, i) => {
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
                        barWidth: '85%',
                        name: 'SA',
                        showBackground: true,
                        backgroundStyle: {
                            color: 'rgba(180, 130, 10, 0.15)'
                        },
                        z: 2,
                        animation: false,
                        //  data: self.sharedDatasetService.bucketDetails.map((item, i) => { 
                        data: self.sharedDatasetService.bucketDetails.map((item, i) => {

                            // console.log('item ', item)
                            const diff = item.Aus - self.sharedDatasetService.totalBookingsCollector;
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

                                    color: self.themeSelect === 'dark' ? 'white' : 'black',
                                    fontSize: 12,
                                    fontWeight: 'normal',
                                    offset: [0, -10],
                                    position: 'top'
                                },
                                itemStyle: {
                                    color: !item.discrete ? self.sharedDatasetService.colorRange[i] : 'rgba(80,80,80,1)',
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
            });
        }

        updatePosition();
    }


    private getTextColor(idx) {
        return this.sharedDatasetService.bucketDetails[idx].fare;
    }


}

