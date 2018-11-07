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
import { Utils } from '../../utils/Utils';
import { MatDialogConfig, MatDialog } from '@angular/material';
import { TenantDialogComponent } from './dialog/tenant.dialog.component';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';

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
    return this.centralServerNotificationService.getSubjectTenants();
  }

  public loadData() {
    // Show
    this.spinnerService.show();
    // Get the Tenants
    this.centralServerService.getTenants(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((tenants) => {
        // Hide
        this.spinnerService.hide();
        // Update nbr records
        this.setNumberOfRecords(tenants.count);
        // Update Paginator
        this.updatePaginator();
        // Notify
        this.getDataSubjet().next(tenants.result);
        // Set the data
        this.setData(tenants.result);
      }, (error) => {
        // Hide
        this.spinnerService.hide();
        // Show error
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
        headerClass: 'col-25p',
        class: 'text-left col-25p',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'email',
        name: this.translateService.instant('tenants.email'),
        headerClass: 'col-30p',
        class: 'col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'subdomain',
        name: this.translateService.instant('tenants.subdomain'),
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableCreateAction(this.translateService).getActionDef(),
      new TableRefreshAction(this.translateService).getActionDef()
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this._showAddTenant();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public _showAddTenant() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    // Open
    this.dialog.open(TenantDialogComponent, dialogConfig);
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
