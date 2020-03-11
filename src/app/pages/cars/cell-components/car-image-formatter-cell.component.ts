import { Component, Input } from '@angular/core';
import { CellContentTemplateComponent } from 'app/shared/table/cell-content-template/cell-content-template.component';
import { Car } from 'app/types/Car';

@Component({
  template: `
    <div class="logo-container">
      <img *ngIf="row.image" class="app-cars-logo" [src]='row.image'>
    </div>
  `,
})

export class CarImageFormatterCellComponent extends CellContentTemplateComponent {
  @Input() row!: Car;

}
