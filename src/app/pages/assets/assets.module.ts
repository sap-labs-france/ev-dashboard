import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormattersModule } from 'shared/formatters/formatters.module';

import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { ComponentModule } from '../../shared/component/component.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { TableModule } from '../../shared/table/table.module';
import { AssetDialogComponent } from './asset/asset-dialog.component';
import { AssetComponent } from './asset/asset.component';
import { AssetConnectionComponent } from './asset/connection/asset-connection.component';
import { AssetMainComponent } from './asset/main/asset-main.component';
import { AssetsComponent } from './assets.component';
import { AssetsRoutes } from './assets.routing';
import { AssetConsumptionCellComponent } from './cell-components/asset-consumption-cell.component';
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
    FormattersModule,
    AddressModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    DialogsModule,
    RouterModule.forChild(AssetsRoutes),
    ComponentModule,
  ],
  declarations: [
    AssetsComponent,
    AssetComponent,
    AssetMainComponent,
    AssetConnectionComponent,
    AssetDialogComponent,
    AssetsListComponent,
    AssetsInErrorComponent,
    AssetConsumptionChartDetailComponent,
    AssetConsumptionChartComponent,
    AssetConsumptionCellComponent,
  ],
  providers: [AssetsListTableDataSource, AssetsInErrorTableDataSource],
})
export class AssetsModule {}
