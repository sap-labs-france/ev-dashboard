import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FiltersComponent } from './filters.component';

@NgModule({
  imports: [CommonModule],
  declarations: [FiltersComponent],
  exports: [FiltersComponent],
})
export class FiltersModule {
}
