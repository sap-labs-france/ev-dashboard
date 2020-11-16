import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { ComponentModule } from '../../shared/component/component.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { TableModule } from '../../shared/table/table.module';
import { AssetComponent } from './asset/asset.component';
import { AssetDialogComponent } from './asset/asset.dialog.component';
import { AssetsComponent } from './assets.component';
import { AssetsRoutes } from './assets.routing';
import { AssetsInErrorTableDataSource } from './in-error/assets-in-error-table-data-source';
import { AssetsInErrorComponent } from './in-error/assets-in-error.component';
import { AssetsListTableDataSource } from './list/assets-list-table-data-source';
import { AssetsListComponent } from './list/assets-list.component';
import { AssetConsumptionChartDetailComponent } from './list/consumption-chart/asset-consumption-chart-detail.component';
import { AssetConsumptionChartComponent } from './list/consumption-chart/asset-consumption-chart.component';

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
    RouterModule.forChild(AssetsRoutes),
    ComponentModule
  ],
  declarations: [
    AssetsComponent,
    AssetComponent,
    AssetDialogComponent,
    AssetsListComponent,
    AssetsInErrorComponent,
    AssetConsumptionChartDetailComponent,
    AssetConsumptionChartComponent,
  ],
  entryComponents: [
    AssetsComponent,
    AssetComponent,
    AssetDialogComponent,
    AssetsListComponent,
    AssetsInErrorComponent
  ],
  providers: [
    AssetsListTableDataSource,
    AssetsInErrorTableDataSource
  ],
})

export class AssetsModule {
}
