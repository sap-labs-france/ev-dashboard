import {KiloWattPipe} from '../formatters/kilo-watt.pipe';

import {NgModule} from '@angular/core';
import {UserNamePipe} from './user-name.pipe';
import {DateTimePipe} from './date-time.pipe';
import {DurationPipe} from './duration.pipe';

@NgModule({
  imports: [],
  declarations: [
    KiloWattPipe,
    UserNamePipe,
    DateTimePipe,
    DurationPipe
  ],
  exports: [
    KiloWattPipe,
    UserNamePipe,
    DateTimePipe,
    DurationPipe
  ],
  providers: [
    KiloWattPipe,
    UserNamePipe,
    DateTimePipe,
    DurationPipe
  ]
})
export class FormattersModule {
}
