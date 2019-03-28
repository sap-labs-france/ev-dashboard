import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { TableDataSource } from 'app/shared/table/table-data-source';
import { SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, DropdownItem, Ocpiendpoint } from 'app/common.types';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { CentralServerService } from 'app/services/central-server.service';
import { LocaleService } from 'app/services/locale.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Utils } from 'app/utils/Utils';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { MatDialog, MatDialogConfig } from '@angular/material';

import { EndpointDialogComponent } from './dialog/endpoint.dialog.component';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableRegisterAction } from 'app/shared/table/actions/table-register-action';
import { Constants } from 'app/utils/Constants';
import { DialogService } from 'app/services/dialog.service';
import { OcpiendpointStatusComponent } from './formatters/ocpi-endpoint-status.component';
import { OcpiendpointPatchJobResultComponent } from './formatters/ocpi-endpoint-patch-job-result.component';
import { OcpiendpointPatchJobStatusComponent } from './formatters/ocpi-endpoint-patch-job-status.component';
import { OcpiendpointDetailComponent} from './ocpi-endpoint-details/ocpi-endpoint-detail-component.component';


const POLL_INTERVAL = 15000;
@Injectable()
export class EndpointsDataSource extends TableDataSource<Ocpiendpoint> {
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
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe) {
    super();
    this.setPollingInterval(POLL_INTERVAL);
    this.tableActionsRow = [
      new TableEditAction().getActionDef(),
      new TableRegisterAction().getActionDef(),
      new TableDeleteAction().getActionDef()
    ];
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectOcpiendpoints();
  }

  public loadData() {
    // Show
    this.spinnerService.show();
    // Get the OCPI Endpoints
    this.centralServerService.getOcpiEndpoints(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((ocpiendpoints) => {
        // Hide
        this.spinnerService.hide();
        // Update nbr records
        this.setNumberOfRecords(ocpiendpoints.count);
        // Update Paginator
        this.updatePaginator();
        // Set the data
        this.setData(ocpiendpoints.result);
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
        enabled: false
      },
      design: {
        flat: true
      },
      rowDetails: {
        enabled: true,
        isDetailComponent: true,
        detailComponentName: OcpiendpointDetailComponent
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const locale = this.localeService.getCurrentFullLocaleForJS();
    return [
      {
        id: 'name',
        name: 'ocpiendpoints.name',
        headerClass: 'col-20p',
        class: 'text-left col-20p',
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
        headerClass: 'col-5p',
        class: 'col-5p',
        sortable: true
      },
      {
        id: 'partyId',
        name: 'ocpiendpoints.partyId',
        headerClass: 'col-5p',
        class: 'col-5p',
        sortable: true
      },
      {
        id: 'version',
        name: 'ocpiendpoints.version',
        headerClass: '',
        class: '',
        sortable: true
      },
      {
        id: 'status',
        name: 'ocpiendpoints.status',
        isAngularComponent: true,
        angularComponentName: OcpiendpointStatusComponent,
        headerClass: 'text-center',
        class: 'col-20p',
        sortable: false
      },
      {
        id: 'patchJobStatus',
        name: 'ocpiendpoints.patchJobStatus',
        isAngularComponent: true,
        angularComponentName: OcpiendpointPatchJobStatusComponent,
        headerClass: 'text-center col-10p',
        class: '',
        sortable: false
      },
      {
        id: 'patchJobResult',
        name: 'ocpiendpoints.patchJobLastStatus',
        isAngularComponent: true,
        angularComponentName: OcpiendpointPatchJobResultComponent,
        headerClass: 'text-center col-10p',
        class: '',
        sortable: false
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.getTableActionsDef();
    return [
      new TableCreateAction().getActionDef(),
      ...tableActionsDef
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
        this._showOcpiendpointDialog();
        break;
    }
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case 'edit':
        this._showOcpiendpointDialog(rowItem);
        break;
      case 'delete':
        this._deleteOcpiendpoint(rowItem);
        break;
      case 'register':
        this._registerOcpiendpoint(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
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

  private _showOcpiendpointDialog(endpoint?: any) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (endpoint) {
      dialogConfig.data = endpoint;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(EndpointDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => this.loadData());
  }

  // private _sendEVSEStatusesOcpiendpoint(ocpiendpoint) {
  //   this.dialogService.createAndShowYesNoDialog(
  //     this.translateService.instant('ocpiendpoints.sendEVSEStatuses_title'),
  //     this.translateService.instant('ocpiendpoints.sendEVSEStatuses_confirm', { 'name': ocpiendpoint.name })
  //   ).subscribe((result) => {
  //     if (result === Constants.BUTTON_TYPE_YES) {
  //       // Show
  //       this.spinnerService.show();
  //       // Ping
  //       this.centralServerService.sendEVSEStatusesOcpiendpoint(ocpiendpoint).subscribe(response => {
  //         this.spinnerService.hide();
  //         if (response.failure === 0 && response.success > 0) {
  //           this.messageService.showSuccessMessage('ocpiendpoints.success_send_evse_statuses', { success: response.success });
  //         } else if (response.failure > 0 && response.success > 0) {
  //           this.messageService.showWarningMessage('ocpiendpoints.partial_send_evse_statuses',
  //             { success: response.success, error: response.failure });
  //         } else {
  //           Utils.handleError(JSON.stringify(response),
  //             this.messageService, 'ocpiendpoints.error_send_evse_statuses');
  //         }
  //         // reload data
  //         this.loadData();
  //       }, (error) => {
  //         this.spinnerService.hide();
  //         Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
  //           'ocpiendpoints.error_send_evse_statuses');
  //         // reload data
  //         this.loadData();
  //       });
  //     }
  //   });
  // }

  private _deleteOcpiendpoint(ocpiendpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.delete_title'),
      this.translateService.instant('ocpiendpoints.delete_confirm', { 'name': ocpiendpoint.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.spinnerService.show();
        this.centralServerService.deleteOcpiendpoint(ocpiendpoint.id).subscribe(response => {
          this.spinnerService.hide();
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('ocpiendpoints.delete_success', { 'name': ocpiendpoint.name });
            this.loadData();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.delete_error');
          }
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.delete_error');
        });
      }
    });
  }

  // private _startStopBackgroundJob(ocpiendpoint) {
  //   // switch background job state
  //   ocpiendpoint.backgroundPatchJob = !ocpiendpoint.backgroundPatchJob;
  //   // update it
  //   this.centralServerService.updateOcpiendpoint(ocpiendpoint).subscribe(response => {
  //     this.spinnerService.hide();
  //     if (response.status === Constants.REST_RESPONSE_SUCCESS) {
  //       if (ocpiendpoint.backgroundPatchJob) {
  //         this.messageService.showSuccessMessage('ocpiendpoints.background_job_activated');
  //       } else {
  //         this.messageService.showSuccessMessage('ocpiendpoints.background_job_desactivated');
  //       }
  //     } else {
  //       Utils.handleError(JSON.stringify(response),
  //         this.messageService, 'ocpiendpoints.update_error');
  //     }
  //     this.loadData();
  //   }, (error) => {
  //     this.spinnerService.hide();
  //     Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
  //       'ocpiendpoints.update_error');
  //   });
  // }

  private _registerOcpiendpoint(ocpiendpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.register_title'),
      this.translateService.instant('ocpiendpoints.register_confirm', { 'name': ocpiendpoint.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.spinnerService.show();
        this.centralServerService.registerOcpiendpoint(ocpiendpoint.id).subscribe(response => {
          this.spinnerService.hide();
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('ocpiendpoints.register_success', { 'name': ocpiendpoint.name });
            this.loadData();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.register_error');
          }
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.register_error');
        });
      }
    });
  }

}
