import { Component } from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'example-simple',
    template: `
    <input
    matInput
    ngxDaterangepickerMd
    startKey="start"
    endKey="end"
    [locale]="{applyLabel: 'ok', format: 'DD-MM-YYYY'}"
    formControl="formControl"
/>
    `,
})
export class DateRangeComponent {
    inlineDate: { chosenLabel: string; startDate: moment.Moment; endDate: moment.Moment };

    selected = {
        startDate: moment('2015-11-18T00:00Z'),
        endDate: moment('2015-11-26T00:00Z'),
    };

    chosenDate(chosenDate: { chosenLabel: string; startDate: moment.Moment; endDate: moment.Moment }): void {
        console.log(chosenDate);
        this.inlineDate = chosenDate;
    }
}
