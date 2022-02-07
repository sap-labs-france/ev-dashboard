import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'app.module';

import { FiltersComponent } from './filters.component';
import { IssuerFilterComponent } from './implementations/IssuerFilter.component';
import { StatusFilterComponent } from './implementations/StatusFilter.component';
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
    IssuerFilterComponent,
    StatusFilterComponent,
  ],
  exports: [
    FiltersComponent
  ],
})
export class FiltersModule {
}
