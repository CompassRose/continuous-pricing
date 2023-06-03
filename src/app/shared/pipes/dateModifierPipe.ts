import { Pipe, PipeTransform, Injectable } from '@angular/core';
import * as moment from 'moment';

@Pipe({ name: 'dateModifier' })

@Injectable({
    providedIn: 'root'
})

export class DateFormatterPipe implements PipeTransform {

    public localID: string;

    private numMonths = {
        0: 'Jan',
        1: 'Feb',
        2: 'Mar',
        3: 'Apr',
        4: 'May',
        5: 'June',
        6: 'July',
        7: 'Aug',
        8: 'Sept',
        9: 'Oct',
        10: 'Nov',
        11: 'Dec'
    };



    transform(value: any, type: string): string {

        let newDate = '';

        if (type === 'time') {
            newDate = moment(value).format('LT');
        } else if (type === 'date') {
            newDate = moment(value).format('l');
        }

        return newDate
    }

    public findNetDaysOut(capture: Date, depart: Date): any {
        const capDate: any = moment(capture);
        const numDays = moment(depart, 'DD/MM/YYYY HH:mm:ss').diff(moment(capDate, 'DD/MM/YYYY HH:mm:ss'));
        const days = moment.duration(numDays).asDays();
        return Math.round(Math.floor(days))
    }

}
