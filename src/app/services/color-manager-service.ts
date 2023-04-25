import { Injectable } from '@angular/core';
import { formatHex } from 'culori';


const culori = require('culori')

@Injectable({
    providedIn: 'root',
})

export class ColorManagerService {

    public genColors(numClasses: number): any[] {
        // console.log('genColors ', numClasses)
        numClasses = numClasses + 1;

        function adjustHue(val) {
            if (val < 0) val += Math.ceil(-val / 360) * 360;
            return val % 360;
        }

        function map(n, start1, end1, start2, end2) {
            console.log('genColors ', numClasses)
            return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
        }


        function createHueShiftPalette(opts) {

            const { base, minLightness, maxLightness, hueStep } = opts;
            console.log('createHueShiftPalette ', base, ' minLightness ', minLightness, ' maxLightness ', maxLightness, ' hueStep ', hueStep)
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