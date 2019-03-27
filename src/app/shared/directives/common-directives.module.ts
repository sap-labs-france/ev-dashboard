import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppAutofocusDirective} from './app-auto-focus.directive';
import {ChargerStatusDirective} from './charger-status.directive';
import { TooltipDirective } from './tooltip.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AppAutofocusDirective,
    ChargerStatusDirective,
    TooltipDirective
  ],
  exports: [
    AppAutofocusDirective,
    ChargerStatusDirective,
    TooltipDirective
  ]
})
export class CommonDirectivesModule {
}
