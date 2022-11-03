import { Injectable } from '@angular/core';
import { BezierPoints, BidPriceConstraint } from './models/dashboard.model';


@Injectable({
    providedIn: 'root'
})


export class ConstraintService {

    public bpCategory: any[] = [
        { name: 'Current' },
        { name: 'Update' },
        { name: 'Adjust' }
    ];

    private partialCategory: any[] = [
        { name: 'Current' },
        { name: 'Update' },
        { name: '' }
    ];


    public bpHeaderAbbrev: any[] = [
        { name: 'MULT', constraint: 'mult', categories: this.bpCategory },
        { name: 'ADD/SUB', constraint: 'addSub', categories: this.bpCategory },
        { name: 'MIN', constraint: 'min', categories: this.bpCategory },
        { name: 'MAX', constraint: 'max', categories: this.bpCategory },
        { name: 'CLOSE', constraint: 'partialMin', categories: this.partialCategory },
        { name: 'OPEN', constraint: 'partialMax', maxSeats: 0, categories: this.partialCategory }
    ];



    // Sets threshold initial values // bezierPoints Still mock data
    private setBezierPoints(value: number): BezierPoints[] {

        const bezierPoints: BezierPoints[] = [
            { x: 0, y: 0 },
            { x: 60, y: 0 },
            { x: 120, y: 0 },
            { x: 180, y: 0 },
            { x: 240, y: 0 },
            { x: 300, y: 0 }
        ];

        const container: BezierPoints[] = [];
        bezierPoints.forEach((bp, i) => {
            bp.y = value;
            container.push(bp);
        });
        return container;
    }



    public generateBidPriceInfluenceModifiers(constraint: BidPriceConstraint, idx: number): BidPriceConstraint {


        if (constraint.name === 'mult') {

            // constraint.originalValue = Math.round((constraint.value) * 100) / 100;



        } else if (idx === 4 || idx === 5) {
            if (!constraint.updValue) {

                if (constraint.value !== '') {
                    constraint.originalValue = constraint.updValue;
                } else {
                    constraint.originalValue = '';
                    delete constraint.updValue;
                    constraint.value = '';
                }
            } else {
                constraint.originalValue = constraint.updValue;
                delete constraint.updValue;
            }
        } else {

            constraint.originalValue = constraint.value;
        }

        constraint.originalBezierPoints = this.setBezierPoints(constraint.value);

        if (idx < 6) {
            const foundIdx = this.bpHeaderAbbrev.findIndex(x => {
                return x.constraint === constraint.constraint;
            });

            constraint.categories = this.bpHeaderAbbrev[foundIdx].categories;
            constraint.name = this.bpHeaderAbbrev[foundIdx].name;

            if (this.bpHeaderAbbrev[foundIdx].maxSeats) {
                constraint.maxSeats = this.bpHeaderAbbrev[foundIdx].maxSeats;
            }
        }
        return constraint;
    }
}
