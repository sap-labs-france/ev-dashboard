import { NgModule } from '@angular/core';
import { CellContentComponentContainer } from "./cell-content-container.component";
import { CellContentTemplateDirective } from "./cell-content-template.directive";


@NgModule({
  declarations: [
    CellContentComponentContainer,
    CellContentTemplateDirective
  ],
  exports: [
    CellContentComponentContainer,
    CellContentTemplateDirective
  ]
})
export class CellContentTemplateModule {
}
