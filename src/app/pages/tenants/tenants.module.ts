import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

import {MaterialModule} from '../../app.module';
import {TenantsComponent} from './tenants.component';
import {TenantsRoutes} from './tenants.routing';
import {TableModule} from '../../shared/table/table.module';
import {CommonDirectivesModule} from '../../shared/directives/common-directives.module';
import {DialogsModule} from '../../shared/dialogs/dialogs.module';
import {TenantDialogComponent} from './dialog/tenant.dialog.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(TenantsRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    CommonDirectivesModule,
    DialogsModule
  ],
  declarations: [
    TenantsComponent,
    TenantDialogComponent
  ],
  entryComponents: [
    TenantsComponent,
    TenantDialogComponent
  ],
  exports: [
    TenantsComponent,
    TenantDialogComponent
  ]
})

export class TenantsModule {
}
