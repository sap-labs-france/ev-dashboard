import { Component, Input, OnChanges, OnInit, Self, SimpleChanges } from '@angular/core';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
import { ConnectorsDetailTableDataSource } from './connectors-detail-table-data-source';

@Component({
  template: '<app-table class="connectors-details" [dataSource]="connectorsDetailTableDataSource"></app-table>',
  providers: [ ConnectorsDetailTableDataSource ]
})

export class ConnectorsDetailComponent extends CellContentTemplateComponent implements OnInit, OnChanges {
  @Input() row: any;

  constructor(
      @Self() public connectorsDetailTableDataSource: ConnectorsDetailTableDataSource) {
    super();
  }

  ngOnInit(): void {
    // Set the charger
    this.connectorsDetailTableDataSource.setCharger(this.row);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Set the charger
    this.connectorsDetailTableDataSource.setCharger(this.row);
    // Reload data
    this.connectorsDetailTableDataSource.refreshData(false).subscribe();
  }
}
