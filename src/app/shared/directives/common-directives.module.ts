import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppAutofocusDirective} from './app-auto-focus.directive';
import {ChargerStatusDirective} from "./charger-status.directive";
import {ChargerStatusTextDirective} from "./charger-status-text.directive";

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AppAutofocusDirective,
    ChargerStatusDirective,
    ChargerStatusTextDirective
  ],
  exports: [
    AppAutofocusDirective,
    ChargerStatusDirective,
    ChargerStatusTextDirective
  ]
})
export class CommonDirectivesModule {
}
