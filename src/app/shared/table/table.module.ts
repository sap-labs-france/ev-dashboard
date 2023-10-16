import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import { MaterialModule } from '../../app.module';
import { CommonDirectivesModule } from '../directives/directives.module';
import { FormattersModule } from '../formatters/formatters.module';
import { CellContentTemplateModule } from './cell-content-template/cell-content-template.module';
import { TableComponent } from './table.component';

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MaterialModule,
    TranslateModule,
    FormattersModule,
    CellContentTemplateModule,
    CommonDirectivesModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDaterangepickerMd,
  ],
  declarations: [TableComponent],
  exports: [TableComponent],
})
export class TableModule {}
