import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { TableRefreshAction } from '../../../../..//shared/table/actions/table-refresh-action';
import { CentralServerService } from '../../../../../services/central-server.service';
import { DialogService } from '../../../../../services/dialog.service';
import { MessageService } from '../../../../../services/message.service';
import { SpinnerService } from '../../../../../services/spinner.service';
import { AppDatePipe } from '../../../../../shared/formatters/app-date.pipe';
import { TableAutoRefreshAction } from '../../../../../shared/table/actions/table-auto-refresh-action';
import { TableDownloadAction } from '../../../../../shared/table/actions/table-download-action';
import { TableMoreAction } from '../../../../../shared/table/actions/table-more-action';
import { TableStartAction } from '../../../../../shared/table/actions/table-start-action';
import { TableStopAction } from '../../../../../shared/table/actions/table-stop-action';
import { TableUploadAction } from '../../../../../shared/table/actions/table-upload-action';
import { TableDataSource } from '../../../../../shared/table/table-data-source';
import { DataResult } from '../../../../../types/DataResult';
import { ButtonAction, RestResponse } from '../../../../../types/GlobalType';
import { HTTPError } from '../../../../../types/HTTPError';
import { ButtonType, TableActionDef, TableColumnDef, TableDef } from '../../../../../types/Table';
import { OcpiButtonAction, OcpiEndpoint, OcpiEndpointDetail, OcpiRole } from '../../../../../types/ocpi/OCPIEndpoint';
import { Utils } from '../../../../../utils/Utils';
import { OcpiDetailFailureEvsesStatusFormatterComponent } from '../formatters/ocpi-detail-failure-evses-status-formatter.component';
import { OcpiDetailJobStatusFomatterComponent } from '../formatters/ocpi-detail-job-status-formatter.component';
import { OcpiDetailSuccessEvsesStatusFormatterComponent } from '../formatters/ocpi-detail-success-evses-status-formatter.component';
import { OcpiDetailTotalEvsesStatusFormatterComponent } from '../formatters/ocpi-detail-total-evses-status-formatter.component';

@Injectable()
export class SettingsOcpiEndpointsDetailsTableDataSource extends TableDataSource<OcpiEndpointDetail> {
  private ocpiEndpoint!: OcpiEndpoint;
  private startAction = new TableStartAction().getActionDef();
  private stopAction = new TableStopAction().getActionDef();
  private pushLocationsAction = new TableUploadAction(OcpiButtonAction.PUSH_LOCATIONS, 'ocpi.push_locations').getActionDef();
  private pushTokensAction = new TableUploadAction(OcpiButtonAction.PUSH_TOKENS, 'ocpi.push_tokens').getActionDef();
  private getCdrsAction = new TableDownloadAction(OcpiButtonAction.PULL_CDRS, 'ocpi.pull_cdrs').getActionDef();
  private getLocationsAction = new TableDownloadAction(OcpiButtonAction.PULL_LOCATIONS, 'ocpi.pull_locations').getActionDef();
  private getSessionsAction = new TableDownloadAction(OcpiButtonAction.PULL_SESSIONS, 'ocpi.pull_sessions').getActionDef();
  private checkCdrsAction = new TableDownloadAction(OcpiButtonAction.CHECK_CDRS, 'ocpi.check_cdrs').getActionDef();
  private checkLocationsAction = new TableDownloadAction(OcpiButtonAction.CHECK_LOCATIONS, 'ocpi.check_locations').getActionDef();
  private checkSessionsAction = new TableDownloadAction(OcpiButtonAction.CHECK_SESSIONS, 'ocpi.check_sessions').getActionDef();
  private getTokensAction = new TableDownloadAction(OcpiButtonAction.PULL_TOKENS, 'ocpi.pull_tokens').getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private router: Router,
    private dialogService: DialogService,
    private datePipe: AppDatePipe) {
    super(spinnerService, translateService);
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
        name: 'ocpiendpoints.patch_job_status',
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
        name: 'ocpiendpoints.last_patch_job_on',
        headerClass: 'col-40p',
        class: 'text-left col-40p',
        sorted: true,
        direction: 'desc',
        sortable: false,
      },
      {
        id: 'totalNbr',
        type: 'integer',
        name: this.ocpiEndpoint ? (this.ocpiEndpoint.role === 'CPO' ? 'ocpiendpoints.total_charge_points' : 'ocpiendpoints.total_tokens') : 'ocpiendpoints.total',
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
        syncActions = new TableMoreAction([
          this.pushLocationsAction,
          this.getTokensAction,
          this.checkLocationsAction,
          this.checkSessionsAction,
          this.checkCdrsAction]).getActionDef();
      } else {
        syncActions = new TableMoreAction([
          this.getLocationsAction,
          this.getSessionsAction,
          this.getCdrsAction,
          this.pushTokensAction]).getActionDef();
      }
      _actionRowButtons.push(syncActions);
    }
    return _actionRowButtons;
  }

  public rowActionTriggered(actionDef: TableActionDef, ocpiEndpointDetail: OcpiEndpointDetail) {
    switch (actionDef.id) {
      case OcpiButtonAction.PUSH_TOKENS:
        this.pushTokensOcpiEndpoint(ocpiEndpointDetail.ocpiendpoint);
        break;
      case OcpiButtonAction.PUSH_LOCATIONS:
        this.pushEVSEStatusesOcpiEndpoint(ocpiEndpointDetail.ocpiendpoint);
        break;
      case OcpiButtonAction.PULL_CDRS:
        this.pullCdrsOcpiEndpoint(ocpiEndpointDetail.ocpiendpoint);
        break;
      case OcpiButtonAction.PULL_LOCATIONS:
        this.pullLocationsOcpiEndpoint(ocpiEndpointDetail.ocpiendpoint);
        break;
      case OcpiButtonAction.PULL_SESSIONS:
        this.pullSessionsOcpiEndpoint(ocpiEndpointDetail.ocpiendpoint);
        break;
      case OcpiButtonAction.PULL_TOKENS:
        this.pullTokensOcpiEndpoint(ocpiEndpointDetail.ocpiendpoint);
        break;
      case OcpiButtonAction.CHECK_CDRS:
        this.checkCdrsOcpiEndpoint(ocpiEndpointDetail.ocpiendpoint);
        break;
      case OcpiButtonAction.CHECK_SESSIONS:
        this.checkSessionsOcpiEndpoint(ocpiEndpointDetail.ocpiendpoint);
        break;
      case OcpiButtonAction.CHECK_LOCATIONS:
        this.checkLocationsOcpiEndpoint(ocpiEndpointDetail.ocpiendpoint);
        break;
      case ButtonAction.START:
        this.enableDisableBackgroundJob(ocpiEndpointDetail.ocpiendpoint, true);
        break;
      case ButtonAction.STOP:
        this.enableDisableBackgroundJob(ocpiEndpointDetail.ocpiendpoint, false);
        break;
    }
  }

  private pushEVSEStatusesOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.push_evse_statuses_title'),
      this.translateService.instant('ocpiendpoints.push_evse_statuses_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.messageService.showInfoMessage('ocpiendpoints.trigger_ocpi_action');
        this.centralServerService.sendEVSEStatusesOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success > 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.push_evse_statuses_success', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.push_evse_statuses_partial',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.push_evse_statuses_error');
          }
          // Reload data
          this.refreshData().subscribe();
        }, (error) => {
          switch (error.status) {
            // Hash no longer valid
            case HTTPError.CANNOT_ACQUIRE_LOCK:
              this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
              break;
            default:
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                'ocpiendpoints.push_evse_statuses_error');
          }
          // Reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private pushTokensOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.push_tokens_title'),
      this.translateService.instant('ocpiendpoints.push_tokens_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.messageService.showInfoMessage('ocpiendpoints.trigger_ocpi_action');
        this.centralServerService.sendTokensOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success >= 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.push_tokens_success', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.push_tokens_partial',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.push_tokens_error');
          }
          // Reload data
          this.refreshData().subscribe();
        }, (error) => {
          switch (error.status) {
            // Hash no longer valid
            case HTTPError.CANNOT_ACQUIRE_LOCK:
              this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
              break;
            default:
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                'ocpiendpoints.push_tokens_error');
          }
          // Reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private pullLocationsOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.pull_locations_title'),
      this.translateService.instant('ocpiendpoints.pull_locations_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.messageService.showInfoMessage('ocpiendpoints.trigger_ocpi_action');
        this.centralServerService.pullLocationsOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success >= 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.pull_locations_success', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.pull_locations_partial',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.pull_locations_error');
          }
          // Reload data
          this.refreshData().subscribe();
        }, (error) => {
          switch (error.status) {
            // Hash no longer valid
            case HTTPError.CANNOT_ACQUIRE_LOCK:
              this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
              break;
            default:
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                'ocpiendpoints.pull_locations_error');
          }
          // Reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private pullSessionsOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.get_sessions_title'),
      this.translateService.instant('ocpiendpoints.get_sessions_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.messageService.showInfoMessage('ocpiendpoints.trigger_ocpi_action');
        this.centralServerService.pullSessionsOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success >= 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.get_sessions_success', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.get_sessions_partial',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.get_sessions_error');
          }
          // Reload data
          this.refreshData().subscribe();
        }, (error) => {
          switch (error.status) {
            // Hash no longer valid
            case HTTPError.CANNOT_ACQUIRE_LOCK:
              this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
              break;
            default:
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                'ocpiendpoints.get_sessions_error');
          }
          // Reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private pullTokensOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.pull_tokens_title'),
      this.translateService.instant('ocpiendpoints.pull_tokens_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.messageService.showInfoMessage('ocpiendpoints.trigger_ocpi_action');
        this.centralServerService.pullTokensOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success >= 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.pull_tokens_success', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.pull_tokens_partial',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.pull_tokens_error');
          }
          // Reload data
          this.refreshData().subscribe();
        }, (error) => {
          switch (error.status) {
            // Hash no longer valid
            case HTTPError.CANNOT_ACQUIRE_LOCK:
              this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
              break;
            default:
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                'ocpiendpoints.pull_tokens_error');
          }
          // Reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private checkLocationsOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.check_locations_title'),
      this.translateService.instant('ocpiendpoints.check_locations_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.messageService.showInfoMessage('ocpiendpoints.trigger_ocpi_action');
        this.centralServerService.checkLocationsOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success >= 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.check_locations_success', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.check_locations_partial',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.check_locations_error');
          }
          // Reload data
          this.refreshData().subscribe();
        }, (error) => {
          switch (error.status) {
            // Hash no longer valid
            case HTTPError.CANNOT_ACQUIRE_LOCK:
              this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
              break;
            default:
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                'ocpiendpoints.check_locations_error');
          }
          // Reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private checkSessionsOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.check_sessions_title'),
      this.translateService.instant('ocpiendpoints.check_sessions_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.messageService.showInfoMessage('ocpiendpoints.trigger_ocpi_action');
        this.centralServerService.checkSessionsOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success >= 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.check_sessions_success', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.check_sessions_partial',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.check_sessions_error');
          }
          // Reload data
          this.refreshData().subscribe();
        }, (error) => {
          switch (error.status) {
            // Hash no longer valid
            case HTTPError.CANNOT_ACQUIRE_LOCK:
              this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
              break;
            default:
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                'ocpiendpoints.check_sessions_error');
          }
          // Reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private checkCdrsOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.check_cdrs_title'),
      this.translateService.instant('ocpiendpoints.check_cdrs_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.messageService.showInfoMessage('ocpiendpoints.trigger_ocpi_action');
        this.centralServerService.checkCdrsOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success >= 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.check_cdrs_success', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.check_cdrs_partial',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.check_cdrs_error');
          }
          // Reload data
          this.refreshData().subscribe();
        }, (error) => {
          switch (error.status) {
            // Hash no longer valid
            case HTTPError.CANNOT_ACQUIRE_LOCK:
              this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
              break;
            default:
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                'ocpiendpoints.check_cdrs_error');
          }
          // Reload data
          this.refreshData().subscribe();
        });
      }
    });
  }

  private pullCdrsOcpiEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.pull_cdrs_title'),
      this.translateService.instant('ocpiendpoints.pull_cdrs_confirm', { name: ocpiendpoint.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.messageService.showInfoMessage('ocpiendpoints.trigger_ocpi_action');
        this.centralServerService.pullCdrsOcpiEndpoint(ocpiendpoint).subscribe((response) => {
          if (response.failure === 0 && response.success >= 0) {
            this.messageService.showSuccessMessage('ocpiendpoints.pull_cdrs_success', { success: response.success });
          } else if (response.failure > 0 && response.success > 0) {
            this.messageService.showWarningMessage('ocpiendpoints.pull_cdrs_partial',
              { success: response.success, error: response.failure });
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'ocpiendpoints.pull_cdrs_error');
          }
          // Reload data
          this.refreshData().subscribe();
        }, (error) => {
          switch (error.status) {
            // Hash no longer valid
            case HTTPError.CANNOT_ACQUIRE_LOCK:
              this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
              break;
            default:
              Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                'ocpiendpoints.pull_cdrs_error');
          }
          // Reload data
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
