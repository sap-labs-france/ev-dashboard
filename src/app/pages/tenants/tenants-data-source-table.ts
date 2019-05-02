import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from '../../shared/table/table-data-source';
import {SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Tenant} from '../../common.types';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {TableAutoRefreshAction} from '../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../shared/table/actions/table-refresh-action';
import {CentralServerService} from '../../services/central-server.service';
import {MessageService} from '../../services/message.service';
import {Utils} from '../../utils/Utils';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {TenantDialogComponent} from './dialog/tenant.dialog.component';
import {TableCreateAction} from 'app/shared/table/actions/table-create-action';
import {TableEditAction} from '../../shared/table/actions/table-edit-action';
import {TableDeleteAction} from '../../shared/table/actions/table-delete-action';
import {Constants} from '../../utils/Constants';
import {DialogService} from '../../services/dialog.service';
import {Injectable} from '@angular/core';
import {TableOpenAction} from '../../shared/table/actions/table-open-action';
import {WindowService} from '../../services/window.service';

@Injectable()
export class TenantsDataSource extends TableDataSource<Tenant> {
  constructor(
      private messageService: MessageService,
      private translateService: TranslateService,
      private dialogService: DialogService,
      private windowService: WindowService,
      private router: Router,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService) {
    super();
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectTenants();
  }

  public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService.getTenants(this.buildFilterValues(),
          this.getPaging(), this.getSorting()).subscribe((tenants) => {
        // Update nbr records
        this.setTotalNumberOfRecords(tenants.count);
        // Ok
        observer.next(tenants.result);
        observer.complete();
      }, (error) => {
        // Show error
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
        // Error
        observer.error(error);
      });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'id',
        name: 'general.id',
        headerClass: 'col-25p',
        class: 'text-left col-25p',
        sortable: true
      },
      {
        id: 'name',
        name: 'tenants.name',
        headerClass: 'col-25p',
        class: 'text-left col-25p',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'email',
        name: 'tenants.email',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: true
      },
      {
        id: 'subdomain',
        name: 'tenants.subdomain',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true
      }
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableCreateAction().getActionDef(),
      ...tableActionsDef
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [
      new TableEditAction().getActionDef(),
      new TableOpenAction().getActionDef(),
      new TableDeleteAction().getActionDef()
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this.showTenantDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'edit':
        this.showTenantDialog(rowItem);
        break;
      case 'delete':
        this.deleteTenant(rowItem);
        break;
      case 'open':
        this.openTenant(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction().getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private showTenantDialog(tenant?: any) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '60vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (tenant) {
      dialogConfig.data = tenant;
    }
    // Open
    const dialogRef = this.dialog.open(TenantDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => this.refreshData().subscribe());
  }

  private openTenant(tenant?: any) {
    if (tenant) {
      window.open(`${this.windowService.getProtocol()}//${tenant.subdomain}.${this.windowService.getHost()}`);
    }
  }

  private deleteTenant(tenant) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('tenants.delete_title'),
      this.translateService.instant('tenants.delete_confirm', {'name': tenant.name})
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.centralServerService.deleteTenant(tenant.id).subscribe(response => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('tenants.delete_success', {'name': tenant.name});
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'tenants.delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'tenants.delete_error');
        });
      }
    });
  }
}
