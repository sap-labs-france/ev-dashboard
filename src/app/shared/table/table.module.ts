import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';
import { CommonDirectivesModule } from '../directives/common-directives.module';
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
    CommonDirectivesModule
  ],
  declarations: [
    TableComponent
  ],
  exports: [
    TableComponent
  ]
})
export class TableModule {
}
