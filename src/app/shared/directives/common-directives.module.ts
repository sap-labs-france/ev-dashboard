import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AutofocusDirective} from './auto-focus.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AutofocusDirective
  ],
  exports: [
    AutofocusDirective
  ]
})
export class CommonDirectivesModule {
}
