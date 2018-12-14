import {NgModule} from '@angular/core';
import {ChipComponent} from './chip/chip.component';
import {MatChipsModule} from '@angular/material';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule} from '@angular/common';
import {FormattersModule} from '../formatters/formatters.module';
import {ConnectorCellComponent} from './connector-cell.component';
import {CommonDirectivesModule} from '../directives/common-directives.module';

@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    TranslateModule,
    CommonDirectivesModule,
    FormattersModule,
  ],
  declarations: [
    ChipComponent,
    ConnectorCellComponent
  ],
  exports: [
    ChipComponent,
    ConnectorCellComponent
  ]
})
export class ComponentModule {
}
