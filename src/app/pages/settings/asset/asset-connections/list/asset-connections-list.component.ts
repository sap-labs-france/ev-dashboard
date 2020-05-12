import { Component } from '@angular/core';
import { AssetConnectionComponent } from '../connection/asset-connection.component';
import { AssetConnectionListTableDataSource } from './asset-connections-list-table-data-source';

@Component({
  selector: 'app-settings-asset-connections-list',
  templateUrl: './asset-connections-list.component.html',
  providers: [AssetConnectionListTableDataSource, AssetConnectionComponent]
})
export class AssetConnectionsListComponent {

  constructor(
    public assetConnectionListTableDataSource: AssetConnectionListTableDataSource) {
    }
}
