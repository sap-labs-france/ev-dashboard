import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TableDataSource } from '../../shared/table/table-data-source';
import { Log, SubjectInfo, TableColumnDef, TableActionDef, TableFilterDef, TableDef } from '../../common.types';
import { CentralServerNotificationService } from '../../services/central-server-notification.service';
import { TableAutoRefreshAction } from '../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../shared/table/actions/table-refresh-action';
import { CentralServerService } from '../../services/central-server.service';
import { LocaleService } from '../../services/locale.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { Formatters } from '../../utils/Formatters';
import { Utils } from '../../utils/Utils';
import { TableAddAction } from '../../shared/table/actions/table-add-action';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { TenantDialogComponent } from './dialog/tenant.dialog.component';

export class TenantsDataSource extends TableDataSource<Log> {
  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService) {
    super();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectLoggings();
  }

  public loadData() {
    this.spinnerService.show();
    this.centralServerService.getTenants(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((tenants) => {
        this.spinnerService.hide();
        this.setNumberOfRecords(tenants.count);
        this.updatePaginator();
        this.getDataSubjet().next(tenants.result);
        this.setData(tenants.result);
      }, (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('general.error_backend'));
      });
  }

  public getTableDef(): TableDef {
    return {
      search: {
        enabled: true
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: this.translateService.instant('tenants.name'),
        headerClass: 'col-50p',
        class: 'col-50p',
        sorted: true,
        direction: 'asc'
      },
      {
        id: 'subdomain',
        name: this.translateService.instant('tenants.subdomain'),
        headerClass: 'col-50p',
        class: 'text-left col-50p'
      }
    ];
  }

  public getPaginatorPageSizes() {
    return [50, 100, 250, 500, 1000, 2000];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableAddAction(this.translateService).getActionDef(),
      new TableRefreshAction(this.translateService).getActionDef()
    ];
  }

  public showAddComponent() {
    const dialogConfig = new MatDialogConfig();
    const dialogRef = this.dialog.open(TenantDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => this.loadData());
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(this.translateService, false).getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [
    ];
  }
}
