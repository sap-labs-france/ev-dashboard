import { TranslateService } from '@ngx-translate/core';
import { ActionResponse, Charger, Connector, TableActionDef, TableColumnDef, TableDef, User } from '../../../common.types';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { CentralServerService } from '../../../services/central-server.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { ConfigService } from '../../../services/config.service';
import { Router } from '@angular/router';
import { MessageService } from '../../../services/message.service';
import { DialogService } from '../../../services/dialog.service';
import { SimpleTableDataSource } from '../../../shared/table/simple-table/simple-table-data-source';
import { ConnectorAvailibilityComponent } from './connector-availibility.component';
import { AppConnectorTypePipe } from '../../../shared/formatters/app-connector-type.pipe';
import { AppConnectorErrorCodePipe } from '../../../shared/formatters/app-connector-error-code.pipe';
import { ConnectorCellComponent } from '../../../shared/component/connector-cell.component';
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
  }

  public loadData() {
    // Set number of records
    this.setNumberOfRecords(this.getData().length);
    // Return connector
//    this.getDataSubjet().next(this.getData());
    if (this.charger && !this.connectorTransactionAuthorization) {
      // Check authorizations
      this.centralServerService.getIsAuthorized('StopTransaction', this.charger.id).subscribe((result) => {
        this.connectorTransactionAuthorization = result;
        // Update specific row actions
        if (this.formattedData) {
          this.formattedData.forEach(row => {
            row.specificRowActions = this.specificRowActions(row['data']);
          });
        }
      }, (error) => {
        // Authorization issue!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
          this.translateService.instant('general.error_backend'));
      });
    }
    this.isInitialized = true;
    let hasSomeDetails = false;
    // Check connectors details status
    this.getData().forEach((connector: Connector) => {
      connector.hasDetails = connector.activeTransactionID > 0;
      if (connector.hasDetails) {
        hasSomeDetails = true;
      }
    });
    this.displayDetailsColumns.next(hasSomeDetails);
  }

  public setCharger(charger: Charger) {
    this.charger = charger;
  }

  setDetailedDataSource(row) {
    if (!this.isInitialized || row !== this.getData()) {
      // check that we have a ConnectorData and not a Connector
      // Load data
      this.setData(row);
      this.loadData();
    } else {
      // Only set data
      this.setData(row);
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
        headerClass: 'col-4em',
        class: 'text-center col-4em',
        sortable: false,
        isAngularComponent: true,
        angularComponentName: ConnectorCellComponent
      },
      {
        id: 'status',
        name: 'chargers.connector_status',
        headerClass: 'col-10em',
        class: 'text-center col-10em',
        isAngularComponent: true,
        angularComponentName: ConnectorAvailibilityComponent,
        sortable: false
      },
      {
        id: 'currentConsumption',
        name: 'transactions.current_consumption',
        class: 'col-9em',
        headerClass: 'col-9em',
        isAngularComponent: true,
        angularComponentName: InstantPowerProgressBarComponent,
        sortable: false
      },
      {
        id: 'sessionDetails',
        name: 'chargers.session_details',
        class: 'col-4em text-center',
        headerClass: 'col-4em',
        isAngularComponent: true,
        angularComponentName: SessionDetailComponent,
        sortable: false
      },
      {
        id: 'totalConsumption',
        name: 'transactions.total_consumption',
        class: 'text-center col-4em',
        headerClass: 'text-center col-4em',
        formatter: (value) => this.appUnitPipe.transform(value, 'Wh', 'kWh'),
        sortable: false
      },
      {
        id: 'type',
        name: 'chargers.connector_type',
        headerClass: 'text-center col-4em',
        class: 'text-center col-4em',
        formatter: (type) => {
          const imageUrl = new AppConnectorTypePipe().transform(type, true);
          return `<img class="charger-connector" src="${imageUrl}"/>`;
        },
        sortable: false
      },
      {
        id: 'errorCode',
        name: 'chargers.connector_error_title',
        headerClass: 'col-6em',
        class: 'col-6em',
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
    if (rowItem) {
      // Check active transaction and authorization to stop
      if (rowItem && rowItem.activeTransactionID &&
        this.connectorTransactionAuthorization &&
        this.connectorTransactionAuthorization[rowItem.connectorId - 1].IsAuthorized) {
        return [
          //          this.openAction.getActionDef(),
          this.stopAction.getActionDef()
        ];
      }
      // check charger status
      if (rowItem && rowItem.status === 'Available') {
        return [
          this.startAction.getActionDef()
        ];
      }
    }
    // By default no actions
    return [
      this.noAction.getActionDef()
    ];
  }

  specificRowActions(rowItem): TableActionDef[] {
    if (rowItem) {
      // Check active transaction and authorization to stop
      if (rowItem && rowItem.activeTransactionID &&
        this.connectorTransactionAuthorization &&
        this.connectorTransactionAuthorization[rowItem.connectorId - 1].IsAuthorized) {
        return [
          //          this.openAction.getActionDef(),
          this.stopAction.getActionDef()
        ];
      }
      // check charger status
      if (rowItem && rowItem.status === 'Available') {
        return [
          this.startAction.getActionDef()
        ];
      }
    }
    // By default no actions
    return [
      this.noAction.getActionDef()
    ];
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
        if (this.authorizationService.isAdmin()) {
          // Admin can start transaction for themself or any other user
          this._startTransactionAsAdmin(rowItem);
        } else {
          this._startTransactionFor(rowItem, this.centralServerService.getLoggedUser());
        }
        break;
      case 'open':
        this._openSession(rowItem);
        break;
      case 'stop':
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
                this.loadData();
              }, (error) => {
                Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                  this.translateService.instant('chargers.stop_transaction_error'));
              });
          }
        });
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
  public _startTransactionFor(connector: Connector, user: User) {
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
          }, (error) => {
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              this.translateService.instant('chargers.stop_transaction_error'));
          });
      }
    });

  }

  private _startTransactionAsAdmin(connector: Connector) {
    // Create dialog data
    const dialogConfig = new MatDialogConfig();
    // Set data
    dialogConfig.data = {
      title: 'chargers.start_transaction_admin_title',
      message: 'chargers.start_transaction_admin_message'
    }
    // Show
    const dialogRef = this.dialog.open(StartTransactionDialogComponent, dialogConfig);
    // Register
    dialogRef.afterClosed().subscribe((buttonId) => {
      switch (buttonId) {
        case BUTTON_FOR_MYSELF:
          this._startTransactionFor(connector, this.centralServerService.getLoggedUser());
          break;
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
              this._startTransactionFor(connector, data[0].objectRef)
            }
          });
          break;
        default:
          break;
      }
    })

  }

  private _openSession(connector: Connector) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.height = '80vh';
    dialogConfig.width = '80vw';
    dialogConfig.data = {
      transactionId: connector.activeTransactionID,
      siteArea: this.charger.siteArea,
      connector: connector,
    };
    // Open
    const dialogRef = this.dialog.open(SessionDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(() => this.loadData());
  }
}
