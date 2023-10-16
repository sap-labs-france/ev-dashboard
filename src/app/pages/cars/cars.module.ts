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
import { CarCatalogDialogComponent } from './car-catalog/car-catalog-dialog.component';
import { CarCatalogComponent } from './car-catalog/car-catalog.component';
import { CarCarouselComponent } from './car-catalog/carousel/car-carousel.component';
import { CarCatalogsListComponent } from './car-catalogs/car-catalogs-list.component';
import { CarDialogComponent } from './car/car-dialog.component';
import { CarComponent } from './car/car.component';
import { CarConnectorComponent } from './car/connector/car-connector.component';
import { CarMainComponent } from './car/main/car-main.component';
import { CarsComponent } from './cars.component';
import { CarsRoutes } from './cars.routing';
import { CarsListComponent } from './cars/cars-list.component';
import { CarImageFormatterCellComponent } from './cell-components/car-image-formatter-cell.component';

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
    CarImageFormatterCellComponent,
    CarCatalogDialogComponent,
    CarCatalogComponent,
    CarsComponent,
    CarCatalogsListComponent,
    CarsListComponent,
    CarDialogComponent,
    CarComponent,
    CarMainComponent,
    CarConnectorComponent,
  ],
  providers: [],
})
export class CarsModule {}
