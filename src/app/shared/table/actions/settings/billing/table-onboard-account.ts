import { Observable } from 'rxjs';
import { CentralServerService } from 'services/central-server.service';
import { BillingAccount, BillingAccountStatus, BillingButtonAction } from 'types/Billing';
import { ButtonActionColor } from 'types/GlobalType';
import { TableActionDef } from 'types/Table';

import { TableAction } from '../../table-action';

export interface TableOnboardAccountActionDef extends TableActionDef {
  action: (
    account: BillingAccount,
    centralServerService: CentralServerService
  ) => Observable<BillingAccount>;
}

export class TableOnboardAccountAction implements TableAction {
  private action: TableActionDef = {
    id: BillingButtonAction.ONBOARD_CONNECTED_ACCOUNT,
    type: 'button',
    color: ButtonActionColor.PRIMARY,
    icon: 'person_add',
    name: 'accounts.onboarding.onboard_action',
    tooltip: 'accounts.onboarding.onboard_action',
    action: this.onboardAccount,
  };

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }

  //Onboard the connected account
  private onboardAccount(
    account: BillingAccount,
    centralServerService: CentralServerService
  ): Observable<BillingAccount> {
    return centralServerService.onboardAccount(account.id);
  }
}
