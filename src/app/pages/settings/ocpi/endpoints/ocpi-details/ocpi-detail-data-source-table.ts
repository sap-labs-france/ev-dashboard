import { TranslateService } from '@ngx-translate/core';
import { OcpiEndpoint, OcpiEndpointDetail, TableActionDef, TableColumnDef, TableDef } from 'app/common.types';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app//shared/table/actions/table-refresh-action';
import { CentralServerService } from 'app/services/central-server.service';
import { Router } from '@angular/router';
import { MessageService } from 'app/services/message.service';
import { DialogService } from 'app/services/dialog.service';
import { LocaleService } from 'app/services/locale.service';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { TableStartAction } from 'app/shared/table/actions/table-start-action';
import { TableStopAction } from 'app/shared/table/actions/table-stop-action';
import { TableSendAction } from 'app/shared/table/actions/table-send-action';
import { Utils } from 'app/utils/Utils';
import { Constants } from 'app/utils/Constants';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Injectable } from '@angular/core';
import { OcpiDetailJobStatusComponent } from '../formatters/ocpi-detail-job-status.component';
import { OcpiDetailTotalEvsesStatusComponent } from '../formatters/ocpi-detail-total-evses-status.component';
import { OcpiDetailSuccessEvsesStatusComponent } from '../formatters/ocpi-detail-success-evses-status.component';
import { OcpiDetailFailureEvsesStatusComponent } from '../formatters/ocpi-detail-failure-evses-status.component';
import { Observable } from 'rxjs';
import { SpinnerService } from 'app/services/spinner.service';

@Injectable()
export class OcpiEndpointDetailDataSource extends TableDataSource<OcpiEndpointDetail> {
  private ocpiEndpoint: OcpiEndpoint;
  private startAction = new TableStartAction().getActionDef();
  private stopAction = new TableStopAction().getActionDef();
  private sendAction = new TableSendAction().getActionDef();

  constructor(
      public spinnerService: SpinnerService,
      private centralServerService: CentralServerService,
      private translateService: TranslateService,
      private localeService: LocaleService,
      private messageService: MessageService,
      private router: Router,
      private dialogService: DialogService,
      private datePipe: AppDatePipe) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
      // Return connector
      let ocpiEndpointDetail;
      if (this.ocpiEndpoint) {
        // Set
        ocpiEndpointDetail = <OcpiEndpointDetail> {
          id: this.ocpiEndpoint.id,
          ocpiendpoint: this.ocpiEndpoint,
          successNbr: this.ocpiEndpoint.lastPatchJobResult ? this.ocpiEndpoint.lastPatchJobResult.successNbr : 0,
          failureNbr: this.ocpiEndpoint.lastPatchJobResult ? this.ocpiEndpoint.lastPatchJobResult.failureNbr : 0,
          totalNbr: this.ocpiEndpoint.lastPatchJobResult ? this.ocpiEndpoint.lastPatchJobResult.totalNbr : 0,
          lastPatchJobOn: this.ocpiEndpoint.lastPatchJobOn ? this.ocpiEndpoint.lastPatchJobOn : null
        }
        // Ok
        this.setTotalNumberOfRecords(1);
        observer.next([ocpiEndpointDetail]);
        observer.complete();
      }
    });
  }

  public setEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.ocpiEndpoint = ocpiendpoint;
  }

  public buildTableDef(): TableDef {
    return {
      class: 'table-detailed-list',
      rowSelection: {
        enabled: false
      },
      footer: {
        enabled: false
      },
      search: {
        enabled: false
      },
      isSimpleTable: true,
      design: {
        flat: true
      },
      hasDynamicRowAction: true
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const locale = this.localeService.getCurrentFullLocaleForJS();
    return [
      {
        id: 'patchJobStatus',
        name: 'ocpiendpoints.patchJobStatus',
        isAngularComponent: true,
        angularComponent: OcpiDetailJobStatusComponent,
        headerClass: 'text-center',
        class: '',
        sortable: false
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
        sortable: false
      },
      {
        id: 'totalNbr',
        type: 'integer',
        name: 'ocpiendpoints.totalChargePoints',
        isAngularComponent: true,
        angularComponent: OcpiDetailTotalEvsesStatusComponent,
        headerClass: 'text-center col-10p',
        class: '',
        sorted: false
      },
      {
        id: 'successNbr',
        type: 'integer',
        name: 'ocpiendpoints.succeeded',
        isAngularComponent: true,
        angularComponent: OcpiDetailSuccessEvsesStatusComponent,
        headerClass: 'text-center col-10p',
        class: '',
        sorted: false
      },
      {
        id: 'failureNbr',
        type: 'integer',
        name: 'ocpiendpoints.failed',
        isAngularComponent: true,
        angularComponent: OcpiDetailFailureEvsesStatusComponent,
        headerClass: 'text-center col-10p',
        class: '',
        sorted: false
      }
    ];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public buildTableDynamicRowActions(rowItem: OcpiEndpointDetail): TableActionDef[] {
    const _actionRowButtons = [];
    if (rowItem && rowItem.ocpiendpoint) {
      // add send all EVSE Statuses
      _actionRowButtons.push(this.sendAction);
      // Check is background job is active for the ocpi endpoint
      if (rowItem.ocpiendpoint.backgroundPatchJob) {
        _actionRowButtons.push(this.stopAction);
      } else {
        _actionRowButtons.push(this.startAction);
      }
    }
    return _actionRowButtons;
  }

  public actionTriggered(actionDef: TableActionDef) {
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: OcpiEndpointDetail) {
    switch (actionDef.id) {
      case 'send':
        this.sendEVSEStatusesOcpiEndpoint(rowItem.ocpiendpoint);
        break;
      case 'start':
        this.enableDisableBackgroundJob(rowItem.ocpiendpoint, true);
        break;
      case 'stop':
        this.enableDisableBackgroundJob(rowItem.ocpiendpoint, false);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  private sendEVSEStatusesOcpiEndpoint(ocpiendpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.sendEVSEStatuses_title'),
      this.translateService.instant('ocpiendpoints.sendEVSEStatuses_confirm', { 'name': ocpiendpoint.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        // Ping
        this.centralServerService.sendEVSEStatusesOcpiEndpoint(ocpiendpoint).subscribe(response => {
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

  private enableDisableBackgroundJob(ocpiendpoint, enable: boolean) {
    // switch background job state
    ocpiendpoint.backgroundPatchJob = enable;
    // update it with dialog
    this.dialogService.createAndShowYesNoDialog(
      (enable)  ? this.translateService.instant('ocpiendpoints.start_background_job_title')
                : this.translateService.instant('ocpiendpoints.stop_background_job_title'),
      (enable)  ? this.translateService.instant('ocpiendpoints.start_background_job_confirm', { 'name': ocpiendpoint.name })
                : this.translateService.instant('ocpiendpoints.stop_background_job_confirm', { 'name': ocpiendpoint.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.centralServerService.updateOcpiEndpoint(ocpiendpoint).subscribe(response => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
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
