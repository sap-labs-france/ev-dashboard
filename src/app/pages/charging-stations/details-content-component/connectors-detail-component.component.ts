import {Component} from '@angular/core';
import {TableDef} from '../../../common.types';
import {CellContentComponentContainer} from '../../../shared/table/cell-content-template/cell-content-container.component';
import {ConnectorsDataSource} from './connectors-data-source-detail-table';

@Component({
  // template: '<app-table class="connectors-details" [dataSource]="connectorsDataSource"></app-table>',
  template: '',
  providers: [
    ConnectorsDataSource
  ]
})

export class ConnectorsDetailComponent extends CellContentComponentContainer {
  // connectorId: string;
  // chargerInactive: boolean;
  // classDateError: string;
  // heartbeatDate: string;

  // constructor(public connectorsDataSource: ConnectorsDataSource) {
  //   super();
  // }

  // /**
  //  * setData
  //  */
  // setData(row: any, tabledef: TableDef) {
  //   this.connectorsDataSource.setCharger(row);
  //   this.connectorsDataSource.setDetailedDataSource(row.connectors);
  // }

  // refresh(row: any, autoRefresh: boolean) {
  //   this.connectorsDataSource.setCharger(row);
  //   this.connectorsDataSource.setDetailedDataSource(row.connectors, autoRefresh);
  // }

  // destroy() {
  //   // this.connectorsDataSource.destroy();
  // }
}
