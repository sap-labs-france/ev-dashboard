import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { TableModule } from '../../shared/table/table.module';
import { TenantsListTableDataSource } from './list/tenants-list-table-data-source';
import { TenantsListComponent } from './list/tenants-list.component';
import { TenantComponent } from './tenant/tenant.component';
import { TenantDialogComponent } from './tenant/tenant.dialog.component';
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
