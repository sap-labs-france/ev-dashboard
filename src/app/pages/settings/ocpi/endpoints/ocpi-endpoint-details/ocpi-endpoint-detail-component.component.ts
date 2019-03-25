import {Component} from '@angular/core';
import {TableDef} from 'app/common.types';
import {DetailComponent} from 'app/shared/table/detail-component/detail-component.component';
import {OcpiendpointDetailDataSource} from './ocpi-endpoint-detail-data-source-table';

@Component({
  // styleUrls: ['../charging-stations-data-source-table.scss'],
  template: '<app-table class="connectors-details" [dataSource]="ocpiedpointDetailDataSource"></app-table>',
  providers: [
    OcpiendpointDetailDataSource
  ]
})

export class OcpiendpointDetailComponent extends DetailComponent {
  connectorId: string;
  chargerInactive: boolean;
  classDateError: string;
  heartbeatDate: string;

  constructor(public ocpiedpointDetailDataSource: OcpiendpointDetailDataSource) {
    super();
  }

  setData(row: any, tabledef: TableDef) {
    this.ocpiedpointDetailDataSource.setEndpoint(row);
  }

  refresh(row: any, autoRefresh: boolean) {
    this.ocpiedpointDetailDataSource.setEndpoint(row);
  }

  destroy() {
    // this.connectorsDataSource.destroy();
  }
}
