import { TranslateService } from '@ngx-translate/core';
import { OcpiEndpoint, OcpiEndpointDetail, TableActionDef, TableColumnDef, TableDef } from 'app/common.types';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app//shared/table/actions/table-refresh-action';
import { CentralServerService } from 'app/services/central-server.service';
import { MatDialog } from '@angular/material';
import { ConfigService } from 'app/services/config.service';
import { Router } from '@angular/router';
import { MessageService } from 'app/services/message.service';
import { DialogService } from 'app/services/dialog.service';
import { LocaleService } from 'app/services/locale.service';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { SpinnerService } from 'app/services/spinner.service';
import { AuthorizationService } from 'app/services/authorization-service';
import { TableStartAction } from 'app/shared/table/actions/table-start-action';
import { TableStopAction } from 'app/shared/table/actions/table-stop-action';
import { TableNoAction } from 'app/shared/table/actions/table-no-action';
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

@Injectable()
export class OcpiendpointDetailDataSource extends TableDataSource<OcpiEndpointDetail> {

  public sendEvseStatusesAction = new TableSendAction();

  private ocpiendpoint: OcpiEndpoint;
  private isInitialized = false;

  constructor(
      private configService: ConfigService,
      private centralServerService: CentralServerService,
      private translateService: TranslateService,
      private localeService: LocaleService,
      private appUnitPipe: AppUnitPipe,
      private dialog: MatDialog,
      private authorizationService: AuthorizationService,
      private spinnerService: SpinnerService,
      private messageService: MessageService,
      private router: Router,
      private dialogService: DialogService,
      private datePipe: AppDatePipe) {
    super();
    // Init
    this.initDataSource();
  }

  public loadData(refreshAction = false): Observable<any> {
    return new Observable((observer) => {
      // Set number of records
      this.setTotalNumberOfRecords(this.getData().length);
      // Return connector
      if (this.ocpiendpoint) {
        setTimeout(() => {
          const ocpiendpointDetail = <OcpiEndpointDetail> {
            id: this.ocpiendpoint.id,
            ocpiendpoint: this.ocpiendpoint,
            successNbr: this.ocpiendpoint.lastPatchJobResult ? this.ocpiendpoint.lastPatchJobResult.successNbr : 0,
            failureNbr: this.ocpiendpoint.lastPatchJobResult ? this.ocpiendpoint.lastPatchJobResult.failureNbr : 0,
            totalNbr: this.ocpiendpoint.lastPatchJobResult ? this.ocpiendpoint.lastPatchJobResult.totalNbr : 0,
            lastPatchJobOn: this.ocpiendpoint.lastPatchJobOn ? this.ocpiendpoint.lastPatchJobOn : null
          }
          // Ok
          observer.next(ocpiendpointDetail);
          observer.complete();
          // this.setTotalNumberOfRecords(1);
          this.isInitialized = true;
        }, 1);
      }
    });
  }

  public setEndpoint(ocpiendpoint: OcpiEndpoint) {
    this.ocpiendpoint = ocpiendpoint;
  }

  setDetailedDataSource(row, autoRefresh = false) {
    this.loadAndPrepareData(false).subscribe();
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
        formatter: (lastPatchJobOn) => !!lastPatchJobOn ? this.datePipe.transform(lastPatchJobOn, locale, 'datetime') : '',
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

  public buildTableActionsDef(): TableActionDef[] {
    return [];
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
      _actionRowButtons.push(new TableSendAction().getActionDef());
      // Check is background job is active for the ocpi endpoint
      if (rowItem.ocpiendpoint.backgroundPatchJob) {
        _actionRowButtons.push(new TableStopAction().getActionDef());
      } else {
        _actionRowButtons.push(new TableStartAction().getActionDef());
      }
    }

    // return
    return _actionRowButtons;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: OcpiEndpointDetail) {
    switch (actionDef.id) {
      case 'send':
        this._sendEVSEStatusesOcpiendpoint(rowItem.ocpiendpoint);
        break;
      case 'start':
        this._enableDisableBackgroundJob(rowItem.ocpiendpoint, true);
        break;
      case 'stop':
        this._enableDisableBackgroundJob(rowItem.ocpiendpoint, false);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  private _sendEVSEStatusesOcpiendpoint(ocpiendpoint) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('ocpiendpoints.sendEVSEStatuses_title'),
      this.translateService.instant('ocpiendpoints.sendEVSEStatuses_confirm', { 'name': ocpiendpoint.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        // Show
        this.spinnerService.show();
        // Ping
        this.centralServerService.sendEVSEStatusesOcpiendpoint(ocpiendpoint).subscribe(response => {
          this.spinnerService.hide();
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
          this.loadAndPrepareData(false).subscribe();
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.error_send_evse_statuses');
          // reload data
          this.loadAndPrepareData(false).subscribe();
        });
      }
    });
  }

  private _enableDisableBackgroundJob(ocpiendpoint, enable: boolean) {
    // switch background job state
    ocpiendpoint.backgroundPatchJob = enable;
    // update it
    this.centralServerService.updateOcpiendpoint(ocpiendpoint).subscribe(response => {
      this.spinnerService.hide();
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
      this.loadAndPrepareData(false).subscribe();
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'ocpiendpoints.update_error');
    });
  }

}
