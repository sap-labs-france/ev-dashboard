import {Observable} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {Injectable} from '@angular/core';

import {TableDataSource} from '../../../../shared/table/table-data-source';
import {SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Endpoint} from '../../../../common.types';
import {CentralServerNotificationService} from '../../../../services/central-server-notification.service';
import {TableAutoRefreshAction} from '../../../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../../../shared/table/actions/table-refresh-action';
import {CentralServerService} from '../../../../services/central-server.service';
import {LocaleService} from '../../../../services/locale.service';
import {MessageService} from '../../../../services/message.service';
import {SpinnerService} from '../../../../services/spinner.service';
import {Utils} from '../../../../utils/Utils';
import {MatDialog, MatDialogConfig} from '@angular/material';

import {EndpointDialogComponent} from './dialog/endpoint.dialog.component';
import {TableCreateAction} from '../../../../shared/table/actions/table-create-action';
import {TableEditAction} from '../../../../shared/table/actions/table-edit-action';
import {TableDeleteAction} from '../../../../shared/table/actions/table-delete-action';
import {Constants} from '../../../../utils/Constants';
import {DialogService} from '../../../../services/dialog.service';

@Injectable()
export class EndpointsDataSource extends TableDataSource<Endpoint> {
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
    // // Show
    // this.spinnerService.show();
    // // Get the Tenants
    // this.centralServerService.getTenants(this.getFilterValues(),
    //   this.getPaging(), this.getOrdering()).subscribe((tenants) => {
    //   // Hide
    //   this.spinnerService.hide();
    //   // Update nbr records
    //   this.setNumberOfRecords(tenants.count);
    //   // Update Paginator
    //   this.updatePaginator();
    //   // Notify
    //   this.getDataSubjet().next(tenants.result);
    //   // Set the data
    //   this.setData(tenants.result);
    // }, (error) => {
    //   // Hide
    //   this.spinnerService.hide();
    //   // Show error
    //   Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
    // });
    let endpoints;
    this.setNumberOfRecords(2);
    this.updatePaginator();
    endpoints = [{ id: "test", name: 'Gireve', countryCode: 'FR', partyId: '107', version: '2.1.1', status: 'NEW'},
    { id: "test2", name: 'SAP Labs France', countryCode: 'FR', partyId: 'SLF', version: '2.1.1', status: 'NEW'}];

    this.getDataSubjet().next(endpoints);
    this.setData( endpoints ); 
  }

  public getTableDef(): TableDef {
    return {
      search: {
        enabled: false
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
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
        name: 'ocpiendpoints.name',
        headerClass: 'col-25p',
        class: 'text-left col-25p',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'baseUrl',
        name: 'ocpiendpoints.baseUrl',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true
      },
      {
        id: 'countryCode',
        name: 'ocpiendpoints.countryCode',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true
      },
      {
        id: 'partyId',
        name: 'ocpiendpoints.partyId',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true
      },
      {
        id: 'version',
        name: 'ocpiendpoints.version',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true
      },
      {
        id: 'status',
        name: 'ocpiendpoints.status',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableCreateAction().getActionDef()
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
        this._showEndpointDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'edit':
        this._showEndpointDialog(rowItem);
        break;
      case 'delete':
    //     this._deleteTenant(rowItem);
        break;
      // default:
    //     super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private _showEndpointDialog(endpoint?: any) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    if (endpoint) {
      dialogConfig.data = endpoint;
    }
    // Open
    const dialogRef = this.dialog.open(EndpointDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => this.loadData());
  }

  // private _deleteTenant(tenant) {
  //   this.dialogService.createAndShowYesNoDialog(
  //     this.dialog,
  //     this.translateService.instant('tenants.delete_title'),
  //     this.translateService.instant('tenants.delete_confirm', {'name': tenant.name})
  //   ).subscribe((result) => {
  //     if (result === Constants.BUTTON_TYPE_YES) {
  //       this.spinnerService.show();
  //       this.centralServerService.deleteTenant(tenant.id).subscribe(response => {
  //         this.spinnerService.hide();
  //         if (response.status === Constants.REST_RESPONSE_SUCCESS) {
  //           this.messageService.showSuccessMessage('tenants.delete_success', {'name': tenant.name});
  //         } else {
  //           Utils.handleError(JSON.stringify(response),
  //             this.messageService, 'tenants.delete_error');
  //         }
  //       }, (error) => {
  //         this.spinnerService.hide();
  //         Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
  //           'tenants.delete_error');
  //       });
  //     }
  //   });
  // }
}
