import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from '../../shared/table/table-data-source';
import {SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Tenant} from '../../common.types';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {TableAutoRefreshAction} from '../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../shared/table/actions/table-refresh-action';
import {CentralServerService} from '../../services/central-server.service';
import {LocaleService} from '../../services/locale.service';
import {MessageService} from '../../services/message.service';
import {SpinnerService} from '../../services/spinner.service';
import {Utils} from '../../utils/Utils';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {TenantDialogComponent} from './dialog/tenant.dialog.component';
import {TableCreateAction} from 'app/shared/table/actions/table-create-action';
import {TableEditAction} from '../../shared/table/actions/table-edit-action';
import {TableDeleteAction} from '../../shared/table/actions/table-delete-action';
import {Constants} from '../../utils/Constants';
import {DialogService} from '../../services/dialog.service';

export class TenantsDataSource extends TableDataSource<Tenant> {
  private readonly tableActionsRow: TableActionDef[];

  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService) {
    super();

    this.tableActionsRow = [
      new TableEditAction().getActionDef(),
      new TableDeleteAction().getActionDef()
    ];
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
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
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
        id: 'id',
        name: 'general.id',
        class: 'text-left col-350px',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'name',
        name: 'tenants.name',
        class: 'text-left col-350px',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'email',
        name: 'tenants.email',
        class: 'col-400px',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'subdomain',
        name: 'tenants.subdomain',
        class: 'col-350px',
        sortable: true
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableCreateAction().getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableRowActions(): TableActionDef[] {
    return this.tableActionsRow;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this._showTenantDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'edit':
        this._showTenantDialog(rowItem);
        break;
      case 'delete':
        this._deleteTenant(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private _showTenantDialog(tenant?: any) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    if (tenant) {
      dialogConfig.data = tenant;
    }
    // Open
    this.dialog.open(TenantDialogComponent, dialogConfig);
  }

  private _deleteTenant(tenant) {
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('tenants.delete_title'),
      this.translateService.instant('tenants.delete_confirm', {'name': tenant.name})
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.spinnerService.show();
        this.centralServerService.deleteTenant(tenant.id).subscribe(response => {
          this.spinnerService.hide();
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('tenants.delete_success', {'name': tenant.name});
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'tenants.delete_error');
          }
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'tenants.delete_error');
        });
      }
    });
  }
}
