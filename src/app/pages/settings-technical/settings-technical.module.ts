import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { TableModule } from '../../shared/table/table.module';
import { TenantSupportModule } from '../../shared/tenant-support/tenant-support.module';
import { SettingsCryptoKeyComponent } from './crypto/crypto-key/settings-crypto-key.component';
import { SettingsCryptoComponent } from './crypto/settings-crypto.component';
import { TenantDataComponent } from './data/tenant-data.component';
import { SettingsTechnicalComponent } from './settings-technical.component';
import { TechnicalSettingsRoutes } from './settings-technical.routing';
import { SettingsUserComponent } from './users/settings-user.component';

@NgModule({
  declarations: [
    SettingsTechnicalComponent,
    SettingsCryptoComponent,
    SettingsCryptoKeyComponent,
    SettingsUserComponent,
    TenantDataComponent
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
    ReactiveFormsModule,
    AddressModule,
    TenantSupportModule,
  ]
})
export class SettingsTechnicalModule { }
