import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {SubjectInfo, TableColumnDef, TableDef, TableFilterDef} from '../../../common.types';
import {CentralServerNotificationService} from '../../../services/central-server-notification.service';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {SpinnerService} from '../../../services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {MatDialog} from '@angular/material';
import {UserTableFilter} from '../../../shared/table/filters/user-filter';
import {TransactionsChargerFilter} from '../filters/transactions-charger-filter';
import {TransactionsDateFromFilter} from '../filters/transactions-date-from-filter';
import {TransactionsDateUntilFilter} from '../filters/transactions-date-until-filter';
import {AppUnitPipe} from '../../../shared/formatters/app-unit.pipe';
import {CurrencyPipe, PercentPipe} from '@angular/common';
import {DialogService} from '../../../services/dialog.service';
import {AppDatePipe} from '../../../shared/formatters/app-date.pipe';
import {Injectable} from '@angular/core';
import {AppConnectorIdPipe} from '../../../shared/formatters/app-connector-id.pipe';
import {TransactionsBaseDataSource} from '../transactions-base-data-source-table';
import {AppUserNamePipe} from '../../../shared/formatters/app-user-name.pipe';
import {AppDurationPipe} from '../../../shared/formatters/app-duration.pipe';

@Injectable()
export class TransactionsHistoryDataSource extends TransactionsBaseDataSource {

  constructor(
    messageService: MessageService,
    translateService: TranslateService,
    spinnerService: SpinnerService,
    dialogService: DialogService,
    router: Router,
    dialog: MatDialog,
    centralServerNotificationService: CentralServerNotificationService,
    centralServerService: CentralServerService,
    appDatePipe: AppDatePipe,
    appUnitPipe: AppUnitPipe,
    percentPipe: PercentPipe,
    appConnectorIdPipe: AppConnectorIdPipe,
    appUserNamePipe: AppUserNamePipe,
    appDurationPipe: AppDurationPipe,
    private currencyPipe: CurrencyPipe
  ) {
    super(messageService, translateService, spinnerService, dialogService, router, dialog, centralServerNotificationService,
      centralServerService, appDatePipe, percentPipe, appUnitPipe, appConnectorIdPipe, appUserNamePipe, appDurationPipe);
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadData() {
    this.spinnerService.show();
    this.centralServerService.getTransactions(this.getFilterValues(), this.getPaging(), this.getOrdering())
      .subscribe((transactions) => {
        this.spinnerService.hide();
        this.setNumberOfRecords(transactions.count);
        this.updatePaginator();
        this.getDataSubjet().next(transactions.result);
        this.setData(transactions.result);
      }, (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('general.error_backend'));
      });
  }

  public getTableDef(): TableDef {
    return {
      class: 'table-list-under-tabs',
      rowSelection: {
        enabled: true,
        multiple: true
      },
      search: {
        enabled: true
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    return [...super.getTableColumnDefs(),
      {
        id: 'price',
        additionalIds: ['priceUnit'],
        name: 'transactions.price',
        headerClass: 'text-right col-20p',
        class: 'text-right col-20p',
        formatter: (price, row, priceUnit) => this.currencyPipe.transform(price, priceUnit, 'symbol')
      }
    ];
  }

  getTableFiltersDef(): TableFilterDef[] {
    return [
      new TransactionsChargerFilter().getFilterDef(),
      new UserTableFilter().getFilterDef(),
      new TransactionsDateFromFilter().getFilterDef(),
      new TransactionsDateUntilFilter().getFilterDef(),
    ];
  }

}
