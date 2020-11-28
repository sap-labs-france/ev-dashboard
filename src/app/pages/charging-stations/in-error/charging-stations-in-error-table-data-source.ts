import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ErrorCodeDetailsComponent } from '../../../shared/component/error-code-details/error-code-details.component';
import { TableChargingStationsRebootAction, TableChargingStationsRebootActionDef } from '../../../shared/table/actions/charging-stations/table-charging-stations-reboot-action';
import { TableChargingStationsResetAction, TableChargingStationsResetActionDef } from '../../../shared/table/actions/charging-stations/table-charging-stations-reset-action';
import { TableDeleteChargingStationAction, TableDeleteChargingStationActionDef } from '../../../shared/table/actions/charging-stations/table-delete-charging-station-action';
import { TableEditChargingStationAction, TableEditChargingStationActionDef } from '../../../shared/table/actions/charging-stations/table-edit-charging-station-action';
import { TableNavigateToLogsAction } from '../../../shared/table/actions/logs/table-navigate-to-logs-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableOpenURLActionDef } from '../../../shared/table/actions/table-open-url-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { ErrorTypeTableFilter } from '../../../shared/table/filters/error-type-table-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from '../../../shared/table/filters/site-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { ChargePointStatus, ChargingStationButtonAction, Connector, OCPPVersion } from '../../../types/ChargingStation';
import { DataResult } from '../../../types/DataResult';
import { ChargingStationInError, ChargingStationInErrorType, ErrorMessage } from '../../../types/InError';
import { LogButtonAction } from '../../../types/Log';
import { DropdownItem, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import TenantComponents from '../../../types/TenantComponents';
import { Utils } from '../../../utils/Utils';
import { ChargingStationsConnectorsCellComponent } from '../cell-components/charging-stations-connectors-cell.component';
import { ChargingStationsHeartbeatCellComponent } from '../cell-components/charging-stations-heartbeat-cell.component';
import { ChargingStationDialogComponent } from '../charging-station/charging-station-dialog.component';

@Injectable()
export class ChargingStationsInErrorTableDataSource extends TableDataSource<ChargingStationInError> {
  private isAdmin: boolean;
  private editAction = new TableEditChargingStationAction().getActionDef();
  private deleteAction = new TableDeleteChargingStationAction().getActionDef();
  private resetAction = new TableChargingStationsResetAction().getActionDef();
  private rebootAction = new TableChargingStationsRebootAction().getActionDef();
  private navigateToLogsAction = new TableNavigateToLogsAction().getActionDef();
  private isOrganizationComponentActive: boolean;

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    private dialog: MatDialog,
    private dialogService: DialogService) {
    super(spinnerService, translateService);
    // Init
    this.isAdmin = this.authorizationService.isAdmin();
    this.isOrganizationComponentActive = this.componentService.isActive(TenantComponents.ORGANIZATION);

    if (this.isOrganizationComponentActive) {
      this.setStaticFilters(
        [
          { WithSite: true },
        ]);
    }
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectChargingStations();
  }

  public loadDataImpl(): Observable<DataResult<ChargingStationInError>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getChargingStationsInError(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((chargers) => {
          this.formatErrorMessages(chargers.result);
          // Update details status
          chargers.result.forEach((chargingStation: ChargingStationInError) => {
            // At first filter out the connectors that are null
            chargingStation.connectors = chargingStation.connectors.filter((connector) => !Utils.isNullOrUndefined(connector));
            chargingStation.connectors.forEach((connector) => {
              connector.hasDetails = connector.currentTransactionID > 0;
              connector.status = chargingStation.inactive ? ChargePointStatus.UNAVAILABLE : connector.status;
              connector.currentInstantWatts = chargingStation.inactive ? 0 : connector.currentInstantWatts;
              connector.currentStateOfCharge = chargingStation.inactive ? 0 : connector.currentStateOfCharge;
              connector.currentTotalConsumptionWh = chargingStation.inactive ? 0 : connector.currentTotalConsumptionWh;
              connector.currentTotalInactivitySecs = chargingStation.inactive ? 0 : connector.currentTotalInactivitySecs;
            });
          });
          // Ok
          observer.next(chargers);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  public getConnectors(id: string): Observable<Connector> | null {
    this.getData().forEach((charger) => {
      if (charger.id === id) {
        return charger;
      }
    });
    return null;
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      rowSelection: {
        enabled: false,
        multiple: false,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
    return [
      {
        id: 'id',
        name: 'chargers.name',
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true,
        sorted: true,
        direction: 'asc',
      },
      {
        id: 'inactive',
        name: 'chargers.heartbeat_title',
        headerClass: 'text-center',
        class: 'text-center',
        isAngularComponent: true,
        angularComponent: ChargingStationsHeartbeatCellComponent,
        sortable: false,
      },
      {
        id: 'connectorsStatus',
        name: 'chargers.connectors_title',
        headerClass: 'text-center',
        class: 'text-center table-cell-angular-big-component',
        sortable: false,
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorsCellComponent,
      },
      {
        id: 'errorCodeDetails',
        name: 'errors.details',
        sortable: false,
        headerClass: 'text-center',
        class: 'action-cell text-center table-cell-angular-big-component',
        isAngularComponent: true,
        angularComponent: ErrorCodeDetailsComponent,
      },
      {
        id: 'errorCode',
        name: 'errors.title',
        class: 'col-30p text-danger',
        sortable: true,
        formatter: (value: string) => this.translateService.instant(`chargers.errors.${value}.title`),
      },
    ];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    return super.buildTableActionsDef();
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, chargingStation: ChargingStationInError, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.REBOOT:
        if (actionDef.action) {
          (actionDef as TableChargingStationsRebootActionDef).action(
            chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.SOFT_RESET:
        if (actionDef.action) {
          (actionDef as TableChargingStationsResetActionDef).action(
            chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.DELETE_CHARGING_STATION:
        if (actionDef.action) {
          (actionDef as TableDeleteChargingStationActionDef).action(
            chargingStation, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ChargingStationButtonAction.EDIT_CHARGING_STATION:
        if (actionDef.action) {
          (actionDef as TableEditChargingStationActionDef).action(
            ChargingStationDialogComponent, chargingStation, this.dialog, this.refreshData.bind(this));
        }
        break;
      case LogButtonAction.NAVIGATE_TO_LOGS:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action('logs?ChargingStationID=' + chargingStation.id);
        }
        break;
    }
  }

  public onRowActionMenuOpen(action: TableActionDef, row: ChargingStationInError) {
    if (action.dropdownActions) {
      action.dropdownActions.forEach((dropdownAction) => {
        if (dropdownAction.id === ChargingStationButtonAction.SMART_CHARGING) {
          // Check charging station version
          dropdownAction.disabled = row.ocppVersion === OCPPVersion.VERSION_12 ||
            row.ocppVersion === OCPPVersion.VERSION_15 ||
            row.inactive;
        } else {
          // Check active status of CS
          dropdownAction.disabled = row.inactive;
        }
      });
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    // Create error type
    const errorTypes = [];
    errorTypes.push({
      key: ChargingStationInErrorType.MISSING_SETTINGS,
      value: this.translateService.instant(`chargers.errors.${ChargingStationInErrorType.MISSING_SETTINGS}.title`),
    });
    errorTypes.push({
      key: ChargingStationInErrorType.CONNECTION_BROKEN,
      value: this.translateService.instant(`chargers.errors.${ChargingStationInErrorType.CONNECTION_BROKEN}.title`),
    });
    errorTypes.push({
      key: ChargingStationInErrorType.CONNECTOR_ERROR,
      value: this.translateService.instant(`chargers.errors.${ChargingStationInErrorType.CONNECTOR_ERROR}.title`),
    });
    if (this.isOrganizationComponentActive) {
      errorTypes.push({
        key: ChargingStationInErrorType.MISSING_SITE_AREA,
        value: this.translateService.instant(`chargers.errors.${ChargingStationInErrorType.MISSING_SITE_AREA}.title`),
      });
    }
    // Sort
    errorTypes.sort(Utils.sortArrayOfKeyValue);
    // Build filters
    if (this.isOrganizationComponentActive) {
      return [
        new SiteTableFilter().getFilterDef(),
        new SiteAreaTableFilter().getFilterDef(),
        new ErrorTypeTableFilter(errorTypes).getFilterDef(),
      ];
    }
    return [
      new ErrorTypeTableFilter(errorTypes).getFilterDef(),
    ];
  }

  public buildTableDynamicRowActions(charger: ChargingStationInError): TableActionDef[] {
    if (this.isAdmin && charger.errorCode) {
      switch (charger.errorCode) {
        case ChargingStationInErrorType.MISSING_SETTINGS:
        case ChargingStationInErrorType.MISSING_SITE_AREA:
        case ChargingStationInErrorType.CONNECTION_BROKEN:
          return [
            this.editAction,
            this.navigateToLogsAction,
            new TableMoreAction([
              this.deleteAction,
            ]).getActionDef(),
          ];
        case ChargingStationInErrorType.CONNECTOR_ERROR:
          return [
            this.editAction,
            this.navigateToLogsAction,
            new TableMoreAction([
              this.deleteAction,
              this.resetAction,
              this.rebootAction,
            ]).getActionDef(),
          ];
      }
    }
    return [];
  }

  private formatErrorMessages(chargersInError: ChargingStationInError[]) {
    chargersInError.forEach((chargerInError) => {
      const path = `chargers.errors.${chargerInError.errorCode}`;
      const errorMessage: ErrorMessage = {
        title: `${path}.title`,
        titleParameters: {},
        description: `${path}.description`,
        descriptionParameters: {},
        action: `${path}.action`,
        actionParameters: {},
      };
      chargerInError.errorMessage = errorMessage;
    });
  }
}
