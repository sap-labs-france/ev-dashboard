import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { OCPIRole } from 'types/ocpi/OCPIRole';
import { Constants } from 'utils/Constants';

import { CentralServerService } from '../../../../../services/central-server.service';
import { DialogService } from '../../../../../services/dialog.service';
import { MessageService } from '../../../../../services/message.service';
import { SpinnerService } from '../../../../../services/spinner.service';
import { AppDatePipe } from '../../../../../shared/formatters/app-date.pipe';
import { TableAutoRefreshAction } from '../../../../../shared/table/actions/table-auto-refresh-action';
import { TableDownloadAction } from '../../../../../shared/table/actions/table-download-action';
import { TableMoreAction } from '../../../../../shared/table/actions/table-more-action';
import { TableRefreshAction } from '../../../../../shared/table/actions/table-refresh-action';
import { TableStartAction } from '../../../../../shared/table/actions/table-start-action';
import { TableStopAction } from '../../../../../shared/table/actions/table-stop-action';
import { TableUploadAction } from '../../../../../shared/table/actions/table-upload-action';
import { TableDataSource } from '../../../../../shared/table/table-data-source';
import { OcpiEndpointDataResult } from '../../../../../types/DataResult';
import { ButtonAction, RestResponse } from '../../../../../types/GlobalType';
import { HTTPError } from '../../../../../types/HTTPError';
import { OCPIButtonAction, OCPIEndpoint } from '../../../../../types/ocpi/OCPIEndpoint';
import { TableActionDef, TableColumnDef, TableDef } from '../../../../../types/Table';
import { Utils } from '../../../../../utils/Utils';
import { OcpiDetailFailureFormatterComponent } from '../formatters/ocpi-detail-failure-formatter.component';
import { OcpiDetailSuccessFormatterComponent } from '../formatters/ocpi-detail-success-formatter.component';
import { OcpiDetailTotalFormatterComponent } from '../formatters/ocpi-detail-total-formatter.component';

@Injectable()
export class SettingsOcpiEndpointsDetailsTableDataSource extends TableDataSource<OCPIEndpoint> {
  private ocpiEndpoint!: OCPIEndpoint;
  private startAction = new TableStartAction().getActionDef();
  private stopAction = new TableStopAction().getActionDef();
  private pushEVSEStatusesAction = new TableUploadAction(
    OCPIButtonAction.PUSH_EVSE_STATUSES,
    'ocpi.push_evse_statuses'
  ).getActionDef();
  private pushTokensAction = new TableUploadAction(
    OCPIButtonAction.PUSH_TOKENS,
    'ocpi.push_tokens'
  ).getActionDef();
  private getCdrsAction = new TableDownloadAction(
    OCPIButtonAction.PULL_CDRS,
    'ocpi.pull_cdrs'
  ).getActionDef();
  private getLocationsAction = new TableDownloadAction(
    OCPIButtonAction.PULL_LOCATIONS,
    'ocpi.pull_locations'
  ).getActionDef();
  private getSessionsAction = new TableDownloadAction(
    OCPIButtonAction.PULL_SESSIONS,
    'ocpi.pull_sessions'
  ).getActionDef();
  private checkCdrsAction = new TableDownloadAction(
    OCPIButtonAction.CHECK_CDRS,
    'ocpi.check_cdrs'
  ).getActionDef();
  private checkLocationsAction = new TableDownloadAction(
    OCPIButtonAction.CHECK_LOCATIONS,
    'ocpi.check_locations'
  ).getActionDef();
  private checkSessionsAction = new TableDownloadAction(
    OCPIButtonAction.CHECK_SESSIONS,
    'ocpi.check_sessions'
  ).getActionDef();
  private getTokensAction = new TableDownloadAction(
    OCPIButtonAction.PULL_TOKENS,
    'ocpi.pull_tokens'
  ).getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private router: Router,
    private dialogService: DialogService,
    private datePipe: AppDatePipe
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<OcpiEndpointDataResult> {
    return new Observable((observer) => {
      if (this.ocpiEndpoint) {
        observer.next({
          count: 1,
          result: [this.ocpiEndpoint],
        });
        observer.complete();
      }
    });
  }

  public setEndpoint(ocpiEndpoint: OCPIEndpoint) {
    this.ocpiEndpoint = Utils.cloneObject(ocpiEndpoint);
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
        id: 'lastCpoPushStatuses',
        type: 'integer',
        name: 'ocpiendpoints.total_charge_points',
        isAngularComponent: true,
        angularComponent: OcpiDetailTotalFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        visible: this.ocpiEndpoint?.role === OCPIRole.CPO,
      },
      // CPO Charging Station Statuses
      {
        id: 'lastCpoPushStatuses',
        type: 'integer',
        name: 'ocpiendpoints.succeeded',
        isAngularComponent: true,
        angularComponent: OcpiDetailSuccessFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        visible: this.ocpiEndpoint?.role === OCPIRole.CPO,
      },
      {
        id: 'lastCpoPushStatuses',
        type: 'integer',
        name: 'ocpiendpoints.failed',
        isAngularComponent: true,
        angularComponent: OcpiDetailFailureFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        visible: this.ocpiEndpoint?.role === OCPIRole.CPO,
      },
      {
        id: 'lastCpoPushStatuses.lastUpdatedOn',
        type: 'date',
        formatter: (lastCpoPushStatuses: Date) =>
          lastCpoPushStatuses ? this.datePipe.transform(lastCpoPushStatuses) : '-',
        name: 'ocpiendpoints.last_patch_job_on',
        visible: this.ocpiEndpoint?.role === OCPIRole.CPO,
      },
      // CPO Pull Tokens
      {
        id: 'lastCpoPullTokens',
        type: 'integer',
        name: 'ocpiendpoints.total_tokens',
        isAngularComponent: true,
        angularComponent: OcpiDetailTotalFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        visible: this.ocpiEndpoint?.role === OCPIRole.CPO,
      },
      {
        id: 'lastCpoPullTokens',
        type: 'integer',
        name: 'ocpiendpoints.succeeded',
        isAngularComponent: true,
        angularComponent: OcpiDetailSuccessFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        visible: this.ocpiEndpoint?.role === OCPIRole.CPO,
      },
      {
        id: 'lastCpoPullTokens',
        type: 'integer',
        name: 'ocpiendpoints.failed',
        isAngularComponent: true,
        angularComponent: OcpiDetailFailureFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        visible: this.ocpiEndpoint?.role === OCPIRole.CPO,
      },
      {
        id: 'lastCpoPullTokens.lastUpdatedOn',
        type: 'date',
        formatter: (lastCpoPushStatuses: Date) =>
          lastCpoPushStatuses ? this.datePipe.transform(lastCpoPushStatuses) : '-',
        name: 'ocpiendpoints.last_patch_job_on',
        visible: this.ocpiEndpoint?.role === OCPIRole.CPO,
      },
      // EMSP Pull Locations
      {
        id: 'lastEmspPullLocations',
        type: 'integer',
        name: 'ocpiendpoints.total_locations',
        isAngularComponent: true,
        angularComponent: OcpiDetailTotalFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        visible: this.ocpiEndpoint?.role === OCPIRole.EMSP,
      },
      {
        id: 'lastEmspPullLocations',
        type: 'integer',
        name: 'ocpiendpoints.succeeded',
        isAngularComponent: true,
        angularComponent: OcpiDetailSuccessFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        visible: this.ocpiEndpoint?.role === OCPIRole.EMSP,
      },
      {
        id: 'lastEmspPullLocations',
        type: 'integer',
        name: 'ocpiendpoints.failed',
        isAngularComponent: true,
        angularComponent: OcpiDetailFailureFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        visible: this.ocpiEndpoint?.role === OCPIRole.EMSP,
      },
      {
        id: 'lastEmspPullLocations.lastUpdatedOn',
        type: 'date',
        formatter: (lastCpoPushStatuses: Date) =>
          lastCpoPushStatuses ? this.datePipe.transform(lastCpoPushStatuses) : '-',
        name: 'ocpiendpoints.last_patch_job_on',
        visible: this.ocpiEndpoint?.role === OCPIRole.EMSP,
      },
      // EMSP Push Tokens
      {
        id: 'lastEmspPushTokens',
        type: 'integer',
        name: 'ocpiendpoints.total_tokens',
        isAngularComponent: true,
        angularComponent: OcpiDetailTotalFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        visible: this.ocpiEndpoint?.role === OCPIRole.EMSP,
      },
      {
        id: 'lastEmspPushTokens',
        type: 'integer',
        name: 'ocpiendpoints.succeeded',
        isAngularComponent: true,
        angularComponent: OcpiDetailSuccessFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        visible: this.ocpiEndpoint?.role === OCPIRole.EMSP,
      },
      {
        id: 'lastEmspPushTokens',
        type: 'integer',
        name: 'ocpiendpoints.failed',
        isAngularComponent: true,
        angularComponent: OcpiDetailFailureFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
        visible: this.ocpiEndpoint?.role === OCPIRole.EMSP,
      },
      {
        id: 'lastEmspPushTokens.lastUpdatedOn',
        type: 'date',
        formatter: (lastCpoPushStatuses: Date) =>
          lastCpoPushStatuses ? this.datePipe.transform(lastCpoPushStatuses) : '-',
        name: 'ocpiendpoints.last_patch_job_on',
        visible: this.ocpiEndpoint?.role === OCPIRole.EMSP,
      },
    ];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableDynamicRowActions(rowItem: OCPIEndpoint): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    if (rowItem) {
      // Check is background job is active for the ocpi endpoint
      if (rowItem.backgroundPatchJob) {
        rowActions.push(this.stopAction);
      } else {
        rowActions.push(this.startAction);
      }
      let syncActions: TableActionDef;
      if (rowItem.role === OCPIRole.CPO) {
        syncActions = new TableMoreAction([
          this.pushEVSEStatusesAction,
          this.getTokensAction,
          this.checkLocationsAction,
          this.checkSessionsAction,
          this.checkCdrsAction,
        ]).getActionDef();
      } else {
        syncActions = new TableMoreAction([
          this.getLocationsAction,
          this.pushTokensAction,
          this.getSessionsAction,
          this.getCdrsAction,
        ]).getActionDef();
      }
      rowActions.push(syncActions);
    }
    return rowActions;
  }

  public rowActionTriggered(actionDef: TableActionDef, ocpiEndpoint: OCPIEndpoint) {
    switch (actionDef.id) {
      case OCPIButtonAction.PUSH_TOKENS:
        this.pushTokensOcpiEndpoint(ocpiEndpoint);
        break;
      case OCPIButtonAction.PUSH_EVSE_STATUSES:
        this.pushEVSEStatusesOcpiEndpoint(ocpiEndpoint);
        break;
      case OCPIButtonAction.PULL_CDRS:
        this.pullCdrsOcpiEndpoint(ocpiEndpoint);
        break;
      case OCPIButtonAction.PULL_LOCATIONS:
        this.pullLocationsOcpiEndpoint(ocpiEndpoint);
        break;
      case OCPIButtonAction.PULL_SESSIONS:
        this.pullSessionsOcpiEndpoint(ocpiEndpoint);
        break;
      case OCPIButtonAction.PULL_TOKENS:
        this.pullTokensOcpiEndpoint(ocpiEndpoint);
        break;
      case OCPIButtonAction.CHECK_CDRS:
        this.checkCdrsOcpiEndpoint(ocpiEndpoint);
        break;
      case OCPIButtonAction.CHECK_SESSIONS:
        this.checkSessionsOcpiEndpoint(ocpiEndpoint);
        break;
      case OCPIButtonAction.CHECK_LOCATIONS:
        this.checkLocationsOcpiEndpoint(ocpiEndpoint);
        break;
      case ButtonAction.START:
        this.enableDisableBackgroundJob(ocpiEndpoint, true);
        break;
      case ButtonAction.STOP:
        this.enableDisableBackgroundJob(ocpiEndpoint, false);
        break;
    }
  }

  private pushEVSEStatusesOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.push_evse_statuses_title'),
        this.translateService.instant('ocpiendpoints.push_evse_statuses_confirm', {
          name: ocpiendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.sendEVSEStatusesOcpiEndpoint(ocpiendpoint).subscribe({
            next: (response) => {
              if (response.status === Constants.REST_RESPONSE_SUCCESS) {
                this.messageService.showInfoMessage('ocpiendpoints.push_evse_statuses_success', {
                  success: response.success,
                });
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.push_evse_statuses_error'
                );
              }
              // Reload data
              this.refreshData().subscribe();
            },
            error: (error) => {
              switch (error.status) {
                // Hash no longer valid
                case HTTPError.CANNOT_ACQUIRE_LOCK:
                  this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'ocpiendpoints.push_evse_statuses_error'
                  );
              }
              // Reload data
              this.refreshData().subscribe();
            },
          });
        }
      });
  }

  private pushTokensOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.push_tokens_title'),
        this.translateService.instant('ocpiendpoints.push_tokens_confirm', {
          name: ocpiendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.sendTokensOcpiEndpoint(ocpiendpoint).subscribe({
            next: (response) => {
              if (response.status === Constants.REST_RESPONSE_SUCCESS) {
                this.messageService.showInfoMessage('ocpiendpoints.push_tokens_success');
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.push_tokens_error'
                );
              }
              // Reload data
              this.refreshData().subscribe();
            },
            error: (error) => {
              switch (error.status) {
                // Hash no longer valid
                case HTTPError.CANNOT_ACQUIRE_LOCK:
                  this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'ocpiendpoints.push_tokens_error'
                  );
              }
              // Reload data
              this.refreshData().subscribe();
            },
          });
        }
      });
  }

  private pullLocationsOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.pull_locations_title'),
        this.translateService.instant('ocpiendpoints.pull_locations_confirm', {
          name: ocpiendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.pullLocationsOcpiEndpoint(ocpiendpoint).subscribe({
            next: (response) => {
              if (response.status === Constants.REST_RESPONSE_SUCCESS) {
                this.messageService.showInfoMessage('ocpiendpoints.pull_locations_success');
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.pull_locations_error'
                );
              }
              // Reload data
              this.refreshData().subscribe();
            },
            error: (error) => {
              switch (error.status) {
                // Hash no longer valid
                case HTTPError.CANNOT_ACQUIRE_LOCK:
                  this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'ocpiendpoints.pull_locations_error'
                  );
              }
              // Reload data
              this.refreshData().subscribe();
            },
          });
        }
      });
  }

  private pullSessionsOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.get_sessions_title'),
        this.translateService.instant('ocpiendpoints.get_sessions_confirm', {
          name: ocpiendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.pullSessionsOcpiEndpoint(ocpiendpoint).subscribe({
            next: (response) => {
              if (response.status === Constants.REST_RESPONSE_SUCCESS) {
                this.messageService.showInfoMessage('ocpiendpoints.get_sessions_success');
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.get_sessions_error'
                );
              }
              // Reload data
              this.refreshData().subscribe();
            },
            error: (error) => {
              switch (error.status) {
                // Hash no longer valid
                case HTTPError.CANNOT_ACQUIRE_LOCK:
                  this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'ocpiendpoints.get_sessions_error'
                  );
              }
              // Reload data
              this.refreshData().subscribe();
            },
          });
        }
      });
  }

  private pullTokensOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.pull_tokens_title'),
        this.translateService.instant('ocpiendpoints.pull_tokens_confirm', {
          name: ocpiendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.pullTokensOcpiEndpoint(ocpiendpoint).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                this.messageService.showInfoMessage('ocpiendpoints.pull_tokens_success', {
                  success: response.success,
                });
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.pull_tokens_error'
                );
              }
              // Reload data
              this.refreshData().subscribe();
            },
            error: (error) => {
              switch (error.status) {
                // Hash no longer valid
                case HTTPError.CANNOT_ACQUIRE_LOCK:
                  this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'ocpiendpoints.pull_tokens_error'
                  );
              }
              // Reload data
              this.refreshData().subscribe();
            },
          });
        }
      });
  }

  private checkLocationsOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.check_locations_title'),
        this.translateService.instant('ocpiendpoints.check_locations_confirm', {
          name: ocpiendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.checkLocationsOcpiEndpoint(ocpiendpoint).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                this.messageService.showInfoMessage('ocpiendpoints.check_locations_success', {
                  success: response.success,
                });
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.check_locations_error'
                );
              }
              // Reload data
              this.refreshData().subscribe();
            },
            error: (error) => {
              switch (error.status) {
                // Hash no longer valid
                case HTTPError.CANNOT_ACQUIRE_LOCK:
                  this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'ocpiendpoints.check_locations_error'
                  );
              }
              // Reload data
              this.refreshData().subscribe();
            },
          });
        }
      });
  }

  private checkSessionsOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.check_sessions_title'),
        this.translateService.instant('ocpiendpoints.check_sessions_confirm', {
          name: ocpiendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.checkSessionsOcpiEndpoint(ocpiendpoint).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                this.messageService.showInfoMessage('ocpiendpoints.check_sessions_success');
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.check_sessions_error'
                );
              }
              // Reload data
              this.refreshData().subscribe();
            },
            error: (error) => {
              switch (error.status) {
                // Hash no longer valid
                case HTTPError.CANNOT_ACQUIRE_LOCK:
                  this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'ocpiendpoints.check_sessions_error'
                  );
              }
              // Reload data
              this.refreshData().subscribe();
            },
          });
        }
      });
  }

  private checkCdrsOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.check_cdrs_title'),
        this.translateService.instant('ocpiendpoints.check_cdrs_confirm', {
          name: ocpiendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.checkCdrsOcpiEndpoint(ocpiendpoint).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                this.messageService.showInfoMessage('ocpiendpoints.check_cdrs_success');
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.check_cdrs_error'
                );
              }
              // Reload data
              this.refreshData().subscribe();
            },
            error: (error) => {
              switch (error.status) {
                // Hash no longer valid
                case HTTPError.CANNOT_ACQUIRE_LOCK:
                  this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'ocpiendpoints.check_cdrs_error'
                  );
              }
              // Reload data
              this.refreshData().subscribe();
            },
          });
        }
      });
  }

  private pullCdrsOcpiEndpoint(ocpiendpoint: OCPIEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('ocpiendpoints.pull_cdrs_title'),
        this.translateService.instant('ocpiendpoints.pull_cdrs_confirm', {
          name: ocpiendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          this.centralServerService.pullCdrsOcpiEndpoint(ocpiendpoint).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                this.messageService.showInfoMessage('ocpiendpoints.pull_cdrs_success', {
                  success: response.success,
                });
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.pull_cdrs_error'
                );
              }
              // Reload data
              this.refreshData().subscribe();
            },
            error: (error) => {
              switch (error.status) {
                // Hash no longer valid
                case HTTPError.CANNOT_ACQUIRE_LOCK:
                  this.messageService.showWarningMessage('ocpiendpoints.ocpi_action_in_progress');
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'ocpiendpoints.pull_cdrs_error'
                  );
              }
              // Reload data
              this.refreshData().subscribe();
            },
          });
        }
      });
  }

  private enableDisableBackgroundJob(ocpiendpoint: OCPIEndpoint, enable: boolean) {
    // update it with dialog
    this.dialogService
      .createAndShowYesNoDialog(
        enable
          ? this.translateService.instant('ocpiendpoints.start_background_job_title')
          : this.translateService.instant('ocpiendpoints.stop_background_job_title'),
        enable
          ? this.translateService.instant('ocpiendpoints.start_background_job_confirm', {
            name: ocpiendpoint.name,
          })
          : this.translateService.instant('ocpiendpoints.stop_background_job_confirm', {
            name: ocpiendpoint.name,
          })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          // Switch background job state
          ocpiendpoint.backgroundPatchJob = enable;
          this.centralServerService.updateOcpiEndpoint(ocpiendpoint).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                if (ocpiendpoint.backgroundPatchJob) {
                  this.messageService.showSuccessMessage('ocpiendpoints.background_job_activated');
                } else {
                  this.messageService.showSuccessMessage(
                    'ocpiendpoints.background_job_deactivated'
                  );
                }
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'ocpiendpoints.update_error'
                );
              }
              this.refreshData().subscribe();
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'ocpiendpoints.update_error'
              );
            },
          });
        }
      });
  }
}
