import { Component } from '@angular/core';
import { AssetConnectionTableDataSource } from './asset-connections-table-data-source';

@Component({
  selector: 'app-settings-asset-connections',
  templateUrl: './asset-connections.component.html'
})
export class AssetConnectionsComponent {
  constructor(
    public assetConnectionTableDataSource: AssetConnectionTableDataSource) {
  }
}
