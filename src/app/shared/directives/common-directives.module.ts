import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AppAutofocusDirective} from './app-auto-focus.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AppAutofocusDirective
  ],
  exports: [
    AppAutofocusDirective
  ]
})
export class CommonDirectivesModule {
}
