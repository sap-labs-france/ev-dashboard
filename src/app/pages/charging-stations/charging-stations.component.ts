import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeatureService } from 'services/feature.service';
import { TenantFeatures } from 'types/Tenant';

import { AuthorizationService } from '../../services/authorization.service';
import { WindowService } from '../../services/window.service';
import { AbstractTabComponent } from '../../shared/component/abstract-tab/abstract-tab.component';

@Component({
  templateUrl: 'charging-stations.component.html',
})
export class ChargingStationsComponent extends AbstractTabComponent {
  public chargingStationMapFeatureIsActive: boolean;
  public canListChargingStations: boolean;
  public canListChargingStationsInError: boolean;
  public canListChargingProfiles: boolean;
  public canListTokens: boolean;
  public constructor(
    private authorizationService: AuthorizationService,
    private featureService: FeatureService,
    activatedRoute: ActivatedRoute,
    windowService: WindowService,
  ) {
    super(activatedRoute, windowService, ['all', 'chargingplans', 'inerror', 'connection']);
    this.canListTokens = this.authorizationService.canListTokens();
    this.canListChargingProfiles = this.authorizationService.canListChargingProfiles();
    this.canListChargingStations = this.authorizationService.canListChargingStations();
    this.canListChargingStationsInError = this.authorizationService.canListChargingStationsInError();
    this.chargingStationMapFeatureIsActive = this.featureService.isActive(TenantFeatures.CHARGING_STATION_MAP);
    if (this.chargingStationMapFeatureIsActive) {
      this.setHashArray(['all', 'map', 'chargingplans', 'inerror', 'connection']);
    }
  }
}
