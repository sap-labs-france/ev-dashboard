import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../table/table.module';
import { PricingDefinitionComponent } from './pricing-definition/pricing-definition.component';
import { PricingDefinitionDialogComponent } from './pricing-definition/pricing-definition.dialog.component';
import { PricingDefinitionsComponent } from './pricing-definitions.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    FormattersModule,
    TableModule,
  ],
  declarations: [
    PricingDefinitionComponent,
    PricingDefinitionsComponent,
    PricingDefinitionDialogComponent,
  ],
  entryComponents: [
    PricingDefinitionDialogComponent,
  ],
  exports: [
    PricingDefinitionComponent,
    PricingDefinitionsComponent,
    PricingDefinitionDialogComponent,
  ],
})
export class PricingDefinitionsModule {
}
