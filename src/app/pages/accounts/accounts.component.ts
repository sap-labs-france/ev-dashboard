import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { BillingAccountsTableDataSource } from './accounts-table-data-source';

@Component({
  selector: 'app-billing-accounts',
  templateUrl: 'accounts.component.html',
})
export class AccountsComponent{

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public billingAccountTableDataSource: BillingAccountsTableDataSource,
    public translateService: TranslateService
  ) {
  }

}
