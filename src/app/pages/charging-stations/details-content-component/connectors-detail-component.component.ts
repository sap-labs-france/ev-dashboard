import {Component, Input, OnInit, OnChanges, SimpleChanges} from '@angular/core';
import {CellContentTemplateComponent} from '../../../shared/table/cell-content-template/cell-content-template.component';
import {ConnectorsDataSource} from './connectors-data-source-detail-table';

@Component({
  template: '<app-table class="connectors-details" [dataSource]="connectorsDataSource"></app-table>',
  providers: [
    ConnectorsDataSource
  ]
})

export class ConnectorsDetailComponent extends CellContentTemplateComponent implements OnInit, OnChanges {
  @Input() row: any;

  constructor(
      public connectorsDataSource: ConnectorsDataSource) {
    super();
  }

  ngOnInit(): void {
    console.log('ConnectorsDetailComponent - ngOnInit');
    this.connectorsDataSource.setCharger(this.row);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('ConnectorsDetailComponent - ngOnChanges');
    this.connectorsDataSource.setCharger(this.row);
  }
}
