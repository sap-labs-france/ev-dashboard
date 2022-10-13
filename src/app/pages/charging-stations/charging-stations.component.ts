import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CentralServerService } from 'services/central-server.service';
import { TenantFeatures } from 'types/Tenant';

import { AuthorizationService } from '../../services/authorization.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

@Component({
  templateUrl: 'charging-stations.component.html',
})
export class ChargingStationsComponent extends AbstractTabComponent {
  public mapFeatureIsActive: boolean;
  public canListChargingStations: boolean;
  public canListChargingStationsInError: boolean;
  public canListChargingProfiles: boolean;
  public canListTokens: boolean;
  public constructor(
    private authorizationService: AuthorizationService,
    private centralServerService: CentralServerService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
  ) {
    super(activatedRoute, windowService, ['all', 'map', 'chargingplans', 'inerror', 'connection']);
    this.canListTokens = this.authorizationService.canListTokens();
    this.canListChargingProfiles = this.authorizationService.canListChargingProfiles();
    this.canListChargingStations = this.authorizationService.canListChargingStations();
    this.canListChargingStationsInError = this.authorizationService.canListChargingStationsInError();
    this.mapFeatureIsActive = this.centralServerService.getLoggedUser().activeFeatures?.includes(TenantFeatures.CHARGING_STATION_MAP);
  }
}
