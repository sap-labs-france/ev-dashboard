import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { CommonDirectivesModule } from '../../shared/directives/directives.module';
import { TableModule } from '../../shared/table/table.module';
import { TenantLogoFormatterCellComponent } from './cell-components/tenant-logo-formatter-cell.component';
import { TenantsListTableDataSource } from './list/tenants-list-table-data-source';
import { TenantsListComponent } from './list/tenants-list.component';
import { TenantComponentsComponent } from './tenant/components/tenant-components.component';
import { TenantMainComponent } from './tenant/main/tenant-main.component';
import { TenantDialogComponent } from './tenant/tenant-dialog.component';
import { TenantComponent } from './tenant/tenant.component';
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
    AddressModule,
  ],
  declarations: [
    TenantsListComponent,
    TenantLogoFormatterCellComponent,
    TenantComponent,
    TenantDialogComponent,
    TenantMainComponent,
    TenantComponentsComponent,
  ],
  exports: [TenantsListComponent],
  providers: [TenantsListTableDataSource],
})
export class TenantsModule {}
