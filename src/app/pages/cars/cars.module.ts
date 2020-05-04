import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { MaterialModule } from '../../app.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { TableModule } from '../../shared/table/table.module';
import { CarCatalogComponent } from './car-catalog/car-catalog.component';
import { CarCatalogDialogComponent } from './car-catalog/car-catalog.dialog.component';
import { CarCarouselComponent } from './car-catalog/carousel/car-carousel.component';
import { CarCatalogsListComponent } from './car-catalogs/car-catalogs-list.component';
import { CarsComponent } from './cars.component';
import { CarsRoutes } from './cars.routing';
import { CarCatalogImageFormatterCellComponent } from './cell-components/car-catalog-image-formatter-cell.component';
import { UserCarComponent } from './user-car/user-car.component';
import { UserCarDialogComponent } from './user-car/user-car.dialog.component';
import { UserCarsListComponent } from './user-cars/user-cars-list.component';

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
    UserCarsListComponent,
    UserCarDialogComponent,
    UserCarComponent,
  ],
  entryComponents: [
    CarCatalogComponent,
    CarCatalogImageFormatterCellComponent,
    CarCatalogDialogComponent,
    CarsComponent,
    CarCatalogsListComponent,
    UserCarsListComponent,
    UserCarDialogComponent,
    UserCarComponent,
  ],
  providers: [
  ],
})

export class CarsModule {
}
