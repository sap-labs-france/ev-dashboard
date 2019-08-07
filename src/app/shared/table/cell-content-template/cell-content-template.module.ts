import { NgModule } from '@angular/core';
import { CellContentTemplateComponentContainer } from './cell-content-template-container.component';

@NgModule({
  declarations: [
    CellContentTemplateComponentContainer
  ],
  exports: [
    CellContentTemplateComponentContainer
  ]
})
export class CellContentTemplateModule {
}
