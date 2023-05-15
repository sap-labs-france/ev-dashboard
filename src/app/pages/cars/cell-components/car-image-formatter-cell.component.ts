import { Component, Input } from '@angular/core';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { Car, CarCatalog } from '../../../types/Car';

@Component({
  template: `
    <div class="logo-container">
      <img
        class="app-car-image"
        crossorigin="anonymous"
        [src]="row['carCatalog'] ? row['carCatalog']['image'] : row['image']"
        alt=""
        onerror="this.src='/assets/img/theme/no-image.png';"
      />
    </div>
  `,
  styleUrls: ['car-image-formatter-cell.component.scss'],
})
export class CarImageFormatterCellComponent extends CellContentTemplateDirective {
  @Input() public row!: CarCatalog | Car;
}
