import { Component } from '@angular/core';
import { TableDef } from 'app/common.types';
import { DetailComponent } from 'app/shared/table/detail-component/detail-component.component';
import { ConnectorsErrorDataSource } from './connectors-error-data-source-detail-table';
@Component({
  styleUrls: ['../../charging-stations-data-source-table.scss'],
  template: '<app-table class="connectors-details" [dataSource]="connectorsErrorDataSource"></app-table>',
  providers: [
    ConnectorsErrorDataSource
  ]
})

export class ConnectorsErrorDetailComponent extends DetailComponent {
  connectorId: string;
  chargerInactive: boolean;
  classDateError: string;
  heartbeatDate: string;
  ;

  constructor(public connectorsErrorDataSource: ConnectorsErrorDataSource) {
    super();
  }

  /**
   * setData
   */
  setData(row: any, tabledef: TableDef) {
    this.connectorsErrorDataSource.setCharger(row);
    this.connectorsErrorDataSource.setDetailedDataSource(row.connectors);
  }

  refresh(row: any) {
    this.connectorsErrorDataSource.setCharger(row);
    this.connectorsErrorDataSource.setDetailedDataSource(row.connectors);
  }

  destroy() {
  }

}
