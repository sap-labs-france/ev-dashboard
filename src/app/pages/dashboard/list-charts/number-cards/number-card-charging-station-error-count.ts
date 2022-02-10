import { AuthorizationService } from 'services/authorization.service';
import { CentralServerService } from 'services/central-server.service';
import { Action, Entity } from 'types/Authorization';
import { CardTypes } from 'types/Dashboard';
import { FilterParams } from 'types/GlobalType';

import { NumberCardBaseComponent } from './number-card-base.component';

export class ChargingStationErrorCardComponent extends NumberCardBaseComponent {

  public constructor(
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private filterParams: FilterParams = {}
  ){
    super(30000);
    this.details = {
      display: true,
      title: 'Charging Stations in Error',
      icon: 'ev_station',
      description: '...',
      type: CardTypes.PRIMARY,
      details: []
    }
  }

  protected fetchDetails(): void {
    if (this.authorizationService.canAccess(Entity.CHARGING_STATION, Action.LIST)){
      this.centralServerService.getChargingStationsInError(this.filterParams).subscribe((chargers) => {
        if (chargers.count > 0) {
          this.details.type = CardTypes.DANGER;
        } else if (chargers.count === 0) {
          this.details.type = CardTypes.SUCCESS;
        }
        this.details.description = chargers.count.toString();
        this.details.details = chargers.result;
      }, (error) => {
        this.details.description = 'err';
      });
    }

  }
}
