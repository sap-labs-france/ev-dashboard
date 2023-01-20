import { Component, Input, OnInit } from '@angular/core';
import { GridMonitoringConnectionType, GridMonitoringData, SiteArea } from 'types/SiteArea';

import { ChargingStation } from '../../../types/ChargingStation';
import { CellContentTemplateDirective } from '../../table/cell-content-template/cell-content-template.directive';

@Component({
  template: `
    <div *ngIf="gridMonitoringData && siteArea; else elseNoGridMonitoring">
      <!-- Ecowatt -->
      <div *ngIf="gridMonitoringData.type === GridMonitoringConnectionType.ECOWATT"
          class="point-container-cell">
        <app-ecowatt-grid-forecast [siteArea]="siteArea" [ecowattData]="gridMonitoringData.ecowatt">
        </app-ecowatt-grid-forecast>
      </div>
      <div *ngIf="!gridMonitoringData.type">
        <p appTooltip class="paragraph-info">-</p>
      </div>
    </div>
    <ng-template #elseNoGridMonitoring>
      <p appTooltip class="paragraph-info">-</p>
    </ng-template>
`,
})

export class GridForecastCellComponent extends CellContentTemplateDirective implements OnInit {
  @Input() public row!: SiteArea | ChargingStation;
  public gridMonitoringData: GridMonitoringData;
  public siteArea: SiteArea;
  public GridMonitoringConnectionType = GridMonitoringConnectionType;

  public ngOnInit(): void {
    // Site Area
    if (this.row['name']) {
      this.siteArea = this.row as SiteArea;
      this.gridMonitoringData = this.siteArea.gridMonitoringData;
    }
    // Charging Station
    if (this.row['ocppVersion']) {
      const chargingStation = this.row as ChargingStation;
      this.siteArea = chargingStation.siteArea;
      this.gridMonitoringData = this.siteArea?.gridMonitoringData;
    }
  }
}
