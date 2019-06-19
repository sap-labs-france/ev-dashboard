import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/common-directives.module';
import { TableModule } from '../../shared/table/table.module';
import { TenantDialogComponent } from './dialog/tenant.dialog.component';
import { TenantsDataSource } from './tenants-data-source-table';
import { TenantsComponent } from './tenants.component';
import { TenantsRoutes } from './tenants.routing';

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
  ],
  providers: [
    TenantsDataSource
  ]
})

export class TenantsModule {
}
