export class FooterModule {
}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { PricingDefinitionModule } from '../pricing-definition/pricing-definition.module';
import { TableModule } from '../table/table.module';
import { PricingDefinitionsComponent } from './pricing-definitions.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    FormattersModule,
    TableModule,
    PricingDefinitionModule
  ],
  declarations: [
    PricingDefinitionsComponent,
  ],
  exports: [
    PricingDefinitionsComponent,
  ],
})
export class PricingDefinitionsModule {
}
