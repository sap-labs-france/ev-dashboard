import {Component} from '@angular/core';
import {TableDef} from '../../../common.types';
import {DetailComponent} from '../../../shared/table/detail-component/detail-component.component';
import {ConnectorsDataSource} from './connectors-data-source-detail-table';

@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: '<app-table class="connectors-details" [dataSource]="connectorsDataSource"></app-table>',
  providers: [
    ConnectorsDataSource
  ]
})

export class ConnectorsDetailComponent extends DetailComponent {
  connectorId: string;
  chargerInactive: boolean;
  classDateError: string;
  heartbeatDate: string;

  constructor(public connectorsDataSource: ConnectorsDataSource) {
    super();
  }

  /**
   * setData
   */
  setData(row: any, tabledef: TableDef) {
    this.connectorsDataSource.setCharger(row);
    this.connectorsDataSource.setDetailedDataSource(row.connectors);
  }

  refresh(row: any, autoRefresh: boolean) {
    this.connectorsDataSource.setCharger(row);
    this.connectorsDataSource.setDetailedDataSource(row.connectors, autoRefresh);
  }

  destroy() {
    // this.connectorsDataSource.destroy();
  }
}
