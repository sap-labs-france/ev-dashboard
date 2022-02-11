import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../../app/app.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { DialogFilterComponent } from './dialog-filters/dialog.component';
import { CarMakerFilterComponent } from './dialog-filters/implementations/car-maker-filter.component';
import { ChargingStationFilterComponent } from './dialog-filters/implementations/charging-station-filter.component';
import { CompaniesFilterComponent } from './dialog-filters/implementations/companies-filter.component';
import { ReportsFilterComponent } from './dialog-filters/implementations/reports-filter.component';
import { SiteAreaFilterComponent } from './dialog-filters/implementations/site-area-filter.component';
import { SiteFilterComponent } from './dialog-filters/implementations/site-filter.component';
import { TagsFilterComponent } from './dialog-filters/implementations/tags-filter.component';
import { UsersFilterComponent } from './dialog-filters/implementations/users-filter.component';
import { DropdownFilterComponent } from './dropdown-filters/dropdown-filter.component';
import { ConnectorFilterComponent } from './dropdown-filters/implementations/connector-filter.component';
import { ErrorTypeFilterComponent } from './dropdown-filters/implementations/error-type-filter.component';
import { IssuerFilterComponent } from './dropdown-filters/implementations/issuer-filter.component';
import { StatusFilterComponent } from './dropdown-filters/implementations/status-filter.component';
import { FiltersComponent } from './filters.component';
import { FiltersService } from './filters.service';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    DialogsModule,
    MaterialModule
  ],
  declarations: [
    FiltersComponent,
    DropdownFilterComponent,
    DialogFilterComponent,
    IssuerFilterComponent,
    StatusFilterComponent,
    ConnectorFilterComponent,
    ErrorTypeFilterComponent,
    CarMakerFilterComponent,
    ChargingStationFilterComponent,
    CompaniesFilterComponent,
    ReportsFilterComponent,
    SiteFilterComponent,
    SiteAreaFilterComponent,
    TagsFilterComponent,
    UsersFilterComponent,
  ],
  exports: [
    FiltersComponent
  ],
  providers: [
    FiltersService,
  ]
})
export class FiltersModule {
}
