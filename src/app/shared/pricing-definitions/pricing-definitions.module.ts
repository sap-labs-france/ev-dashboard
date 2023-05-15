import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../table/table.module';
import { PricingDefinitionDetailCellComponent } from './pricing-definition/cell-components/pricing-defintion-detail-cell-component.component';
import { PricingDefinitionDimensionsComponent } from './pricing-definition/dimensions/pricing-definition-dimensions.component';
import { PricingDefinitionMainComponent } from './pricing-definition/main/pricing-definition-main.component';
import { PricingDefinitionComponent } from './pricing-definition/pricing-definition.component';
import { PricingDefinitionDialogComponent } from './pricing-definition/pricing-definition.dialog.component';
import { PricingDefinitionRestrictionsComponent } from './pricing-definition/restrictions/pricing-definition-restrictions.component';
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
    PricingDefinitionMainComponent,
    PricingDefinitionRestrictionsComponent,
    PricingDefinitionDimensionsComponent,
    PricingDefinitionDetailCellComponent,
  ],
  exports: [PricingDefinitionsComponent],
})
export class PricingDefinitionsModule {}
