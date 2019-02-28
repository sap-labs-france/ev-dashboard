import { TranslateService } from '@ngx-translate/core';
import { ActionResponse, Charger, Connector, TableActionDef, TableColumnDef, TableDef, User } from '../../../common.types';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { CentralServerService } from '../../../services/central-server.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material';
import { ConfigService } from '../../../services/config.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { DialogService } from '../../../services/dialog.service';
import { ConnectorAvailibilityComponent } from '../cell-content-components/connector-availibility.component';
import { AppConnectorTypePipe } from '../../../shared/formatters/app-connector-type.pipe';
import { AppConnectorErrorCodePipe } from '../../../shared/formatters/app-connector-error-code.pipe';
import { ConnectorCellComponent } from '../../../shared/component/connector/connector-cell.component';
import { LocaleService } from '../../../services/locale.service';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { SpinnerService } from '../../../services/spinner.service';
import { InstantPowerProgressBarComponent } from '../cell-content-components/instant-power-progress-bar.component';
import { AuthorizationService } from '../../../services/authorization-service';
import { TableStartAction } from '../../../shared/table/actions/table-start-action';
import { TableStopAction } from '../../../shared/table/actions/table-stop-action';
import { TableNoAction } from '../../../shared/table/actions/table-no-action';
import { Utils } from '../../../utils/Utils';
import { Constants } from '../../../utils/Constants';
import { BUTTON_FOR_MYSELF, BUTTON_SELECT_USER, StartTransactionDialogComponent } from './start-transaction-dialog-component';
import { UsersDialogComponent } from '../../../shared/dialogs/users/users-dialog-component';
import { TableOpenAction } from '../../../shared/table/actions/table-open-action';
import { SessionDialogComponent } from '../../../shared/dialogs/session/session-dialog-component';
import { ConnectorConsumptionChartDetailComponent } from './consumption-chart-detail.component';
import { SessionDetailComponent } from '../cell-content-components/session-detail.component';
import { TableDataSource } from 'app/shared/table/table-data-source';

export class ConnectorsDataSource extends TableDataSource<Connector> {

  public stopAction = new TableStopAction();
  public noAction = new TableNoAction();
  public startAction = new TableStartAction();
  public openAction = new TableOpenAction();

  private charger: Charger;
  private connectorTransactionAuthorization;
  private dialogRefSession: MatDialogRef<SessionDialogComponent>;
  private isInitialized = false;

  private transactionConsumptions = {};

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
    private dialogService: DialogService) {
    super();
    this.noAction.getActionDef().disabled = true;
  }

  public loadData() {
    // Set number of records
    this.setNumberOfRecords(this.getData().length);
    // Return connector
    if (this.charger) {
      // Check authorizations
      this.centralServerService.getIsAuthorized('StopTransaction', this.charger.id).subscribe((result) => {
        this.connectorTransactionAuthorization = result;
        // Update authorization on individual connectors
        for (let index = 0; index < this.connectorTransactionAuthorization.length; index++) {
          this.charger.connectors[index].isStopAuthorized = this.connectorTransactionAuthorization[index].IsAuthorized;
        }
        this.setData(this.charger.connectors);
        // Update specific row actions
        if (this.formattedData) {
          this.formattedData.forEach(row => {
            row.specificRowActions = this.specificRowActions(row['data']);
          });
        }
        let hasSomeDetails = false;
        // Check connectors details status
        this.getData().forEach((connector: Connector) => {
          // If user can stop transaction he can also see details except user demo that can also see details
          connector.hasDetails = connector.activeTransactionID > 0 &&
            (this.charger.connectors[connector.connectorId - 1].isStopAuthorized || this.authorizationService.isDemo());
          if (connector.hasDetails) {
            hasSomeDetails = true;
          }
        });
        this._displayDetailsColumns.next(hasSomeDetails);
        this.isInitialized = true;
      }, (error) => {
        // Authorization issue!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('general.error_backend'));
      });
    }
  }

  public setCharger(charger: Charger) {
    this.charger = charger;
  }

  setDetailedDataSource(row, autoRefresh = false) {
    if (autoRefresh) {
      if (this.dialogRefSession && this.dialogRefSession.componentInstance) {
        this.dialogRefSession.componentInstance.refresh();
      }
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
      rowDetails: {
        enabled: true,
        isDetailComponent: true,
        detailComponentName: ConnectorConsumptionChartDetailComponent,
        hideShowField: 'hasDetails'
      },
      rowFieldNameIdentifier: 'connectorId',
      isSimpleTable: true,
      design: {
        flat: true
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'connectorId',
        name: 'chargers.connector',
        sortable: false,
        headerClass: 'text-center',
        class: 'd-flex justify-content-center',
        isAngularComponent: true,
        angularComponentName: ConnectorCellComponent
      },
      {
        id: 'status',
        name: 'chargers.connector_status',
        headerClass: 'text-center',
        class: '',
        isAngularComponent: true,
        angularComponentName: ConnectorAvailibilityComponent,
        sortable: false
      },
      {
        id: 'currentConsumption',
        name: 'transactions.current_consumption',
        headerClass: 'text-center',
        class: 'text-center',
        isAngularComponent: true,
        angularComponentName: InstantPowerProgressBarComponent,
        sortable: false
      },
      /*      {
              id: 'sessionDetails',
              name: 'chargers.session_details',
              isAngularComponent: true,
              angularComponentName: SessionDetailComponent,
              sortable: false
            },*/
      {
        id: 'totalConsumption',
        name: 'transactions.total_consumption',
        formatter: (value) => this.appUnitPipe.transform(value, 'Wh', 'kWh'),
        sortable: false
      },
/*      {
        id: 'type',
        name: 'chargers.connector_type',
        headerClass: 'text-center',
        class: 'text-center',
        formatter: (type) => {
          const imageUrl = new AppConnectorTypePipe().transform(type, true);
          return `<img class="charger-connector-type" src="${imageUrl}"/>`;
        },
        sortable: false
      },*/
      {
        id: 'errorCode',
        name: 'chargers.connector_error_title',
        formatter: (errorCode) => {
          return new AppConnectorErrorCodePipe(this.translateService).transform(errorCode);
        },
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

  public getTableRowActions(rowItem: Connector): TableActionDef[] {
    if (rowItem && !this.charger.inactive) {
      // Check active transaction and authorization to stop
      if (rowItem && rowItem.activeTransactionID &&
        this.connectorTransactionAuthorization &&
        this.connectorTransactionAuthorization[rowItem.connectorId - 1].IsAuthorized) {
        if (this.connectorTransactionAuthorization &&
          this.connectorTransactionAuthorization[rowItem.connectorId - 1].IsAuthorized &&
          (this.authorizationService.isAdmin() || this.authorizationService.isDemo())) {
          return [
            new TableOpenAction().getActionDef(),
            this.stopAction.getActionDef()
          ];
        } else {
          return [
            this.stopAction.getActionDef()
          ];
        }
      }
    }
    // By default no actions
    return [
      this.startAction.getActionDef()
      //      this.noAction.getActionDef()
    ];
  }

  specificRowActions(rowItem): TableActionDef[] {
    if (rowItem && rowItem.activeTransactionID) {
      // check if Authorized or is Admin
      if ((this.connectorTransactionAuthorization && this.connectorTransactionAuthorization[rowItem.connectorId - 1].IsAuthorized)
           || this.authorizationService.isAdmin()) {
        return [
          new TableOpenAction().getActionDef(),
          this.stopAction.getActionDef()
        ];
      }
      // Demo can display transaction details only
      if (this.authorizationService.isDemo()) {
        return [
          new TableOpenAction().getActionDef()
        ];
      } else {
        // No authorization to stop or display details
        return [];
      }
    }

    // default action is start except for demo
    if (this.authorizationService.isDemo()) {
      return [];
    } else {
      return [
        this.startAction.getActionDef()
      ];
    }
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: Connector) {
    switch (actionDef.id) {
      case 'start':
        if (rowItem.status === 'Available' && !this.charger.inactive) {
          if (this.authorizationService.isAdmin()) {
            // Admin can start transaction for themself or any other user
            this._startTransactionAsAdmin(rowItem)
          } else {
            this._startTransactionFor(rowItem, this.centralServerService.getLoggedUser());
          }
        } else {
          if (rowItem.status !== 'Available') {
            this.dialogService.createAndShowOkDialog(this.dialog,
              this.translateService.instant('chargers.action_error.transaction_start_title'),
              this.translateService.instant('chargers.action_error.transaction_start_not_available'));
          } else if (this.charger.inactive) {
            this.dialogService.createAndShowOkDialog(this.dialog,
              this.translateService.instant('chargers.action_error.transaction_start_title'),
              this.translateService.instant('chargers.action_error.transaction_start_charger_inactive'));
          }
        }
        break;
      case 'open':
        if ((this.connectorTransactionAuthorization &&
          this.connectorTransactionAuthorization[rowItem.connectorId - 1].IsAuthorized)
          || this.authorizationService.isDemo() || this.authorizationService.isAdmin()) {
          this._openSession(rowItem);
        } else {
          this.dialogService.createAndShowOkDialog(this.dialog,
            this.translateService.instant('chargers.action_error.session_details_title'),
            this.translateService.instant('chargers.action_error.session_details_not_authorized'));
        }
        break;
      case 'stop':
        // check authorization
        if (rowItem && rowItem.activeTransactionID &&
          this.connectorTransactionAuthorization &&
          this.connectorTransactionAuthorization[rowItem.connectorId - 1].IsAuthorized) {
          this.dialogService.createAndShowYesNoDialog(
            this.dialog,
            this.translateService.instant('chargers.stop_transaction_title'),
            this.translateService.instant('chargers.stop_transaction_confirm', { 'chargeBoxID': this.charger.id })
          ).subscribe((response) => {
            if (response === Constants.BUTTON_TYPE_YES) {
              this.centralServerService.stationStopTransaction(
                // tslint:disable-next-line:no-shadowed-variable
                this.charger.id, rowItem.activeTransactionID).subscribe((response: ActionResponse) => {
                  this.messageService.showSuccessMessage(
                    this.translateService.instant('chargers.stop_transaction_success', { 'chargeBoxID': this.charger.id }));
                }, (error) => {
                  Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                    this.translateService.instant('chargers.stop_transaction_error'));
                });
            }
          });
        } else {
          this.dialogService.createAndShowOkDialog(this.dialog,
            this.translateService.instant('chargers.action_error.transaction_stop_title'),
            this.translateService.instant('chargers.action_error.transaction_stop_not_authorized'));
        }
        break;
      case 'more':
        break;
      default:
    }
  }

  /*  public rowHasDetails(row: Connector) {
      return row.activeTransactionID > 0;
    }*/

  /**
   * _startTransactionFor(connector: Connector, user: User)
   * */
  public _startTransactionFor(connector: Connector, user: User): boolean {
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('chargers.start_transaction_title'),
      this.translateService.instant('chargers.start_transaction_confirm', { 'chargeBoxID': this.charger.id, 'userName': user.name })
    ).subscribe((response) => {
      if (response === Constants.BUTTON_TYPE_YES) {
        // To DO a selection of the badge to use??
        this.centralServerService.stationStartTransaction(
          // tslint:disable-next-line:no-shadowed-variable
          this.charger.id, connector.connectorId, user.tagIDs[0]).subscribe((response: ActionResponse) => {
            this.messageService.showSuccessMessage(
              this.translateService.instant('chargers.start_transaction_success', { 'chargeBoxID': this.charger.id }));
            this.loadData();
            return true;
          }, (error) => {
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              this.translateService.instant('chargers.start_transaction_error'));
            return false;
          });
      }
      return false;
    });
    return false;
  }

  private _startTransactionAsAdmin(connector: Connector): boolean {
    // Create dialog data
    const dialogConfig = new MatDialogConfig();
    // Set data
    dialogConfig.data = {
      title: 'chargers.start_transaction_admin_title',
      message: 'chargers.start_transaction_admin_message'
    };
    // Show
    const dialogRef = this.dialog.open(StartTransactionDialogComponent, dialogConfig);
    // Register
    dialogRef.afterClosed().subscribe((buttonId) => {
      switch (buttonId) {
        case BUTTON_FOR_MYSELF:
          return this._startTransactionFor(connector, this.centralServerService.getLoggedUser());
        case BUTTON_SELECT_USER:
          // Show select user dialog
          dialogConfig.data = {
            title: 'chargers.start_transaction_user_select_title',
            validateButtonTitle: 'chargers.start_transaction_user_select_button'
          }
          const dialogRef2 = this.dialog.open(UsersDialogComponent, dialogConfig);
          // Add sites
          dialogRef2.afterClosed().subscribe(data => {
            if (data && data.length > 0) {
              return this._startTransactionFor(connector, data[0].objectRef)
            }
          });
          break;
        default:
          break;
      }
    })
    return false;

  }

  private _openSession(connector: Connector) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.height = '80vh';
    dialogConfig.width = '80vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      transactionId: connector.activeTransactionID,
      siteArea: this.charger.siteArea,
      connector: connector,
    };
    // Open
    this.dialogRefSession = this.dialog.open(SessionDialogComponent, dialogConfig);
    this.dialogRefSession.afterClosed().subscribe(() => this.loadData());
  }
}
