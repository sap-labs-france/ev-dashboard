import { NgModule } from '@angular/core';
import { CellContentComponentContainer } from './cell-content-container.component';

@NgModule({
  declarations: [
    CellContentComponentContainer
  ],
  exports: [
    CellContentComponentContainer
  ]
})
export class CellContentTemplateModule {
}
