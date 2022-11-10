import { Component, OnInit, ElementRef } from '@angular/core';
import { ContinousColors, ColorObject, ConstraintType, testColors } from '../dashboard-constants';
import * as echarts from 'echarts';
import { Subscription } from 'rxjs'
import { BucketDetails, BidPriceInfluencers } from '../models/dashboard.model';
import { SharedDatasetService } from '../shared-datasets.service';
import { KeyBoardService } from '../keyboard.service';
import { formatHex, interpolate, interpolatorSplineBasis, formatRgb, converter, rgb } from 'culori';

const culori = require('culori')

@Component({
    selector: 'continuous-bid-pricing',
    templateUrl: './continuous-bidpricing-chart.component.html',
    styleUrls: ['./continuous-bidpricing-chart.component.scss'],
})

export class ContinousBidPricingComponent implements OnInit {

    public interpolateCurvePointsFromPieces: any[] = [];
    public adjustedCurvePoints: any[] = [];

    public modifierCollection = [];
    public barSeriesValuesColors: any[] = [];

    public markPointUpdatedPosition: any = [];

    public selectedElement = [];

    public options: any = {};

    public myChart: echarts.ECharts = null;

    public modifierObj = { mult: 1.00, addSub: 0, min: 0, max: 99999 } as BidPriceInfluencers;

    public colorCollections: ColorObject[] = ContinousColors;

    public subscription = new Subscription();

    public colorRange: ColorObject = this.colorCollections[0];

    // Width observer
    public targetElement: any;
    public bidPriceObserver: any;


    constructor(
        public sharedDatasetService: SharedDatasetService,
        public keyBoardService: KeyBoardService, private host: ElementRef) {

        this.genColors(this.sharedDatasetService.bucketDetails.length)

        this.sharedDatasetService.selectedColorRangeBehaviorSubject$
            .subscribe(color => {
                if (color !== this.colorRange) {
                    this.colorRange = color;
                    this.adjustPieceColorForBookingUpdates();
                    this.createChartElement();
                }
            })



        this.sharedDatasetService.bucketDetailsBehaviorSubject$
            .subscribe((state) => {

                if (this.myChart) {

                    //console.log(' $$$$ CONTINUOUS ', buckets, ' state ', state)
                    if (state) {
                        this.adjustPieceColorForBookingUpdates();
                        this.generateInterpolatedCurvePoints();
                    } else {
                        this.adjustPieceColorForBookingUpdates();
                    }
                    this.createChartElement();

                    // console.log('modifierCollection ', this.modifierCollection, '\n mcollect ', this.adjustedCurvePoints)
                    // if (this.modifierCollection.length > 0) {
                    //     this.adjustedCurvePoints = [];
                    //     this.interpolateCurvePointsFromPieces.forEach((ip, i) => {
                    //         //console.log('ip ', ip)
                    //         this.adjustedCurvePoints.push(ip)
                    //     })
                    // }
                }
            })

        this.sharedDatasetService.influenceInput$
            .subscribe(([response, mod, id]) => {
                // console.log('response ', response, ' idx ', mod, ' id ', id)
                if (response !== null) {
                    this.modifierObj[mod] = response;
                    const staticModifierObj = { mult: 1.00, addSub: 0, min: 0, max: 99999 };
                    this.adjustedCurvePoints = [];
                    Object.entries(staticModifierObj).forEach((d: any, i) => {
                        if (staticModifierObj[mod] !== this.modifierObj[mod]) {
                            if (!this.modifierCollection.some(influence => influence.key === mod)) {

                                this.modifierCollection.push({ key: mod, value: this.modifierObj[mod] });
                            } else {
                                const index = this.modifierCollection.findIndex(r => r.key === mod);
                                if (this.modifierCollection[index].value !== response) {
                                    this.modifierCollection[index].value = response;
                                }
                            }
                        } else {
                            this.modifierCollection.splice(this.modifierCollection.findIndex(idx => idx === idx), 1);
                        }

                    });

                    console.log('modifierCollection. ', this.modifierCollection)

                    this.interpolateCurvePointsFromPieces.forEach((ip, i) => {
                        // console.log('ip ', ip)
                        this.adjustedCurvePoints.push(ip)
                    })

                    const staticArray = [...this.adjustedCurvePoints];

                    this.adjustedCurvePoints = this.applyAllInfluences(staticArray, this.modifierCollection);

                    console.log('response ', this.adjustedCurvePoints)

                    //this.adjustPieceRegions();

                    this.adjustPieceColorForBookingUpdates();
                    this.generateInterpolatedCurvePoints();
                    this.createChartElement();
                }
            })

    }

    ngOnInit(): void {
        this.sharedDatasetService.generateBucketValues();

        this.adjustPieceColorForBookingUpdates();
        this.generateInterpolatedCurvePoints();
        //this.adjustPieceRegions();

        setTimeout(() => {
            this.createSvg();
        }, 330);
    }

    public updatePosition: () => void;




    public refreshChartVisual = () => {
        this.createChartElement();
    }



    // Called from template auto resize chart
    public onChartInit(e): void {
        this.targetElement = this.host.nativeElement.querySelector('#continuous-bidpricing');
        // @ts-ignore
        this.bidPriceObserver = new ResizeObserver(entries => {
            if (this.myChart) {
                this.refreshChartVisual();
            }
        });
        this.bidPriceObserver.observe(this.targetElement);
    }



    // Sets up Dom node and attaches myChart element
    public createSvg(): void {
        const chart: HTMLCanvasElement = document.getElementById('continuous-bidpricing') as HTMLCanvasElement;
        this.myChart = echarts.init(chart, 'light');
        this.createChartElement();
    }



    public generateInterpolatedCurvePoints() {

        let stepper = 0;

        // @ts-ignore
        function ranger(from, to, step, prec) {
            if (typeof from == 'number') {
                const A = [from];
                step = typeof step == 'number' ? Math.abs(step) : 1;
                if (!prec) {
                    prec = (from + step) % 1 ? String((from + step) % 1).length + 1 : 0;
                }
                if (from > to) {
                    while (+(from -= step).toFixed(prec) >= to) A.push(+from.toFixed(prec));
                }
                else {
                    while (+(from += step).toFixed(prec) <= to) A.push(+from.toFixed(prec));
                }
                return A;
            }
        }

        let result = []
        let rangeArray = [];

        this.sharedDatasetService.bucketDetails.map((p, i) => {
            // console.log('p ', p, ' bucket ', this.sharedDatasetService.bucketDetails[i])
            if (i === 0) {
                for (let m = 0; m < this.sharedDatasetService.bucketDetails[0].protections; m++) {
                    rangeArray.push(this.sharedDatasetService.bucketDetails[0].fare)

                }
            } else {
                stepper = (this.sharedDatasetService.bucketDetails[i - 1].fare - p.fare) / p.protections;
                rangeArray = ranger(this.sharedDatasetService.bucketDetails[i - 1].fare, p.fare, stepper, 2)
                rangeArray.pop();

            }
            result.push(...rangeArray)
        })

        this.interpolateCurvePointsFromPieces = result;

    }


    public adjustPieceColorForBookingUpdates() {

        this.barSeriesValuesColors = [];
        this.sharedDatasetService.dynamicBidPrices = [];
        let counter = 0;

        this.sharedDatasetService.bucketDetails.map((pc, i) => {
            for (let e = 0; e < pc.protections; e++) {

                this.barSeriesValuesColors.push({ value: pc.fare, barColor: this.setBookingElementsColor(i, counter) })
                counter++
                this.sharedDatasetService.dynamicBidPrices.push(pc.fare)
            }
        })
        // console.log('setBookingElementsColor ', this.barSeriesValuesColors)

    }


    public setBookingElementsColor(value, j) {

        const len = 150 - this.sharedDatasetService.totalBookingsCollector;
        //console.log('setBookingElementsColor value ', value, ' j ', j, ' totalBookingsCollector ', this.sharedDatasetService.totalBookingsCollector)
        let myColor;

        if (this.sharedDatasetService.bucketDetails[value].bookings === 0) {
            myColor = this.colorRange.value[value];
        } else {
            myColor = j <= len ? this.colorRange.value[value] : 'green';
            //console.log('setBookingElementsColor myColor ', j, ' len ', len)
        }

        return myColor
    }



    public genColors(numClasses) {
        function adjustHue(val) {
            if (val < 0) val += Math.ceil(-val / 360) * 360;
            return val % 360;
        }

        function map(n, start1, end1, start2, end2) {
            return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
        }

        function createHueShiftPalette(opts) {

            const { base, minLightness, maxLightness, hueStep } = opts;

            const palette = [base];
            const test = numClasses / 2;
            for (let i = 1; i < test; i++) {
                const hueDark = adjustHue(base.h - hueStep * i);
                const hueLight = adjustHue(base.h + hueStep * i);
                const lightnessDark = map(i, 0, 4, base.l, minLightness);
                const lightnessLight = map(i, 0, 4, base.l, maxLightness);
                const chroma = base.c;

                palette.push({
                    l: lightnessDark,
                    c: chroma,
                    h: hueDark,
                    mode: "lch"
                });

                palette.unshift({
                    l: lightnessLight,
                    c: chroma,
                    h: hueLight,
                    mode: "lch"
                });
            }
            // console.log('palette ', palette)
            return palette;
        }


        const hueShiftPalette = createHueShiftPalette({
            base: {
                l: 45,
                c: 95,
                h: 0,
                mode: "lch"
            },
            minLightness: 35,
            maxLightness: 65,
            hueStep: 9
        });

        const hueShiftPaletteHex = hueShiftPalette.map((color) => formatHex(color));
        this.colorRange.value = hueShiftPaletteHex
        //console.log('hueShiftPaletteHex ', hueShiftPaletteHex)
    }

    public selectBars(index) {

        // console.log(' selectedElement ', this.selectedElement)

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

    }


    // Re-generates chart elements
    public createChartElement(): void {
        const self = this;

        const updatePosition = () => {
            setChartInstance();
            setTimeout(() => {
                setChartDragPoints()
            }, 100);
        };

        const selectModifier = (dataIndex) => {
            self.selectedElement = dataIndex;
            setChartDragPoints();
        };


        const onPointDragging = function (dataIndex) {

            let yValue = 0;
            let dragPosition: any = [0, 0];
            const test = dataIndex + 1;
            dragPosition = self.myChart.convertFromPixel({ gridIndex: 0 }, this.position);
            yValue = self.sharedDatasetService.maxAuValue - Math.round(Math.floor(dragPosition[0]));
            //console.log('dragPosition ', yValue, ' dataIndex ', test, ' Letter ', self.sharedDatasetService.bucketDetails[test].letter)
            if (yValue < 1) { yValue = 1; }
            if (yValue > self.sharedDatasetService.maxAuValue) { yValue = self.sharedDatasetService.maxAuValue }

            self.sharedDatasetService.calculateBidPriceForAu(self.sharedDatasetService.currAus[test], test, yValue);
            self.sharedDatasetService.applyDataChanges();
            self.sharedDatasetService.generateBucketValues();
            updatePosition();
        }


        const setChartDragPoints = function () {

            const symbolSize = 24;
            let placeTemp = 0;
            self.myChart.setOption({

                graphic: echarts.util.map(self.sharedDatasetService.bucketDetails, (item, dataIndex) => {
                    const xPlace = placeTemp += item.protections
                    const dragPoint = 0
                    let doesInclude = self.selectedElement.includes(dataIndex) ? true : false;
                    const scaleHandles = dataIndex === self.sharedDatasetService.bucketDetails.length - 1 ? [] : [xPlace, dragPoint]
                    const fillColor = doesInclude ? 'red' : 'white';
                    const strokeColor = dataIndex === self.sharedDatasetService.bucketDetails.length - 1 ? 'transparent' : doesInclude ? 'Blue' : 'Blue';
                    const lineWidth = doesInclude ? 2 : 1;

                    return {
                        type: 'circle',
                        position: self.myChart.convertToPixel('grid', scaleHandles),
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
                        onclick: echarts.util.curry(selectElement, dataIndex),
                        z: 100
                    };
                })
            })
        }

        const selectElement = (dataIndex) => {
            // console.log('selectElement ', dataIndex)
            self.selectBars(dataIndex)
            setChartDragPoints();
        };

        const setChartInstance = () => {

            let incr = 0;

            self.myChart.setOption({
                grid: {
                    show: false,
                    left: 40,
                    right: 30,
                    top: 40,
                    bottom: 40
                },
                backgroundColor: 'rgba(205,225,245,0.05)',

                xAxis: {
                    silent: true,
                    inverse: false,
                    type: 'category',
                    boundaryGap: 0,
                    nameGap: 43,
                    axisLine: {
                        onZero: true,
                        linestyle: {
                            color: 'black',
                        }
                    },
                    axisTick: {
                        alignWithLabel: true,
                        length: 13,
                        minorTick: {
                            show: true
                        }
                    },
                    showGrid: false,
                    axisLabel: {
                        color: 'black',
                        interval: 1,
                        margin: 15,
                        hideOverlap: true,
                        align: 'middle',
                        fontSize: 10,
                        showMinLabel: true,
                        showMaxLabel: true
                    },
                    data: self.sharedDatasetService.dynamicBidPrices.map((bp, i) => {
                        return self.sharedDatasetService.dynamicBidPrices.length - i
                    }),
                },

                tooltip: {
                    show: true,
                    trigger: 'axis',
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 2,
                    borderColor: 'Blue',
                    extraCssText: 'box-shadow: 0 2px 4px rgba(0, 0, 0, 0.45);',
                    padding: 5,
                    textStyle: {
                        fontSize: 14,
                        color: '#000'
                    },
                    axisPointer: {
                        link: { xAxisIndex: 'all' },
                        type: 'cross',
                        snap: true,
                        label: {
                            backgroundColor: '#6a7985'
                        }
                    },
                    formatter: (params) => {
                        // console.log('params ', params)
                        let test = ''
                        if (params[3]) {
                            test = `${params[3].marker}Influenced: ${params[3].data}<br>`
                        }
                        return `${test}${params[2].marker}Modified: ${params[2].data}<br>${params[1].marker}Base: ${params[1].data}`
                    }
                },

                yAxis: {
                    silent: true,
                    type: 'value',
                    showGrid: false,
                    interval: 20,
                    scale: false,
                    boundaryGap: [0, '1%'],
                    splitLine: {
                        show: false
                    },
                    axisLine: {
                        show: true,
                        onZero: false
                    }
                },

                series: [
                    {
                        type: 'bar',
                        animation: false,
                        animationDuration: 1,
                        showBackground: true,
                        colorBy: 'series',
                        silent: true,
                        z: 1,
                        data: self.barSeriesValuesColors.map((serie, i) => {
                            return {
                                value: serie.value,
                                itemStyle: {
                                    normal: {
                                        color: serie.barColor
                                    },
                                    // emphasis: {
                                    //     color: '#0000fd'
                                    // }
                                }
                            }
                        }),
                        markLine: self.markVerticalLineSellingValues(),

                        markArea: {
                            silent: true,
                            itemStyle: {
                                borderColor: 'white',
                                borderWidth: 1
                            },
                            label: {
                                show: true,
                                backgroundColor: 'white',
                                padding: [3, 5, 0, 3],
                                fontSize: 13,
                                fontWeight: 'bold',
                                color: '#001871',
                                position: 'insideTop',
                                offset: [0, -25],
                            },

                            data: self.sharedDatasetService.currAus.map((item, i) => {

                                if (self.sharedDatasetService.currAus[i + 1]) {
                                    incr += self.sharedDatasetService.currAus[i] - self.sharedDatasetService.currAus[i + 1]
                                    //console.log(' currAus ', incr, ' item ', item, ' currAus ', self.sharedDatasetService.currAus[i])
                                } else {
                                    incr += self.sharedDatasetService.currAus[i];
                                }

                                return [{
                                    name: self.sharedDatasetService.bucketDetails[i].letter,
                                    xAxis: self.sharedDatasetService.currAus[0] - item,
                                }, {
                                    itemStyle: {
                                        borderColor: 'rgba(100,100,100,0.5)',
                                        borderWidth: 1,
                                        color: 'rgba(0,0,100,0)'
                                    },
                                    xAxis: incr
                                }];

                            })
                        },

                    },
                    {
                        id: 'e',
                        type: 'line',
                        //animation: true,
                        silent: true,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 10,
                        itemStyle: {
                            borderColor: 'red',
                            borderWidth: 1,
                            color: 'red'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: 'red',
                            width: 0
                        },
                        data: self.sharedDatasetService.dynamicBidPrices,
                    },
                    {
                        id: 'd',
                        type: 'line',
                        animation: false,
                        silent: true,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 10,
                        z: 2,
                        itemStyle: {
                            borderColor: 'blue',
                            borderWidth: 1,
                            color: 'blue'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: 'blue',
                            width: 4
                        },
                        data: self.interpolateCurvePointsFromPieces,
                        markPoint: self.markPointUpdatedPosition
                    },
                    {
                        id: 'c',
                        type: 'line',
                        //animation: true,
                        silent: true,
                        showSymbol: false,
                        selectedMode: false,
                        symbolSize: 10,
                        itemStyle: {
                            borderColor: 'green',
                            borderWidth: 1,
                            color: 'green'
                        },
                        lineStyle: {
                            type: 'solid',
                            color: 'green',
                            width: 3
                        },
                        data: self.adjustedCurvePoints,
                    },

                ]
            })
        }
        updatePosition();
    }


    public markPoint(position: any, color, label): any {
        return {
            clickable: false,
            animation: false,
            data: [
                {
                    coord: position,
                    symbol: 'circle',
                    symbolSize: 22,
                    itemStyle: {
                        color: color,
                    },
                    label: {
                        show: true,
                        offset: [0, 1],
                        formatter: () => {
                            return '{a|' + label + '}';
                        },
                        rich: {
                            a: {
                                align: 'center',
                                fontSize: 12,
                                color: 'white'
                            },
                        },
                    }
                }
            ]
        };
    }


    public findMatchingBucketForBidPrice(bidPrice: number): BucketDetails {

        let currData: BucketDetails = null;
        for (const bucketInfo of this.sharedDatasetService.bucketDetails) {
            const fareValue = bucketInfo.fare;
            if (fareValue < bidPrice) {
                currData = bucketInfo;
                //console.log('fareValue ', fareValue, ' bidPrice ', bidPrice, ' currData ', currData)
                break;
            }
        }
        //console.log('letter ', currData.letter, ' currData ', currData.fare)
        return currData;
    }



    // Places lines vertically with labels on top of chart signifying fare call regions
    private markVerticalLineSellingValues() {
        //console.log('markVerticalLineSellingValues ', this.sharedDatasetService.totalBookingsCollector)
        let sellingPoint = 149 - this.sharedDatasetService.totalBookingsCollector;

        if (sellingPoint < 0) {
            sellingPoint = 0;
        }

        const activeCurve = this.interpolateCurvePointsFromPieces;
        const baseCurve = this.sharedDatasetService.dynamicBidPrices;
        const sellingValues = this.findMatchingBucketForBidPrice(activeCurve[sellingPoint]);

        if (this.sharedDatasetService.totalBookingsCollector > 0) {
            const rounded = Math.round(activeCurve[sellingPoint])
            const fareClass = `Selling: ${rounded}`

            this.markPointUpdatedPosition = this.markPoint([sellingPoint, this.interpolateCurvePointsFromPieces[sellingPoint]], 'green', sellingValues.letter)

            // Vertical Active Class/Value Selling Line
            return {
                name: 'current',
                id: 'clicked',
                clickable: false,
                animation: false,
                silent: true,
                lineStyle: {
                    type: 'dashed',
                    color: '#001871',
                    width: 2,
                },
                label: {
                    name: 'testLabel',
                    id: 'clickedLabel',
                    position: 'end',
                    show: true,
                    distance: [0, -80],
                    formatter: () => {
                        return `{a|${fareClass}\nBase: ${baseCurve[sellingPoint]}}`
                    },
                    rich: {
                        a: {
                            align: 'center',
                            padding: [3, 0, 2, 0],
                            width: 100,
                            fontSize: 14,
                            fontWeight: 'normal',
                            borderColor: 'Green',
                            backgroundColor: 'Green',
                            borderWidth: 3,
                            borderRadius: 3,
                            color: 'white',
                        },
                    },
                },
                data: [
                    {
                        xAxis: sellingPoint
                    },
                    {
                        symbol: 'diamond',
                        symbolSize: 6,
                        yAxis: activeCurve[sellingPoint],

                        label: {
                            show: false,
                            name: 'testLabel',
                            id: 'test',
                            position: 'end',
                            distance: [-50, 0],
                            fontSize: 11,
                            borderRadius: 2,
                            color: '#e7e7e7',
                            padding: [4, 6, 2, 8],
                            borderColor: 'navy',
                            backgroundColor: 'navy',
                            borderWidth: 0
                        }
                    }]
            }
        } else {
            return {}
        }
    }




    public applyAllInfluences(bpVector: number[], args: any[]): number[] {


        const applyMultiplication = (bpVector, multiplier: any): number[] => {
            return bpVector.map((bp, i) => {
                const num = Number(multiplier)
                return bp * num > 0 ? Math.round(bp * num) : bp;
            })
        };


        const applyAddSubtract = (bpVector, difference: number): number[] => {
            return bpVector.map((bp, i) => {
                return bp + difference > 0 ? bp + difference : 0;
            })
        };


        const applyMinimum = (bpVector, minimum: number): number[] => {
            return bpVector.map(bp => {
                return bp > 0 && bp < minimum ? minimum : bp;
            })
        }


        const applyMaximum = (bpVector, maximum: number): number[] => {
            return bpVector.map(bp => {
                return bp > 0 && bp < maximum ? bp : maximum;
            })
        }


        let aggregate = [];

        aggregate = args.map((arg, i) => {

            if (arg.key === ConstraintType.Multiply) {
                bpVector = applyMultiplication(bpVector, arg.value);
            }

            if (arg.key === ConstraintType.AddSubtract) {
                bpVector = applyAddSubtract(bpVector, arg.value)
            }

            if (arg.key === ConstraintType.Minimum) {
                bpVector = applyMinimum(bpVector, arg.value)
            }

            if (arg.key === ConstraintType.Maximum) {
                bpVector = applyMaximum(bpVector, arg.value)
            }

            return bpVector;
        })

        //this.updateBidPriceChartFunction();
        return aggregate[aggregate.length - 1];

    }
}
