import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { CommonModule } from '@angular/common';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { MaterialModule } from '../../app.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TableModule } from '../../shared/table/table.module';
import { TenantComponent } from './tenant/tenant.component';
import { TenantDialogComponent } from './tenant/tenant.dialog.component';
import { TenantsListComponent } from './list/tenants-list.component';
import { TenantsListTableDataSource } from './list/tenants-list-table-data-source';
import { TenantsRoutes } from './tenants.routing';
import { TranslateModule } from '@ngx-translate/core';

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
    DialogsModule,
  ],
  declarations: [
    TenantsListComponent,
    TenantComponent,
    TenantDialogComponent,
  ],
  entryComponents: [
    TenantsListComponent,
    TenantDialogComponent,
  ],
  exports: [
    TenantsListComponent,
  ],
  providers: [
    TenantsListTableDataSource,
  ],
})

export class TenantsModule {
}
