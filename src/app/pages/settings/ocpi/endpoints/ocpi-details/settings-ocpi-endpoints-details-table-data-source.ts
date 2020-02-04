import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TableRefreshAction } from 'app//shared/table/actions/table-refresh-action';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableStartAction } from 'app/shared/table/actions/table-start-action';
import { TableStopAction } from 'app/shared/table/actions/table-stop-action';
import { TableUploadAction } from 'app/shared/table/actions/table-upload-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { OcpiButtonAction, OcpiEndpoint, OcpiEndpointDetail, OcpiRole } from 'app/types/OCPIEndpoint';
import { ButtonType, TableActionDef, TableColumnDef, TableDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { TableDownloadAction } from '../../../../../shared/table/actions/table-download-action';
import { TableMultiSyncAction } from '../../../../../shared/table/actions/table-multi-sync-action';
import { OcpiDetailFailureEvsesStatusFormatterComponent } from '../formatters/ocpi-detail-failure-evses-status-formatter.component';
import { OcpiDetailJobStatusFomatterComponent } from '../formatters/ocpi-detail-job-status-formatter.component';
import { OcpiDetailSuccessEvsesStatusFormatterComponent } from '../formatters/ocpi-detail-success-evses-status-formatter.component';
import { OcpiDetailTotalEvsesStatusFormatterComponent } from '../formatters/ocpi-detail-total-evses-status-formatter.component';

@Injectable()
export class SettingsOcpiEndpointsDetailsTableDataSource extends TableDataSource<OcpiEndpointDetail> {
  private ocpiEndpoint!: OcpiEndpoint;
  private startAction = new TableStartAction().getActionDef();
  private stopAction = new TableStopAction().getActionDef();
  private synchronizeAllAction = new TableUploadAction(OcpiButtonAction.SYNC_ALL, 'ocpi.sync_all').getActionDef();
  private pushLocationsAction = new TableUploadAction(OcpiButtonAction.PUSH_LOCATIONS, 'ocpi.push_locations').getActionDef();
  private pushTokensAction = new TableUploadAction(OcpiButtonAction.PUSH_TOKENS, 'ocpi.push_tokens').getActionDef();
  private getCdrsAction = new TableDownloadAction(OcpiButtonAction.GET_CDRS, 'ocpi.get_cdrs').getActionDef();
  private getLocationsAction = new TableDownloadAction(OcpiButtonAction.GET_LOCATIONS, 'ocpi.get_locations').getActionDef();
  private getSessionsAction = new TableDownloadAction(OcpiButtonAction.GET_SESSIONS, 'ocpi.get_sessions').getActionDef();
  private getTokensAction = new TableUploadAction(OcpiButtonAction.GET_TOKENS, 'ocpi.get_tokens').getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private dialogService: DialogService,
    private datePipe: AppDatePipe) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<OcpiEndpointDetail>> {
    return new Observable((observer) => {
      // Return connector
      let ocpiEndpointDetail;
      if (this.ocpiEndpoint) {
        // Set
        ocpiEndpointDetail = ({
          id: this.ocpiEndpoint.id,
          ocpiendpoint: this.ocpiEndpoint,
          successNbr: this.ocpiEndpoint.lastPatchJobResult ? this.ocpiEndpoint.lastPatchJobResult.successNbr : 0,
          failureNbr: this.ocpiEndpoint.lastPatchJobResult ? this.ocpiEndpoint.lastPatchJobResult.failureNbr : 0,
          totalNbr: this.ocpiEndpoint.lastPatchJobResult ? this.ocpiEndpoint.lastPatchJobResult.totalNbr : 0,
          lastPatchJobOn: this.ocpiEndpoint.lastPatchJobOn ? this.ocpiEndpoint.lastPatchJobOn : null,
        } as OcpiEndpointDetail);
        observer.next({
          count: 1,
          result: [ocpiEndpointDetail],
        });
        observer.complete();
      }
    });
  }

  public setEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.ocpiEndpoint = ocpiendpoint;
    this.initDataSource(true);
  }

  public buildTableDef(): TableDef {
    return {
      class: 'table-detailed-list',
      rowSelection: {
        enabled: false,
      },
      footer: {
        enabled: false,
      },
      search: {
        enabled: false,
      },
      isSimpleTable: true,
      design: {
        flat: true,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'patchJobStatus',
        name: 'ocpiendpoints.patchJobStatus',
        isAngularComponent: true,
        angularComponent: OcpiDetailJobStatusFomatterComponent,
        headerClass: 'text-center',
        class: 'table-cell-angular-big-component',
        sortable: false,
      },
      {
        id: 'lastPatchJobOn',
        type: 'date',
        formatter: (lastPatchJobOn) => !!lastPatchJobOn ? this.datePipe.transform(lastPatchJobOn) : '',
        name: 'ocpiendpoints.lastPatchJobOn',
        headerClass: 'col-40p',
        class: 'text-left col-40p',
        sorted: true,
        direction: 'desc',
        sortable: false,
      },
      {
        id: 'totalNbr',
        type: 'integer',
        name: this.ocpiEndpoint ? (this.ocpiEndpoint.role === 'CPO' ? 'ocpiendpoints.totalChargePoints' : 'ocpiendpoints.totalTokens') : 'ocpiendpoints.total',
        isAngularComponent: true,
        angularComponent: OcpiDetailTotalEvsesStatusFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        sorted: false,
      },
      {
        id: 'successNbr',
        type: 'integer',
        name: 'ocpiendpoints.succeeded',
        isAngularComponent: true,
        angularComponent: OcpiDetailSuccessEvsesStatusFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        sorted: false,
      },
      {
        id: 'failureNbr',
        type: 'integer',
        name: 'ocpiendpoints.failed',
        isAngularComponent: true,
        angularComponent: OcpiDetailFailureEvsesStatusFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        sorted: false,
      },
    ];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableDynamicRowActions(rowItem: OcpiEndpointDetail): TableActionDef[] {
    const _actionRowButtons = [];

    if (rowItem && rowItem.ocpiendpoint) {
      // Check is background job is active for the ocpi endpoint
      if (rowItem.ocpiendpoint.backgroundPatchJob) {
        _actionRowButtons.push(this.stopAction);
      } else {
        _actionRowButtons.push(this.startAction);
      }
      let syncActions: TableActionDef;
      if (rowItem.ocpiendpoint.role === OcpiRole.CPO) {
        syncActions = new TableMultiSyncAction([
          this.synchronizeAllAction,
          this.pushLocationsAction,
          this.getTokensAction]).getActionDef();
      } else {
        syncActions = new TableMultiSyncAction([
          this.synchronizeAllAction,
          this.getLocationsAction,
          this.getSessionsAction,
          this.getCdrsAction,
          this.pushTokensAction]).getActionDef();
      }
      // add send all EVSE Statuses
      _actionRowButtons.push(syncActions);
    }
    return _actionRowButtons;
  }

  public actionTriggered(actionDef: TableActionDef) {
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: OcpiEndpointDetail) {
    switch (actionDef.id) {
      case OcpiButtonAction.SYNC_ALL:
        this.triggerJobsOcpiEndpoint(rowItem.ocpiendpoint);
        break;
      case OcpiButtonAction.PUSH_TOKENS:
        this.pushTokensOcpiEndpoint(rowItem.ocpiendpoint);
        break;
      case OcpiButtonAction.PUSH_LOCATIONS:
        this.pushEVSEStatusesOcpiEndpoint(rowItem.ocpiendpoint);
        break;
      case OcpiButtonAction.GET_CDRS:
        this.getCdrsOcpiEndpoint(rowItem.ocpiendpoint);
        break;
      case OcpiButtonAction.GET_LOCATIONS:
        this.getLocationsOcpiEndpoint(rowItem.ocpiendpoint);
        break;
      case OcpiButtonAction.GET_SESSIONS:
        this.getSessionsOcpiEndpoint(rowItem.ocpiendpoint);
        break;
      case ButtonAction.START:
        this.enableDisableBackgroundJob(rowItem.ocpiendpoint, true);
        break;
      case ButtonAction.STOP:
        this.enableDisableBackgroundJob(rowItem.ocpiendpoint, false);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  private pushEVSEStatusesOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.send_evse_statuses_title'),
      this.translateService.instant('ocpiendpoints.send_evse_statuses_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Ping
        this.centralServerService.sendEVSEStatusesOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success > 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.success_send_evse_statuses', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.partial_send_evse_statuses',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.error_send_evse_statuses');
          }
          // reload data
          this.refreshData().subscribe();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.error_send_evse_statuses');
          // reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private triggerJobsOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.triggerJobs_title'),
      this.translateService.instant('ocpiendpoints.triggerJobs_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Ping
        this.centralServerService.triggerJobsOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.tokens) {
            if (response.tokens.failure === 0 && response.tokens.success >= 0) {
              this.messageService.showSuccessMessage('ocpiendpoints.success_send_tokens', { success: response.tokens.success });
            } else if (response.tokens.failure > 0 && response.tokens.success > 0) {
              this.messageService.showWarningMessage('ocpiendpoints.partial_send_tokens',
                { success: response.tokens.success, error: response.tokens.failure });
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, 'ocpiendpoints.error_send_tokens');
            }
          }
          if (response.locations) {
            if (response.locations.failure === 0 && response.locations.success > 0) {
              this.messageService.showSuccessMessage('ocpiendpoints.success_send_evse_statuses', { success: response.locations.success });
            } else if (response.locations.failure > 0 && response.locations.success > 0) {
              this.messageService.showWarningMessage('ocpiendpoints.partial_send_evse_statuses',
                { success: response.locations.success, error: response.locations.failure });
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, 'ocpiendpoints.error_send_evse_statuses');
            }
          }

          // reload data
          this.refreshData().subscribe();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.error_trigger_jobs');
          // reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private pushTokensOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.sendTokens_title'),
      this.translateService.instant('ocpiendpoints.sendTokens_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Ping
        this.centralServerService.sendTokensOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success >= 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.success_send_tokens', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.partial_send_tokens',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.error_send_tokens');
          }
          // reload data
          this.refreshData().subscribe();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.error_send_tokens');
          // reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private getLocationsOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.getLocations_title'),
      this.translateService.instant('ocpiendpoints.getLocations_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Ping
        this.centralServerService.getLocationsOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success >= 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.getLocations_success', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.getLocations_partial',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.getLocations_error');
          }
          // reload data
          this.refreshData().subscribe();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.getLocations_error');
          // reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private getSessionsOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.getSessions_title'),
      this.translateService.instant('ocpiendpoints.getSessions_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Ping
        this.centralServerService.getSessionsOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success >= 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.getSessions_success', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.getSessions_partial',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.getSessions_error');
          }
          // reload data
          this.refreshData().subscribe();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.getSessions_error');
          // reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private getCdrsOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.getCdrs_title'),
      this.translateService.instant('ocpiendpoints.getCdrs_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Ping
        this.centralServerService.getCdrsOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success >= 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.getCdrs_success', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.getCdrs_partial',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.getCdrs_error');
          }
          // reload data
          this.refreshData().subscribe();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.getCdrs_error');
          // reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private enableDisableBackgroundJob(ocpiendpoint: OcpiEndpoint, enable: boolean) {
    // update it with dialog
    this.dialogService.createAndShowYesNoDialog(
      (enable) ? this.translateService.instant('ocpiendpoints.start_background_job_title')
        : this.translateService.instant('ocpiendpoints.stop_background_job_title'),
      (enable) ? this.translateService.instant('ocpiendpoints.start_background_job_confirm', { name: ocpiendpoint.name })
        : this.translateService.instant('ocpiendpoints.stop_background_job_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        // Switch background job state
        ocpiendpoint.backgroundPatchJob = enable;
        this.centralServerService.updateOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            if (ocpiendpoint.backgroundPatchJob) {
              this.messageService.showSuccessMessage('ocpiendpoints.background_job_activated');
            } else {
              this.messageService.showSuccessMessage('ocpiendpoints.background_job_desactivated');
            }
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.update_error');
          }
          this.refreshData().subscribe();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.update_error');
        });
      }
    });
  }
}
