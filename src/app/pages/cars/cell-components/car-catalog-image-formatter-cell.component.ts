import { Component, Input } from '@angular/core';
import { CellContentTemplateDirective } from 'app/shared/table/cell-content-template/cell-content-template.directive';
import { CarCatalog } from 'app/types/Car';

@Component({
  template: `
    <div class="logo-container">
      <img *ngIf="row.image" class="app-cars-logo" [src]='row.image'>
    </div>
  `,
})

export class CarCatalogImageFormatterCellComponent extends CellContentTemplateDirective {
  @Input() public row!: CarCatalog;
}
