import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'app.module';

import { FiltersComponent } from './filters.component';
import { FiltersService } from './filters.service';
import { CarMakerFilterComponent } from './implementations/car-maker-filter.component';
import { ChargingStationFilterComponent } from './implementations/charging-station-filter.component';
import { CompaniesFilterComponent } from './implementations/companies-filter.component';
import { ConnectorFilterComponent } from './implementations/connector-filter.component';
import { ErrorTypeFilterComponent } from './implementations/error-type-filter.component';
import { IssuerFilterComponent } from './implementations/issuer-filter.component';
import { ReportsFilterComponent } from './implementations/reports-filter.component';
import { SiteAreaFilterComponent } from './implementations/site-area-filter.component';
import { SiteFilterComponent } from './implementations/site-filter.component';
import { StatusFilterComponent } from './implementations/status-filter.component';
import { TagsFilterComponent } from './implementations/tags-filter.component';
import { UsersFilterComponent } from './implementations/users-filter.component';
import { DialogFilterComponent } from './structures/dialog.component';
import { MultiSelectDropdownFilterComponent } from './structures/multiselect-dropdown-filter.component';
import { SingleSelectDropdownFilterComponent } from './structures/singleselect-dropdown-filter.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule,
    MaterialModule
  ],
  declarations: [
    FiltersComponent,
    MultiSelectDropdownFilterComponent,
    SingleSelectDropdownFilterComponent,
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
