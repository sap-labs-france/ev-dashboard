import { Component, Input } from '@angular/core';
import { Constants } from 'utils/Constants';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { Car, CarCatalog } from '../../../types/Car';

@Component({
  template: `
    <div class="logo-container">
      <img class="app-cars-logo"
        [src]="row['carCatalog'] ? (row['carCatalog']['image']? row['carCatalog']['image'] : noCarImage) : row['image'] ? row['image'] : noCarImage" alt="">
    </div>
  `,
})

export class CarCatalogImageFormatterCellComponent extends CellContentTemplateDirective {
  @Input() public row!: CarCatalog | Car;
  public noCarImage = Constants.NO_CAR_IMAGE;
}
