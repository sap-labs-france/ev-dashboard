import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';
import { FormattersModule } from 'shared/formatters/formatters.module';

import { MaterialModule } from '../../app.module';
import { PricingDefinitionComponent } from './pricing-definition.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    FormattersModule,
  ],
  declarations: [
    PricingDefinitionComponent,
  ],
  exports: [
    PricingDefinitionComponent,
  ],
})
export class PricingDefinitionModule {
}
