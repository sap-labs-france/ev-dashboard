import {NgModule} from '@angular/core';
import {TableComponent} from './table.component';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MaterialModule} from '../../app.module';
import {TranslateModule} from '@ngx-translate/core';
import {FormattersModule} from '../formatters/formatters.module';
import { DetailComponentContainer } from './detail-component/detail-component-container.component';
import { DetailComponentDirective } from './detail-component/detail-component.directive';
import { CellContentTemplateModule } from './cell-content-template/cell-content-template.module';
@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MaterialModule,
    TranslateModule,
    FormattersModule,
    CellContentTemplateModule
  ],
  declarations: [
    TableComponent,
    DetailComponentDirective,
    DetailComponentContainer
  ],
  exports: [
    TableComponent
  ]
})
export class TableModule {
}
