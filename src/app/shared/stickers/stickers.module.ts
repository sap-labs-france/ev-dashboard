import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { StickersComponent } from './stickers.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    MaterialModule,
  ],
  declarations: [
    StickersComponent,
  ],
  exports: [
    StickersComponent,
  ],
})
export class StickersModule {
}
