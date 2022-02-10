import { AuthorizationService } from 'services/authorization.service';
import { CentralServerService } from 'services/central-server.service';
import { Action, Entity } from 'types/Authorization';
import { CardTypes, NumberCard } from 'types/Dashboard';
import { FilterParams } from 'types/GlobalType';

import { NumberCardBaseComponent } from './number-card-base.component';

export class AssetErrorCardComponent extends NumberCardBaseComponent {

  public constructor(
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private filterParams: FilterParams = {}
  ){
    super(30000);
    this.details = {
      display: true,
      title: 'Assets in Error',
      icon: 'account_balance',
      description: '...',
      type: CardTypes.PRIMARY,
      details: []
    }
  }

  protected fetchDetails () {
    if (this.authorizationService.canAccess(Entity.ASSET, Action.LIST)){
      this.centralServerService.getAssetsInError(this.filterParams).subscribe((assets) => {
        if (assets.count > 0) {
          this.details.type = CardTypes.DANGER;
        } else if (assets.count === 0) {
          this.details.type = CardTypes.SUCCESS;
        }
        this.details.description = assets.count.toString();
        this.details.details = assets.result;
      }, (error) => {
        this.details.description = 'err';
      });
    }

  }
}
