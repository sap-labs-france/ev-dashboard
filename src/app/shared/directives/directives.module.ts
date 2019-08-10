import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AppAutofocusDirective } from './app-auto-focus.directive';
import { TooltipDirective } from './tooltip.directive';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AppAutofocusDirective,
    TooltipDirective
  ],
  exports: [
    AppAutofocusDirective,
    TooltipDirective
  ]
})
export class CommonDirectivesModule {
}
