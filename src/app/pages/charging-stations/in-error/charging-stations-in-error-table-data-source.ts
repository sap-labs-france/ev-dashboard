import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { WindowService } from 'services/window.service';
import { IssuerFilter } from 'shared/table/filters/issuer-filter';
import { ChargingStationsAuthorizations } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ErrorCodeDetailsComponent } from '../../../shared/component/error-code-details/error-code-details.component';
import {
  TableChargingStationsRebootAction,
  TableChargingStationsRebootActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-reboot-action';
import {
  TableChargingStationsResetAction,
  TableChargingStationsResetActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-reset-action';
import {
  TableDeleteChargingStationAction,
  TableDeleteChargingStationActionDef,
} from '../../../shared/table/actions/charging-stations/table-delete-charging-station-action';
import {
  TableEditChargingStationAction,
  TableEditChargingStationActionDef,
} from '../../../shared/table/actions/charging-stations/table-edit-charging-station-action';
import { TableNavigateToLogsAction } from '../../../shared/table/actions/logs/table-navigate-to-logs-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableOpenURLActionDef } from '../../../shared/table/actions/table-open-url-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { ErrorTypeTableFilter } from '../../../shared/table/filters/error-type-table-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from '../../../shared/table/filters/site-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { ChargingStationButtonAction, Connector } from '../../../types/ChargingStation';
import { ChargingStationInErrorDataResult } from '../../../types/DataResult';
import {
  ChargingStationInError,
  ChargingStationInErrorType,
  ErrorMessage,
} from '../../../types/InError';
import { LogButtonAction } from '../../../types/Log';
import {
  DropdownItem,
  TableActionDef,
  TableColumnDef,
  TableDef,
  TableFilterDef,
} from '../../../types/Table';
import { TenantComponents } from '../../../types/Tenant';
import { Utils } from '../../../utils/Utils';
import { ChargingStationsConnectorsCellComponent } from '../cell-components/charging-stations-connectors-cell.component';
import { ChargingStationsHeartbeatCellComponent } from '../cell-components/charging-stations-heartbeat-cell.component';
import { ChargingStationDialogComponent } from '../charging-station/charging-station-dialog.component';

@Injectable()
export class ChargingStationsInErrorTableDataSource extends TableDataSource<ChargingStationInError> {
  private editAction = new TableEditChargingStationAction().getActionDef();
  private navigateToLogsAction = new TableNavigateToLogsAction().getActionDef();
  private isOrganizationComponentActive: boolean;
  private chargingStationsAthorizations: ChargingStationsAuthorizations;
  private issuerFilter: TableFilterDef;
  private siteFilter: TableFilterDef;
  private siteAreaFilter: TableFilterDef;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private windowService: WindowService
  ) {
    super(spinnerService, translateService);
    // Init
    this.isOrganizationComponentActive = this.componentService.isActive(
      TenantComponents.ORGANIZATION
    );

    if (this.isOrganizationComponentActive) {
      this.setStaticFilters([{ WithSite: true }]);
    }
    this.initDataSource();
  }

  public loadDataImpl(): Observable<ChargingStationInErrorDataResult> {
    return new Observable((observer) => {
      this.centralServerService
        .getChargingStationsInError(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (chargingStations) => {
            // Build auth object
            this.chargingStationsAthorizations = {
              canExport: Utils.convertToBoolean(chargingStations.canExport),
              canListCompanies: Utils.convertToBoolean(chargingStations.canListCompanies),
              canListSiteAreas: Utils.convertToBoolean(chargingStations.canListSiteAreas),
              canListSites: Utils.convertToBoolean(chargingStations.canListSites),
              metadata: chargingStations.metadata,
            };
            // Update filters visibility
            this.siteFilter.visible = this.chargingStationsAthorizations.canListSites;
            this.siteAreaFilter.visible = this.chargingStationsAthorizations.canListSiteAreas;
            this.formatErrorMessages(chargingStations.result);
            observer.next(chargingStations);
            observer.complete();
          },
          error: (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          },
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
        formatter: (value: string) =>
          this.translateService.instant(`chargers.errors.${value}.title`),
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

  public rowActionTriggered(
    actionDef: TableActionDef,
    chargingStation: ChargingStationInError,
    dropdownItem?: DropdownItem
  ) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.REBOOT:
        if (actionDef.action) {
          (actionDef as TableChargingStationsRebootActionDef).action(
            chargingStation,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case ChargingStationButtonAction.SOFT_RESET:
        if (actionDef.action) {
          (actionDef as TableChargingStationsResetActionDef).action(
            chargingStation,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case ChargingStationButtonAction.DELETE_CHARGING_STATION:
        if (actionDef.action) {
          (actionDef as TableDeleteChargingStationActionDef).action(
            chargingStation,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case ChargingStationButtonAction.EDIT_CHARGING_STATION:
        if (actionDef.action) {
          (actionDef as TableEditChargingStationActionDef).action(
            ChargingStationDialogComponent,
            this.dialog,
            { dialogData: chargingStation },
            this.refreshData.bind(this)
          );
        }
        break;
      case LogButtonAction.NAVIGATE_TO_LOGS:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action(
            'logs?ChargingStationID=' + chargingStation.id,
            this.windowService
          );
        }
        break;
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    // Create error type
    const errorTypes = [];
    errorTypes.push({
      key: ChargingStationInErrorType.MISSING_SETTINGS,
      value: this.translateService.instant(
        `chargers.errors.${ChargingStationInErrorType.MISSING_SETTINGS}.title`
      ),
    });
    errorTypes.push({
      key: ChargingStationInErrorType.CONNECTION_BROKEN,
      value: this.translateService.instant(
        `chargers.errors.${ChargingStationInErrorType.CONNECTION_BROKEN}.title`
      ),
    });
    errorTypes.push({
      key: ChargingStationInErrorType.CONNECTOR_ERROR,
      value: this.translateService.instant(
        `chargers.errors.${ChargingStationInErrorType.CONNECTOR_ERROR}.title`
      ),
    });
    if (this.isOrganizationComponentActive) {
      errorTypes.push({
        key: ChargingStationInErrorType.MISSING_SITE_AREA,
        value: this.translateService.instant(
          `chargers.errors.${ChargingStationInErrorType.MISSING_SITE_AREA}.title`
        ),
      });
    }
    // Sort
    errorTypes.sort(Utils.sortArrayOfKeyValue);
    // Build filters
    this.issuerFilter = new IssuerFilter().getFilterDef();
    this.siteFilter = new SiteTableFilter([this.issuerFilter]).getFilterDef();
    this.siteAreaFilter = new SiteAreaTableFilter([
      this.issuerFilter,
      this.siteFilter,
    ]).getFilterDef();

    // Create filters
    const filters: TableFilterDef[] = [
      this.issuerFilter,
      this.siteFilter,
      this.siteAreaFilter,
      new ErrorTypeTableFilter(errorTypes).getFilterDef(),
    ];
    return filters;
  }

  public buildTableDynamicRowActions(chargingStation: ChargingStationInError): TableActionDef[] {
    const tableActionDef: TableActionDef[] = [];
    // Edit
    if (chargingStation.canUpdate) {
      tableActionDef.push(this.editAction);
    }
    // Navigate to log
    tableActionDef.push(this.navigateToLogsAction);
    // More action
    const moreActions = new TableMoreAction([]);
    // Delete
    if (chargingStation.canDelete) {
      const deleteAction = new TableDeleteChargingStationAction().getActionDef();
      deleteAction.disabled = chargingStation.inactive;
      moreActions.addActionInMoreActions(deleteAction);
    }
    // Reboot
    if (
      chargingStation.canReset &&
      chargingStation.errorCode === ChargingStationInErrorType.CONNECTOR_ERROR
    ) {
      const rebootAction = new TableChargingStationsRebootAction().getActionDef();
      rebootAction.disabled = chargingStation.inactive;
      moreActions.addActionInMoreActions(rebootAction);
    }
    // Reset
    if (
      chargingStation.canReset &&
      chargingStation.errorCode === ChargingStationInErrorType.CONNECTOR_ERROR
    ) {
      const resetAction = new TableChargingStationsResetAction().getActionDef();
      resetAction.disabled = chargingStation.inactive;
      moreActions.addActionInMoreActions(resetAction);
    }
    // Add more action
    if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
      tableActionDef.push(moreActions.getActionDef());
    }
    return tableActionDef;
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
