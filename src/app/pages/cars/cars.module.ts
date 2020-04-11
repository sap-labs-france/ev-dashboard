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
import { CarComponent } from './car/car.component';
import { CarDialogComponent } from './car/car.dialog.component';
import { CarCarouselComponent } from './car/carousel/car-carousel.component';
import { CarsComponent } from './cars.component';
import { CarsRoutes } from './cars.routing';
import { CarImageFormatterCellComponent } from './cell-components/car-image-formatter-cell.component';
import { CarsListComponent } from './list/cars-list.component';

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
    CarDialogComponent,
    CarComponent,
    CarsComponent,
    CarsListComponent,
  ],
  entryComponents: [
    CarComponent,
    CarImageFormatterCellComponent,
    CarDialogComponent,
    CarsComponent,
    CarsListComponent,
  ],
  providers: [
  ],
})

export class CarsModule {
}
