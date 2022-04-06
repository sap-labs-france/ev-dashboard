import { Action, Entity } from '../../../../types/Authorization';
import { CardTypes } from '../../../../types/Dashboard';
import { DashboardBaseCardComponent } from '../dashboard-base-card.component';

export class AssetConsumptionChartComponent extends DashboardBaseCardComponent{

  public constructor(

  ){
    super(0);
    this.details = {
      display: true,
      title: 'Assets in Error',
      icon: 'account_balance',
      description: '...',
      type: CardTypes.PRIMARY,
      details: []
    };
  }

  protected fetchDetails(): void {
    // if (this.authorizationService.canAccess(Entity.ASSET, Action.LIST)){
    //   this.centralServerService.getAssetsInError(this.filterParams).subscribe((assets) => {
    //     if (assets.count > 0) {
    //       this.details.type = CardTypes.DANGER;
    //     } else if (assets.count === 0) {
    //       this.details.type = CardTypes.SUCCESS;
    //     }
    //     this.details.description = assets.count.toString();
    //     this.details.details = assets.result;
    //   }, (error) => {
    //     this.details.description = 'err';
    //   });
    // }
  }
}
