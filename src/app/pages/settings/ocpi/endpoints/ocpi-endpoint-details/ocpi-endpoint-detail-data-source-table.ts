import { TranslateService } from '@ngx-translate/core';
import { ActionResponse, Ocpiendpoint, OcpiendpointDetail, TableActionDef, TableColumnDef, TableDef, User } from 'app/common.types';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app//shared/table/actions/table-refresh-action';
import { CentralServerService } from 'app/services/central-server.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
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
import { SessionDialogComponent } from 'app/shared/dialogs/session/session-dialog-component';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Injectable } from '@angular/core';
import { OcpiendpointPatchJobStatusComponent } from '../formatters/ocpi-endpoint-patch-job-status.component';

@Injectable()
export class OcpiendpointDetailDataSource extends TableDataSource<OcpiendpointDetail> {

  public noAction = new TableNoAction();
  public sendEvseStatusesAction = new TableSendAction();

  private ocpiendpoint: Ocpiendpoint;
  private isInitialized = false;

  constructor(private configService: ConfigService,
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
    this.noAction.getActionDef().disabled = true;
  }

  public loadData() {
    // Set number of records
    this.setNumberOfRecords(this.getData().length);
    // Return connector
    if (this.ocpiendpoint) {
      setTimeout(() => {
        const ocpiendpointDetail = <OcpiendpointDetail> {
          id: this.ocpiendpoint.id,
          ocpiendpoint: this.ocpiendpoint,
          successNbr: this.ocpiendpoint.lastPatchJobResult ? this.ocpiendpoint.lastPatchJobResult.successNbr : 0,
          failureNbr: this.ocpiendpoint.lastPatchJobResult ? this.ocpiendpoint.lastPatchJobResult.failureNbr : 0,
          totalNbr: this.ocpiendpoint.lastPatchJobResult ? this.ocpiendpoint.lastPatchJobResult.totalNbr : 0,
          lastPatchJobOn: this.ocpiendpoint.lastPatchJobOn ? this.ocpiendpoint.lastPatchJobOn : null
        }
        this.setData([ocpiendpointDetail]);
        // this.setNumberOfRecords(1);
        this.isInitialized = true;
      }, 1);
    }
  }

  public setEndpoint(ocpiendpoint: Ocpiendpoint) {
    this.ocpiendpoint = ocpiendpoint;
  }

  setDetailedDataSource(row, autoRefresh = false) {
    if (autoRefresh) {
      this.refreshReload(); // will call loadData
    } else {
      this.loadData();
    }
  }

  public getTableDef(): TableDef {
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
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const locale = this.localeService.getCurrentFullLocaleForJS();
    return [
      {
        id: 'patchJobStatus',
        name: 'ocpiendpoints.patchJobStatus',
        isAngularComponent: true,
        angularComponentName: OcpiendpointPatchJobStatusComponent,
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: false
      },
      {
        id: 'lastPatchJobOn',
        type: 'date',
        formatter: (lastPatchJobOn) => !!lastPatchJobOn ? this.datePipe.transform(lastPatchJobOn, locale, 'datetime') : '',
        name: 'ocpiendpoints.lastPatchJobOn',
        headerClass: 'col-30',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'desc',
        sortable: false
      },
      {
        id: 'totalNbr',
        type: 'integer',
        name: 'ocpiendpoints.totalChargePoints',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        direction: 'desc',
        sortable: false
      },
      {
        id: 'successNbr',
        type: 'integer',
        name: 'ocpiendpoints.succeeded',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        direction: 'desc',
        sortable: false
      },
      {
        id: 'failureNbr',
        type: 'integer',
        name: 'ocpiendpoints.failed',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        direction: 'desc',
        sortable: false
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [];
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableRowActions(rowItem: OcpiendpointDetail): TableActionDef[] {
    return [
      this.noAction.getActionDef()
    ];
  }

  public specificRowActions(rowItem: OcpiendpointDetail): TableActionDef[] {
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

  public rowActionTriggered(actionDef: TableActionDef, rowItem: OcpiendpointDetail) {
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
          this.loadData();
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'ocpiendpoints.error_send_evse_statuses');
          // reload data
          this.loadData();
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
      this.loadData();
    }, (error) => {
      this.spinnerService.hide();
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
        'ocpiendpoints.update_error');
    });
  }

}
