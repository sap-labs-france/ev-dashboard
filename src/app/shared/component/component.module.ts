import {NgModule} from '@angular/core';
import {ChipComponent} from './chip/chip.component';
import {MatChipsModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    TranslateModule,
  ],
  declarations: [
    ChipComponent
  ],
  exports: [
    ChipComponent
  ]
})
export class ComponentModule {
}
