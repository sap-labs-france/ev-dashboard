import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module'
import { CryptoKeyComponent } from './crypto/crypto-key/crypto-key.component';
import { CryptoSettingsComponent } from './crypto/crypto-settings.component';
import { TechnicalSettingsComponent } from './technical-settings.component';
import { TechnicalSettingsRoutes } from './technical-settings.routing';

@NgModule({
  declarations: [
    TechnicalSettingsComponent,
    CryptoSettingsComponent,
    CryptoKeyComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(TechnicalSettingsRoutes),
    TranslateModule,
    MaterialModule,
    DialogsModule,
    CommonDirectivesModule,
    FormattersModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    CryptoSettingsComponent,
    CryptoKeyComponent
  ]
})
export class TechnicalSettingsModule { }
