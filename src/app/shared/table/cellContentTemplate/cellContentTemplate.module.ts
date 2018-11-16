import { NgModule } from '@angular/core';
import { CellContentComponentContainer } from "./cellContentContainer.component";
import { CellContentTemplateDirective } from "./cellContentTemplate.directive";


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
