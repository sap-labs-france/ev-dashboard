import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { CarCatalogComponent } from './car-catalog/car-catalog.component';
import { CarCatalogDialogComponent } from './car-catalog/car-catalog.dialog.component';
import { CarCarouselComponent } from './car-catalog/carousel/car-carousel.component';
import { CarCatalogsListComponent } from './car-catalogs/car-catalogs-list.component';
import { CarComponent } from './car/car.component';
import { CarDialogComponent } from './car/car.dialog.component';
import { CarsComponent } from './cars.component';
import { CarsRoutes } from './cars.routing';
import { CarsListComponent } from './cars/cars-list.component';
import { CarCatalogImageFormatterCellComponent } from './cell-components/car-catalog-image-formatter-cell.component';

@NgModule({
  imports: [
    NgbModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    DialogsModule,
    FormattersModule,
    RouterModule.forChild(CarsRoutes),
  ],
  declarations: [
    CarCarouselComponent,
    CarCatalogImageFormatterCellComponent,
    CarCatalogDialogComponent,
    CarCatalogComponent,
    CarsComponent,
    CarCatalogsListComponent,
    CarsListComponent,
    CarDialogComponent,
    CarComponent,
  ],
  entryComponents: [
    CarCatalogComponent,
    CarCatalogImageFormatterCellComponent,
    CarCatalogDialogComponent,
    CarsComponent,
    CarCatalogsListComponent,
    CarsListComponent,
    CarDialogComponent,
    CarComponent,
  ],
  providers: [
  ],
})

export class CarsModule {
}
