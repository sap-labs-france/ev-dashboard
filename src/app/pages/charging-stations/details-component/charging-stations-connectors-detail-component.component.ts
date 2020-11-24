import { Component, Input, OnChanges, OnInit, Self, SimpleChanges } from '@angular/core';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChargingStation } from '../../../types/ChargingStation';
import { ChargingStationsConnectorsDetailTableDataSource } from './charging-stations-connectors-detail-table-data-source';

@Component({
  template: '<app-table class="connectors-details" [dataSource]="chargingStationsConnectorsDetailTableDataSource"></app-table>',
  providers: [ChargingStationsConnectorsDetailTableDataSource],
})

export class ChargingStationsConnectorsDetailComponent extends CellContentTemplateDirective implements OnInit, OnChanges {
  @Input() public row!: ChargingStation;

  constructor(
    @Self() public chargingStationsConnectorsDetailTableDataSource: ChargingStationsConnectorsDetailTableDataSource) {
    super();
  }

  public ngOnInit(): void {
    this.refreshData();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.refreshData();
  }

  private refreshData(): void {
    // Set the charger
    this.chargingStationsConnectorsDetailTableDataSource.setCharger(this.row);
    // Reload data
    this.chargingStationsConnectorsDetailTableDataSource.refreshData(false).subscribe();
  }
}
