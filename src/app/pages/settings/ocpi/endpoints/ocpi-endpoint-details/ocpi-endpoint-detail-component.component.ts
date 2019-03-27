import {Component} from '@angular/core';
import {TableDef} from 'app/common.types';
import {DetailComponent} from 'app/shared/table/detail-component/detail-component.component';
import {OcpiendpointDetailDataSource} from './ocpi-endpoint-detail-data-source-table';

@Component({
  template: '<app-table [dataSource]="ocpiendpointDetailDataSource"></app-table>',
  providers: [
    OcpiendpointDetailDataSource
  ]
})

export class OcpiendpointDetailComponent extends DetailComponent {

  constructor(public ocpiendpointDetailDataSource: OcpiendpointDetailDataSource) {
    super();
  }

  setData(row: any, tabledef: TableDef) {
    this.ocpiendpointDetailDataSource.setEndpoint(row);
    this.ocpiendpointDetailDataSource.setDetailedDataSource(row);
  }

  refresh(row: any, autoRefresh: boolean) {
    this.ocpiendpointDetailDataSource.setEndpoint(row);
    this.ocpiendpointDetailDataSource.setDetailedDataSource(row, autoRefresh);
  }

  destroy() {
    // this.ocpiendpointDetailDataSource.destroy();
  }
}
