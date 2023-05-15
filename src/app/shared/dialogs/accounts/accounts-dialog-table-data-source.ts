import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AccountStatusFormatterComponent } from 'pages/accounts/formatters/account-status-formatter.component';
import { Observable } from 'rxjs';
import { BillingAccount } from 'types/Billing';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { DataResult } from '../../../types/DataResult';
import { TableColumnDef } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class AccountsDialogTableDataSource extends DialogTableDataSource<BillingAccount> {
  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<BillingAccount>> {
    return new Observable((observer) => {
      this.centralServerService.getBillingAccounts(this.getPaging(), this.getSorting()).subscribe({
        next: (accounts) => {
          observer.next(accounts);
          observer.complete();
        },
        error: (error) => {
          Utils.handleHttpError(
            error,
            this.router,
            this.messageService,
            this.centralServerService,
            'general.error_backend'
          );
          observer.error(error);
        },
      });
    });
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'companyName',
        name: 'accounts.list.company_name',
      },
      {
        id: 'businessOwner.name',
        name: 'accounts.list.business_owner',
        formatter: (name: string, account: BillingAccount) =>
          Utils.buildUserFullName(account.businessOwner),
      },
      {
        id: 'businessOwner.email',
        name: 'users.email',
      },
      {
        id: 'status',
        name: 'accounts.list.account_status',
        headerClass: 'text-center',
        isAngularComponent: true,
        angularComponent: AccountStatusFormatterComponent,
      },
    ];
  }
}
