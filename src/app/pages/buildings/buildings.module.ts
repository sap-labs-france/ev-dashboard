import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { TableModule } from '../../shared/table/table.module';
import { BuildingSiteAreasDialogComponent } from './building-site-areas/building-site-areas-dialog.component';
import { BuildingSiteAreasDataSource } from './building-site-areas/building-site-areas-table-data-source';
import { BuildingComponent } from './building/building.component';
import { BuildingDialogComponent } from './building/building.dialog.component';
import { BuildingsComponent } from './buildings.component';
import { BuildingsRoutes } from './buildings.routing';
import { BuildingsListTableDataSource } from './list/buildings-list-table-data-source';
import { BuildingsListComponent } from './list/buildings-list.component';

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
    BuildingSiteAreasDialogComponent,
  ],
  entryComponents: [
    BuildingsComponent,
    BuildingComponent,
    BuildingDialogComponent,
    BuildingsListComponent,
    BuildingSiteAreasDialogComponent,
  ],
  providers: [
    BuildingsListTableDataSource,
    BuildingSiteAreasDataSource,
  ],
})

export class BuildingsModule {
}
