import { Injectable } from '@angular/core';
import { formatHex } from 'culori';


const culori = require('culori')

@Injectable({
    providedIn: 'root',
})

export class ColorManagerService {

    public greenToBlue = [
        '#a2feb4',
        '#89feb1',
        '#70fdb5',
        '#58fdc0',
        '#3ffcd3',
        '#27fbec',
        '#0ee9fa',
        '#05b8ea',
        '#0586d1',
        '#045cb8',
        '#0439a0',
        '#031d87',
        '#03086e'
    ]
    public orangeToPurple = [
        '#ffb400',
        '#fc8204',
        '#f95207',
        '#f6250b',
        '#f30f22',
        '#f01251',
        '#ed167e',
        '#ea19a8',
        '#e71dcf',
        '#d520e5',
        '#ad24e2',
        '#8828df',
        '#652bdc'
    ]

    public pinkFoam = [
        '#54bebe',
        '#4aa9c2',
        '#408ec6',
        '#356dca',
        '#2e48cc',
        '#2e27cc',
        '#4c21cc',
        '#6c1acc',
        '#8f15cc',
        '#b40fcb',
        '#cb0abb',
        '#c90590',
        '#c80064',
    ]
    public yellowToBlueHSL = [
        '#ffff86',
        '#ddfd6f',
        '#b2f959',
        '#7ef544',
        '#44f02f',
        '#1cea34',
        '#18d558',
        '#19ba74',
        '#19a184',
        '#188788',
        '#175b70',
        '#143a59',
        '#112143'
    ]


    public hexColorCollection = [
        '#ffff2b',
        '#2bffff',
        '#8040ff',
        '#ffff80',
        '#ff00ff',
        '#80ff80',
        '#ffffff',
        '#00a4f2',
        '#ffff28',
        '#28ffff',
        '#8040ff',
        '#ffff80',
        '#ff00ff',
        '#80ffff',
        '#2b2bff',
        '#ff6c6c',
        '#ffff80',
        '#40ffff',
        '#9d6fff',
        '#ffff80',
        '#ffeafe',
        '#98ff00',
        '#9b4eff',
        '#00ca65',
        '#ff11ff',
        '#acff80',
        '#ffffff',
        '#00a9fb',
        '#ff007e',
        '#bbffb7',
        '#00b7ff',
        '#7a7a7a',
        '#000000',
        '#000000'
    ];



    public airRmColors = [
        'rgb(255,0,0)',
        'rgb(255,108,108)',
        'rgb(255,128,64)',
        'rgb(255,157,111)',
        'rgb(255,255,128)',
        'rgb(217,255,72)',
        'rgb(0,155,78)',
        'rgb(0.202,101)',
        'rgb(17,255,72)',
        'rgb(128,255,255)',
        'rgb(0,169,201)',
        'rgb(0,126,187)',
        'rgb(183,0,183)'
    ];

    public allColorRanges = [
        { id: 0, name: 'AirRm', value: this.airRmColors },
        { id: 1, name: 'Yellow to Blue', value: this.yellowToBlueHSL },
        { id: 2, name: 'Blue to Red', value: this.pinkFoam },
        { id: 3, name: 'Orange to Purple', value: this.orangeToPurple },
        { id: 4, name: 'Green to Blue', value: this.greenToBlue },
        { id: 5, name: 'AirRmHex', value: this.hexColorCollection }]

    public genColors(numClasses: number): any[] {
        // console.log('genColors ', numClasses)
        numClasses = numClasses + 1;

        function adjustHue(val) {
            if (val < 0) val += Math.ceil(-val / 360) * 360;
            return val % 360;
        }

        function map(n, start1, end1, start2, end2) {
            // console.log('genColors ', numClasses)
            return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
        }


        function createHueShiftPalette(opts) {

            const { base, minLightness, maxLightness, hueStep } = opts;
            // console.log('createHueShiftPalette ', base, ' minLightness ', minLightness, ' maxLightness ', maxLightness, ' hueStep ', hueStep)
            const palette = [base];
            const test = (numClasses / 2);

            for (let i = 1; i < test; i++) {
                const incr = i + 1;
                const hueDark = adjustHue(base.h - hueStep * i);
                const hueLight = adjustHue(base.h + hueStep * incr);
                const lightnessDark = map(i, 0, 14, base.l, minLightness);
                const lightnessLight = map(i, 0, 2, base.l, maxLightness);
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
            //console.log('palette ', palette)
            return palette;
        }


        const hueShiftPalette = createHueShiftPalette({
            base: {
                l: 25,
                c: 135,
                h: 12,
                mode: "lch"
            },
            minLightness: 15,
            maxLightness: 85,
            hueStep: 15
        });

        const hueShiftPaletteHex = hueShiftPalette.map((color) => formatHex(color));
        // console.log('hueShiftPaletteHex ', hueShiftPaletteHex)
        return hueShiftPaletteHex

    }

}