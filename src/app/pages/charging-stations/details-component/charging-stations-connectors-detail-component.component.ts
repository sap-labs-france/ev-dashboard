import { Component, Input, OnChanges, OnInit, Self, SimpleChanges } from '@angular/core';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
import { ChargingStationsConnectorsDetailTableDataSource } from './charging-stations-connectors-detail-table-data-source';

@Component({
  template: '<app-table class="connectors-details" [dataSource]="ChargingStationsConnectorsDetailTableDataSource"></app-table>',
  providers: [ ChargingStationsConnectorsDetailTableDataSource ]
})

export class ChargingStationsConnectorsDetailComponent extends CellContentTemplateComponent implements OnInit, OnChanges {
  @Input() row: any;

  constructor(
      @Self() public ChargingStationsConnectorsDetailTableDataSource: ChargingStationsConnectorsDetailTableDataSource) {
    super();
  }

  ngOnInit(): void {
    // Set the charger
    this.ChargingStationsConnectorsDetailTableDataSource.setCharger(this.row);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Set the charger
    this.ChargingStationsConnectorsDetailTableDataSource.setCharger(this.row);
    // Reload data
    this.ChargingStationsConnectorsDetailTableDataSource.refreshData(false).subscribe();
  }
}
