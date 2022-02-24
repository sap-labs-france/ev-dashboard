import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonDirectivesModule } from 'shared/directives/directives.module';

import { MaterialModule } from '../../app.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../table/table.module';
import { PricingDefinitionComponent } from './pricing-definition/pricing-definition.component';
import { PricingDefinitionDialogComponent } from './pricing-definition/pricing-definition.dialog.component';
import { PricingDefinitionsComponent } from './pricing-definitions.component';
import { PricingDefinitionsDialogComponent } from './pricing-definitions.dialog.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    FormattersModule,
    TableModule,
    ReactiveFormsModule,
    CommonDirectivesModule,
  ],
  declarations: [
    PricingDefinitionsComponent,
    PricingDefinitionsDialogComponent,
    PricingDefinitionComponent,
    PricingDefinitionDialogComponent,
  ],
  exports: [
    PricingDefinitionsComponent,
  ],
})
export class PricingDefinitionsModule {
}
