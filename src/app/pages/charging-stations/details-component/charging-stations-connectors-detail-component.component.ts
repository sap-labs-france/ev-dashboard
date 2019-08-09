import { Component, Input, OnChanges, OnInit, Self, SimpleChanges } from '@angular/core';
import { Charger } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';
import { ChargingStationsConnectorsDetailTableDataSource } from './charging-stations-connectors-detail-table-data-source';

@Component({
  template: '<app-table class="connectors-details" [dataSource]="chargingStationsConnectorsDetailTableDataSource"></app-table>',
  providers: [ ChargingStationsConnectorsDetailTableDataSource ]
})

export class ChargingStationsConnectorsDetailComponent extends CellContentTemplateComponent implements OnInit, OnChanges {
  @Input() row: Charger;

  constructor(
      @Self() public chargingStationsConnectorsDetailTableDataSource: ChargingStationsConnectorsDetailTableDataSource) {
    super();
  }

  ngOnInit(): void {
    this.refreshData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.refreshData();
  }

  private refreshData(): void {
    // Set the charger
    this.chargingStationsConnectorsDetailTableDataSource.setCharger(this.row);
    // Reload data
    this.chargingStationsConnectorsDetailTableDataSource.refreshData(false).subscribe();
  }
}
