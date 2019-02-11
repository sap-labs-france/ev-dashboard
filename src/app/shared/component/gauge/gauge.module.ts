
import { NgModule } from '@angular/core';
import { LinearGaugeComponent } from './linear-gauge';
import { RadialGaugeComponent } from './radial-gauge';

@NgModule({
    declarations: [ LinearGaugeComponent, RadialGaugeComponent],
    exports:    [ LinearGaugeComponent, RadialGaugeComponent ]
})
export class GaugesModule { }
