import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../../services/central-server.service';
import { DialogService } from '../../../../../services/dialog.service';
import { MessageService } from '../../../../../services/message.service';
import { SpinnerService } from '../../../../../services/spinner.service';
import { AppDatePipe } from '../../../../../shared/formatters/app-date.pipe';
import { TableAutoRefreshAction } from '../../../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../../../shared/table/actions/table-more-action';
import { TableRefreshAction } from '../../../../../shared/table/actions/table-refresh-action';
import { TableStartAction } from '../../../../../shared/table/actions/table-start-action';
import { TableStopAction } from '../../../../../shared/table/actions/table-stop-action';
import { TableUploadAction } from '../../../../../shared/table/actions/table-upload-action';
import { TableDataSource } from '../../../../../shared/table/table-data-source';
import { DataResult } from '../../../../../types/DataResult';
import { ButtonAction, RestResponse } from '../../../../../types/GlobalType';
import {
  OicpButtonAction,
  OicpEndpoint,
  OicpEndpointDetail,
  OicpRole,
} from '../../../../../types/oicp/OICPEndpoint';
import { TableActionDef, TableColumnDef, TableDef } from '../../../../../types/Table';
import { Utils } from '../../../../../utils/Utils';
import { OicpDetailFailureEvsesStatusFormatterComponent } from '../formatters/oicp-detail-failure-evses-status-formatter.component';
import { OicpDetailJobStatusFormatterComponent } from '../formatters/oicp-detail-job-status-formatter.component';
import { OicpDetailSuccessEvsesStatusFormatterComponent } from '../formatters/oicp-detail-success-evses-status-formatter.component';
import { OicpDetailTotalEvsesStatusFormatterComponent } from '../formatters/oicp-detail-total-evses-status-formatter.component';

@Injectable()
export class SettingsOicpEndpointsDetailsTableDataSource extends TableDataSource<OicpEndpointDetail> {
  private oicpEndpoint!: OicpEndpoint;
  private startAction = new TableStartAction().getActionDef();
  private stopAction = new TableStopAction().getActionDef();
  private pushEvsesAction = new TableUploadAction(
    OicpButtonAction.PUSH_EVSES,
    'oicp.push_evses'
  ).getActionDef();
  private pushEvseStatusesAction = new TableUploadAction(
    OicpButtonAction.PUSH_EVSE_STAUSES,
    'oicp.push_evses_statuses'
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

  public loadDataImpl(): Observable<DataResult<OicpEndpointDetail>> {
    return new Observable((observer) => {
      // Return connector
      let oicpEndpointDetail;
      if (this.oicpEndpoint) {
        // Set
        oicpEndpointDetail = {
          id: this.oicpEndpoint.id,
          oicpendpoint: this.oicpEndpoint,
          successNbr: this.oicpEndpoint.lastPatchJobResult
            ? this.oicpEndpoint.lastPatchJobResult.successNbr
            : 0,
          failureNbr: this.oicpEndpoint.lastPatchJobResult
            ? this.oicpEndpoint.lastPatchJobResult.failureNbr
            : 0,
          totalNbr: this.oicpEndpoint.lastPatchJobResult
            ? this.oicpEndpoint.lastPatchJobResult.totalNbr
            : 0,
          lastPatchJobOn: this.oicpEndpoint.lastPatchJobOn
            ? this.oicpEndpoint.lastPatchJobOn
            : null,
        } as OicpEndpointDetail;
        observer.next({
          count: 1,
          result: [oicpEndpointDetail],
        });
        observer.complete();
      }
    });
  }

  public setEndpoint(oicpendpoint: OicpEndpoint) {
    this.oicpEndpoint = oicpendpoint;
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
        name: 'oicpendpoints.patch_job_status',
        isAngularComponent: true,
        angularComponent: OicpDetailJobStatusFormatterComponent,
        headerClass: 'text-center',
        class: 'table-cell-angular-big-component',
      },
      {
        id: 'lastPatchJobOn',
        type: 'date',
        formatter: (lastPatchJobOn) =>
          !!lastPatchJobOn ? this.datePipe.transform(lastPatchJobOn) : '',
        name: 'oicpendpoints.last_patch_job_on',
        headerClass: 'col-40p',
        class: 'text-left col-40p',
        sorted: true,
        direction: 'desc',
      },
      {
        id: 'totalNbr',
        type: 'integer',
        name: this.oicpEndpoint
          ? this.oicpEndpoint.role === 'CPO'
            ? 'oicpendpoints.total_charge_points'
            : 'oicpendpoints.total_tokens'
          : 'oicpendpoints.total',
        isAngularComponent: true,
        angularComponent: OicpDetailTotalEvsesStatusFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
      },
      {
        id: 'successNbr',
        type: 'integer',
        name: 'oicpendpoints.succeeded',
        isAngularComponent: true,
        angularComponent: OicpDetailSuccessEvsesStatusFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
      },
      {
        id: 'failureNbr',
        type: 'integer',
        name: 'oicpendpoints.failed',
        isAngularComponent: true,
        angularComponent: OicpDetailFailureEvsesStatusFormatterComponent,
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component',
      },
    ];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableDynamicRowActions(rowItem: OicpEndpointDetail): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    if (rowItem && rowItem.oicpendpoint) {
      // Check is background job is active for the oicp endpoint
      if (rowItem.oicpendpoint.backgroundPatchJob) {
        rowActions.push(this.stopAction);
      } else {
        rowActions.push(this.startAction);
      }
      let syncActions: TableActionDef;
      if (rowItem.oicpendpoint.role === OicpRole.CPO) {
        syncActions = new TableMoreAction([
          this.pushEvsesAction,
          this.pushEvseStatusesAction,
        ]).getActionDef();
      } else {
        syncActions = new TableMoreAction([]).getActionDef();
      }
      rowActions.push(syncActions);
    }
    return rowActions;
  }

  public rowActionTriggered(actionDef: TableActionDef, oicpEndpointDetail: OicpEndpointDetail) {
    switch (actionDef.id) {
      case OicpButtonAction.PUSH_EVSES:
        this.pushEVSEsOicpEndpoint(oicpEndpointDetail.oicpendpoint);
        break;
      case OicpButtonAction.PUSH_EVSE_STAUSES:
        this.pushEVSEStatusesOicpEndpoint(oicpEndpointDetail.oicpendpoint);
        break;
      case ButtonAction.START:
        this.enableDisableBackgroundJob(oicpEndpointDetail.oicpendpoint, true);
        break;
      case ButtonAction.STOP:
        this.enableDisableBackgroundJob(oicpEndpointDetail.oicpendpoint, false);
        break;
    }
  }

  private pushEVSEStatusesOicpEndpoint(oicpendpoint: OicpEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('oicpendpoints.push_evse_statuses_title'),
        this.translateService.instant('oicpendpoints.push_evse_statuses_confirm', {
          name: oicpendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          // Ping
          this.centralServerService.sendEVSEStatusesOicpEndpoint(oicpendpoint).subscribe({
            next: (response) => {
              if (response.failure === 0) {
                this.messageService.showInfoMessage('oicpendpoints.push_evse_statuses_success', {
                  success: response.success,
                });
              } else if (response.failure > 0 && response.success > 0) {
                this.messageService.showWarningMessage('oicpendpoints.push_evse_statuses_partial', {
                  success: response.success,
                  error: response.failure,
                });
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'oicpendpoints.push_evse_statuses_error'
                );
              }
              // reload data
              this.refreshData().subscribe();
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'oicpendpoints.push_evse_statuses_error'
              );
              // reload data
              this.refreshData().subscribe();
            },
          });
        }
      });
  }

  private pushEVSEsOicpEndpoint(oicpendpoint: OicpEndpoint) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('oicpendpoints.push_evses_title'),
        this.translateService.instant('oicpendpoints.push_evses_confirm', {
          name: oicpendpoint.name,
        })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          // Ping
          this.centralServerService.sendEVSEsOicpEndpoint(oicpendpoint).subscribe({
            next: (response) => {
              if (response.failure === 0) {
                this.messageService.showSuccessMessage('oicpendpoints.push_evses_success', {
                  success: response.success,
                });
              } else if (response.failure > 0 && response.success > 0) {
                this.messageService.showWarningMessage('oicpendpoints.push_evses_partial', {
                  success: response.success,
                  error: response.failure,
                });
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'oicpendpoints.push_evses_error'
                );
              }
              // reload data
              this.refreshData().subscribe();
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'oicpendpoints.push_evses_error'
              );
              // reload data
              this.refreshData().subscribe();
            },
          });
        }
      });
  }

  private enableDisableBackgroundJob(oicpendpoint: OicpEndpoint, enable: boolean) {
    // update it with dialog
    this.dialogService
      .createAndShowYesNoDialog(
        enable
          ? this.translateService.instant('oicpendpoints.start_background_job_title')
          : this.translateService.instant('oicpendpoints.stop_background_job_title'),
        enable
          ? this.translateService.instant('oicpendpoints.start_background_job_confirm', {
            name: oicpendpoint.name,
          })
          : this.translateService.instant('oicpendpoints.stop_background_job_confirm', {
            name: oicpendpoint.name,
          })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          // Switch background job state
          oicpendpoint.backgroundPatchJob = enable;
          this.centralServerService.updateOicpEndpoint(oicpendpoint).subscribe({
            next: (response) => {
              if (response.status === RestResponse.SUCCESS) {
                if (oicpendpoint.backgroundPatchJob) {
                  this.messageService.showSuccessMessage('oicpendpoints.background_job_activated');
                } else {
                  this.messageService.showSuccessMessage(
                    'oicpendpoints.background_job_deactivated'
                  );
                }
              } else {
                Utils.handleError(
                  JSON.stringify(response),
                  this.messageService,
                  'oicpendpoints.update_error'
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
                'oicpendpoints.update_error'
              );
            },
          });
        }
      });
  }
}
