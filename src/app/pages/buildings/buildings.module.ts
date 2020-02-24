import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { TableModule } from '../../shared/table/table.module';
import { BuildingsComponent } from './buildings.component';
import { BuildingsRoutes } from './buildings.routing';
import { BuildingComponent } from './buildings/building/building.component';
import { BuildingDialogComponent } from './buildings/building/building.dialog.component';
import { BuildingsListTableDataSource } from './buildings/list/buildings-list-table-data-source';
import { BuildingsListComponent } from './buildings/list/buildings-list.component';
import { BuildingLogoFormatterComponent } from './formatters/building-logo-formatter.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AddressModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    DialogsModule,
    RouterModule.forChild(BuildingsRoutes),
  ],
  declarations: [
    BuildingsComponent,
    BuildingComponent,
    BuildingDialogComponent,
    BuildingsListComponent,
    BuildingLogoFormatterComponent,
  ],
  entryComponents: [
    BuildingsComponent,
    BuildingComponent,
    BuildingDialogComponent,
    BuildingsListComponent,
    BuildingLogoFormatterComponent,
  ],
  providers: [
    BuildingsListTableDataSource,
  ],
})

export class BuildingsModule {
}
