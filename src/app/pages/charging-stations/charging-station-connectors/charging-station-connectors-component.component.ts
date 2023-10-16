import { Component, Input, OnChanges, OnInit, Self, SimpleChanges } from '@angular/core';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { ChargingStation } from '../../../types/ChargingStation';
import { ChargingStationConnectorsTableDataSource } from './charging-station-connectors-table-data-source';

@Component({
  template:
    '<app-table class="connectors-details" [dataSource]="chargingStationsConnectorsDetailTableDataSource"></app-table>',
  providers: [ChargingStationConnectorsTableDataSource],
  styleUrls: ['charging-station-connectors-component.component.scss'],
})
export class ChargingStationConnectorsComponent
  extends CellContentTemplateDirective
  implements OnInit, OnChanges {
  @Input() public row!: ChargingStation;

  public constructor(
    @Self()
    public chargingStationsConnectorsDetailTableDataSource: ChargingStationConnectorsTableDataSource
  ) {
    super();
  }

  public ngOnInit(): void {
    this.refreshData();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.refreshData();
  }

  private refreshData(): void {
    // Pass Additional params
    this.chargingStationsConnectorsDetailTableDataSource.additionalParameters =
      this.tableDef.rowDetails?.additionalParameters;
    // Set the charger
    this.chargingStationsConnectorsDetailTableDataSource.setChargingStation(this.row);
    // Reload data
    this.chargingStationsConnectorsDetailTableDataSource.refreshData(false).subscribe();
  }
}
