import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { CryptoSettingsComponent } from './crypto/crypto-settings.component';
import { TechnicalSettingsComponent } from './technical-settings.component';
import { TechnicalSettingsRoutes } from './technical-settings.routing';

@NgModule({
  declarations: [
    TechnicalSettingsComponent,
    CryptoSettingsComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(TechnicalSettingsRoutes),
    TranslateModule,
    MaterialModule,
    DialogsModule,
    CommonDirectivesModule,
    FormattersModule,
    TableModule
  ],
  entryComponents: [
    CryptoSettingsComponent
  ]
})
export class TechnicalSettingsModule { }
