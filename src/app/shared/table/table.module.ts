import {NgModule} from '@angular/core';
import {TableComponent} from './table.component';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MaterialModule} from '../../app.module';
import {TranslateModule} from '@ngx-translate/core';
import {FormattersModule} from '../formatters/formatters.module';
import { DetailComponentContainer } from "./detailComponent/detailComponentContainer.component";
import { DetailComponentDirective } from "./detailComponent/detailComponent.directive";
import { CellContentTemplateModule } from "./cellContentTemplate/cellContentTemplate.module";

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
// Template for details component
    DetailComponentDirective,
    DetailComponentContainer
  ],
  exports: [
    TableComponent
  ]
})
export class TableModule {
}
