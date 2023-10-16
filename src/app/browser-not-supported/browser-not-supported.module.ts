import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { BrowserNotSupportedComponent } from './browser-not-supported.component';

@NgModule({
  declarations: [BrowserNotSupportedComponent],
  imports: [CommonModule, TranslateModule],
})
export class BrowserNotSupportedModule {}
