import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../app.module';
import { AddressModule } from '../../shared/address/address.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { TableModule } from '../../shared/table/table.module';
import { AssetComponent } from './asset/asset.component';
import { AssetDialogComponent } from './asset/asset.dialog.component';
import { AssetsComponent } from './assets.component';
import { AssetsRoutes } from './assets.routing';
import { AssetsListTableDataSource } from './list/assets-list-table-data-source';
import { AssetsListComponent } from './list/assets-list.component';

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
  ],
  declarations: [
    AssetsComponent,
    AssetComponent,
    AssetDialogComponent,
    AssetsListComponent,
  ],
  entryComponents: [
    AssetsComponent,
    AssetComponent,
    AssetDialogComponent,
    AssetsListComponent,
  ],
  providers: [
    AssetsListTableDataSource,
  ],
})

export class AssetsModule {
}
