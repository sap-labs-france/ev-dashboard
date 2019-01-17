import {NgModule} from '@angular/core';
import {TableComponent} from './table.component';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MaterialModule} from '../../app.module';
import {TranslateModule} from '@ngx-translate/core';
import {FormattersModule} from '../formatters/formatters.module';
import { CellContentTemplateModule } from './cell-content-template/cell-content-template.module';
import { DetailComponentModule } from './detail-component/detail-component.module';
@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MaterialModule,
    TranslateModule,
    FormattersModule,
    CellContentTemplateModule,
    DetailComponentModule
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
