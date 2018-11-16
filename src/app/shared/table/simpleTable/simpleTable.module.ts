export class FooterModule {}
import { NgModule } from '@angular/core';
import { SimpleTableComponent } from './simpleTable.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../app.module';
import { TranslateModule } from '@ngx-translate/core';
import { CellContentTemplateModule } from "../cellContentTemplate/cellContentTemplate.module";

@NgModule({
  imports: [
    RouterModule,
    CommonModule,
    MaterialModule,
    TranslateModule,
    CellContentTemplateModule
  ],
  declarations: [
    SimpleTableComponent
  ],
  exports: [
    SimpleTableComponent
  ]
})
export class SimpleTableModule {
}
