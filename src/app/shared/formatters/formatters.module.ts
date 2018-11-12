import {NgModule} from '@angular/core';
import {KiloWattPipe} from './kilo-watt.pipe';
import {UserNamePipe} from './user-name.pipe';
import {DateTimePipe} from './date-time.pipe';
import {DurationPipe} from './duration.pipe';
import {PricePipe} from './price.pipe';

@NgModule({
  imports: [],
  declarations: [
    KiloWattPipe,
    UserNamePipe,
    DateTimePipe,
    DurationPipe,
    PricePipe
  ],
  exports: [
    KiloWattPipe,
    UserNamePipe,
    DateTimePipe,
    DurationPipe,
    PricePipe
  ],
  providers: [
    KiloWattPipe,
    UserNamePipe,
    DateTimePipe,
    DurationPipe,
    PricePipe
  ]
})
export class FormattersModule {
}
