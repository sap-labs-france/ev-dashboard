import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { AppAutofocusDirective } from './app-auto-focus.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [AppAutofocusDirective],
  exports: [AppAutofocusDirective],
})
export class CommonDirectivesModule {}
