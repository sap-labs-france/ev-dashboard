import { Component, Input } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { CarCatalog } from 'app/types/Car';

@Component({
  template: `
    <div class="logo-container">
      <img *ngIf="row.image" class="app-cars-logo" [src]='row.image'>
    </div>
  `,
})

export class CarCatalogImageFormatterCellComponent extends CellContentTemplateComponent {
  @Input() row!: CarCatalog;

}
