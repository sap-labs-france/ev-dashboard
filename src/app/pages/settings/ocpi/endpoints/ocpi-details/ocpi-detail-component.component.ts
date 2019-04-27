import {Component} from '@angular/core';
import {TableDef} from 'app/common.types';
import {CellContentComponentContainer} from 'app/shared/table/cell-content-template/cell-content-container.component';
import {OcpiendpointDetailDataSource} from './ocpi-detail-data-source-table';

@Component({
  // template: '<app-table class="endpoint-details" [dataSource]="ocpiendpointDetailDataSource"></app-table>',
  template: ``,
  providers: [
    OcpiendpointDetailDataSource
  ]
})

export class OcpiendpointDetailComponent extends CellContentComponentContainer {

  // constructor(public ocpiendpointDetailDataSource: OcpiendpointDetailDataSource) {
  //   super();
  // }

  // setData(row: any, tabledef: TableDef) {
  //   this.ocpiendpointDetailDataSource.setEndpoint(row);
  //   this.ocpiendpointDetailDataSource.setDetailedDataSource(row);
  // }

  // refresh(row: any, autoRefresh: boolean) {
  //   this.ocpiendpointDetailDataSource.setEndpoint(row);
  //   this.ocpiendpointDetailDataSource.setDetailedDataSource(row, autoRefresh);
  // }

  // destroy() {
  //   // this.ocpiendpointDetailDataSource.destroy();
  // }
}
