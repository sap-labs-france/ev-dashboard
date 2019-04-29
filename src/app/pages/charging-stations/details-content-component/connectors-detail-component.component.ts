import {Component, Input, OnInit} from '@angular/core';
import {CellContentTemplateComponent} from '../../../shared/table/cell-content-template/cell-content-template.component';
import {ConnectorsDataSource} from './connectors-data-source-detail-table';

@Component({
  template: '<app-table class="connectors-details" [dataSource]="connectorsDataSource"></app-table>',
  providers: [
    ConnectorsDataSource
  ]
})

export class ConnectorsDetailComponent extends CellContentTemplateComponent implements OnInit {
  @Input() row: any;

  constructor(
      public connectorsDataSource: ConnectorsDataSource) {
    super();
  }

  ngOnInit(): void {
    this.connectorsDataSource.setCharger(this.row);
    this.connectorsDataSource.setDetailedDataSource(this.row.connectors);
    // this.connectorsDataSource.loadData(true).subscribe();
  }

  // destroy() {
  //   // this.connectorsDataSource.destroy();
  // }
}
