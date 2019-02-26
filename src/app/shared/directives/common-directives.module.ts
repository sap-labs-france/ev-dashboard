import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppAutofocusDirective} from './app-auto-focus.directive';
import {ChargerStatusDirective} from './charger-status.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AppAutofocusDirective,
    ChargerStatusDirective
  ],
  exports: [
    AppAutofocusDirective,
    ChargerStatusDirective
  ]
})
export class CommonDirectivesModule {
}
