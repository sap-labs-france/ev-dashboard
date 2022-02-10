import { Component } from '@angular/core';
import { AuthorizationService } from 'services/authorization.service';
import { CentralServerService } from 'services/central-server.service';
import { ChartCard } from 'types/Dashboard';

import { AssetErrorCardComponent } from './number-cards/number-card-asset-error-count';
import { NumberCardBaseComponent } from './number-cards/number-card-base.component';
import { ChargingStationErrorCardComponent } from './number-cards/number-card-charging-station-error-count';

@Component({
  selector: 'app-dashboard-list-charts',
  templateUrl: './dashboard-list-charts.component.html'
})
export class DashboardChartListComponent{
  public numberCards: NumberCardBaseComponent[] = [];
  public chartCards: ChartCard[] = [];
  public fillerCardColSpanSize: number;

  public constructor(
    centralServerService: CentralServerService,
    authorizationService: AuthorizationService
  ){
    this.numberCards.push(
      new ChargingStationErrorCardComponent(centralServerService, authorizationService),
      new AssetErrorCardComponent(centralServerService, authorizationService),
    );
    this.fillerCardColSpanSize = (4 - (this.numberCards.length % 4)) * 3;
  }
}
