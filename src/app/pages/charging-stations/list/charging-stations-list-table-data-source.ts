import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { WindowService } from 'services/window.service';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { PricingDefinitionsDialogComponent } from '../../../shared/pricing-definitions/pricing-definitions.dialog.component';
import {
  TableChargingStationGenerateQrCodeConnectorAction,
  TableChargingStationGenerateQrCodeConnectorActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-station-generate-qr-code-connector-action';
import {
  TableChargingStationsClearCacheAction,
  TableChargingStationsClearCacheActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-clear-cache-action';
import {
  TableChargingStationsForceAvailableStatusAction,
  TableChargingStationsForceAvailableStatusActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-force-available-status-action';
import {
  TableChargingStationsForceUnavailableStatusAction,
  TableChargingStationsForceUnavailableStatusActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-force-unavailable-status-action';
import {
  TableChargingStationsRebootAction,
  TableChargingStationsRebootActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-reboot-action';
import {
  TableChargingStationsResetAction,
  TableChargingStationsResetActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-reset-action';
import {
  TableChargingStationsSmartChargingAction,
  TableChargingStationsSmartChargingActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-smart-charging-action';
import {
  TableDeleteChargingStationAction,
  TableDeleteChargingStationActionDef,
} from '../../../shared/table/actions/charging-stations/table-delete-charging-station-action';
import {
  TableEditChargingStationAction,
  TableEditChargingStationActionDef,
} from '../../../shared/table/actions/charging-stations/table-edit-charging-station-action';
import {
  TableExportChargingStationsAction,
  TableExportChargingStationsActionDef,
} from '../../../shared/table/actions/charging-stations/table-export-charging-stations-action';
import {
  TableViewChargingStationAction,
  TableViewChargingStationActionDef,
} from '../../../shared/table/actions/charging-stations/table-view-charging-station-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from '../../../shared/table/actions/table-open-in-maps-action';
import { TableOpenURLActionDef } from '../../../shared/table/actions/table-open-url-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import {
  TableViewPricingDefinitionsAction,
  TableViewPricingDefinitionsActionDef,
} from '../../../shared/table/actions/table-view-pricing-definitions-action';
import { TableNavigateToTransactionsAction } from '../../../shared/table/actions/transactions/table-navigate-to-transactions-action';
import { CompanyTableFilter } from '../../../shared/table/filters/company-table-filter';
import { IssuerFilter } from '../../../shared/table/filters/issuer-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from '../../../shared/table/filters/site-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { ChargingStationsAuthorizations } from '../../../types/Authorization';
import { ChargingStation, ChargingStationButtonAction } from '../../../types/ChargingStation';
import { ChargingStationDataResult } from '../../../types/DataResult';
import { ButtonAction } from '../../../types/GlobalType';
import { PricingButtonAction, PricingEntity } from '../../../types/Pricing';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { TenantComponents } from '../../../types/Tenant';
import { TransactionButtonAction } from '../../../types/Transaction';
import { Utils } from '../../../utils/Utils';
import { ChargingStationsConnectorsCellComponent } from '../cell-components/charging-stations-connectors-cell.component';
import { ChargingStationsFirmwareStatusCellComponent } from '../cell-components/charging-stations-firmware-status-cell.component';
import { ChargingStationsHeartbeatCellComponent } from '../cell-components/charging-stations-heartbeat-cell.component';
import { ChargingStationsInstantPowerChargerProgressBarCellComponent } from '../cell-components/charging-stations-instant-power-charger-progress-bar-cell.component';
import { ChargingStationConnectorsComponent } from '../charging-station-connectors/charging-station-connectors-component.component';
import { ChargingStationLimitationDialogComponent } from '../charging-station-limitation/charging-station-limitation.dialog.component';
import { ChargingStationDialogComponent } from '../charging-station/charging-station-dialog.component';

@Injectable()
export class ChargingStationsListTableDataSource extends TableDataSource<ChargingStation> {
  private readonly isOrganizationComponentActive: boolean;
  private readonly isPricingComponentActive: boolean;
  private editAction = new TableEditChargingStationAction().getActionDef();
  private viewAction = new TableViewChargingStationAction().getActionDef();
  private smartChargingAction = new TableChargingStationsSmartChargingAction().getActionDef();
  private deleteAction = new TableDeleteChargingStationAction().getActionDef();
  private generateQrCodeConnectorAction =
    new TableChargingStationGenerateQrCodeConnectorAction().getActionDef();
  private canExport = new TableExportChargingStationsAction().getActionDef();
  private maintainPricingDefinitionsAction = new TableViewPricingDefinitionsAction().getActionDef();
  private navigateToTransactionsAction = new TableNavigateToTransactionsAction().getActionDef();

  private issuerFilter: TableFilterDef;
  private siteFilter: TableFilterDef;
  private siteAreaFilter: TableFilterDef;
  private companyFilter: TableFilterDef;

  private chargingStationsAuthorizations: ChargingStationsAuthorizations;

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
    this.isOrganizationComponentActive = this.componentService.isActive(
      TenantComponents.ORGANIZATION
    );
    this.isPricingComponentActive = this.componentService.isActive(TenantComponents.PRICING);
    if (this.isOrganizationComponentActive) {
      this.setStaticFilters([
        {
          WithSite: true,
          WithSiteArea: true,
          WithUser: true,
        },
      ]);
    }
    this.initDataSource();
  }

  public loadDataImpl(): Observable<ChargingStationDataResult> {
    return new Observable((observer) => {
      this.centralServerService
        .getChargingStations(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (chargingStations) => {
            // Build auth object
            this.chargingStationsAuthorizations = {
              canExport: Utils.convertToBoolean(chargingStations.canExport),
              canListCompanies: Utils.convertToBoolean(chargingStations.canListCompanies),
              canListSiteAreas: Utils.convertToBoolean(chargingStations.canListSiteAreas),
              canListSites: Utils.convertToBoolean(chargingStations.canListSites),
              metadata: chargingStations.metadata,
            };
            // Update filters visibility
            this.canExport.visible = this.chargingStationsAuthorizations.canExport;
            this.siteFilter.visible = this.chargingStationsAuthorizations.canListSites;
            this.siteAreaFilter.visible = this.chargingStationsAuthorizations.canListSiteAreas;
            this.companyFilter.visible = this.chargingStationsAuthorizations.canListCompanies;
            // Set back the projected fields
            const tableDef = this.getTableDef();
            tableDef.rowDetails.additionalParameters = {
              projectFields: chargingStations.projectFields,
            };
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

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      rowSelection: {
        enabled: false,
        multiple: false,
      },
      rowDetails: {
        enabled: true,
        angularComponent: ChargingStationConnectorsComponent,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'id',
        name: 'chargers.name',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
        sorted: true,
        direction: 'asc',
      },
      {
        id: 'site.name',
        name: 'sites.title',
        class: 'col-20p',
        headerClass: 'col-20p',
        visible: this.isOrganizationComponentActive,
      },
      {
        id: 'siteArea.name',
        name: 'site_areas.title',
        class: 'col-20p',
        headerClass: 'col-20p',
        visible: this.isOrganizationComponentActive,
      },
      {
        id: 'inactive',
        name: 'chargers.heartbeat_title',
        headerClass: 'text-center col-30p',
        class: 'text-center col-30p',
        isAngularComponent: true,
        angularComponent: ChargingStationsHeartbeatCellComponent,
      },
      {
        id: 'connectorsStatus',
        name: 'chargers.connectors_title',
        headerClass: 'text-center',
        class: 'text-center table-cell-angular-big-component',
        isAngularComponent: true,
        angularComponent: ChargingStationsConnectorsCellComponent,
      },
      {
        id: 'connectorsConsumption',
        name: 'chargers.consumption_title',
        headerClass: 'text-center col-15em',
        class: 'text-center col-15em',
        isAngularComponent: true,
        angularComponent: ChargingStationsInstantPowerChargerProgressBarCellComponent,
      },
      {
        id: 'public',
        name: 'chargers.public_charger',
        headerClass: 'text-center col-5em',
        class: 'text-center col-5em',
        sortable: true,
        formatter: (publicChargingStation: boolean) =>
          Utils.displayYesNo(this.translateService, publicChargingStation),
      },
      {
        id: 'chargePointVendor',
        name: 'chargers.vendor',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'chargePointModel',
        name: 'chargers.model',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'firmwareVersion',
        name: 'chargers.firmware_version',
        headerClass: 'text-center col-20p',
        class: 'text-center table-cell-angular-big-component col-20p',
        sortable: false,
        isAngularComponent: true,
        angularComponent: ChargingStationsFirmwareStatusCellComponent,
      },
      {
        id: 'ocppVersion',
        name: 'chargers.ocpp_version_title',
        headerClass: 'text-center col-10p',
        class: 'text-center col-10p',
        sortable: false,
        formatter: (ocppVersion: string, row: ChargingStation) =>
          ocppVersion && row.ocppProtocol ? `${ocppVersion} / ${row.ocppProtocol}` : '',
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
    const tableActionsDef = super.buildTableActionsDef();
    return [this.canExport, ...tableActionsDef];
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.EXPORT_CHARGING_STATIONS:
        if (actionDef.action) {
          (actionDef as TableExportChargingStationsActionDef).action(
            this.buildFilterValues(),
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.router,
            this.spinnerService
          );
        }
        break;
    }
  }

  // eslint-disable-next-line complexity
  public rowActionTriggered(actionDef: TableActionDef, chargingStation: ChargingStation) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.EDIT_CHARGING_STATION:
        if (actionDef.action) {
          (actionDef as TableEditChargingStationActionDef).action(
            ChargingStationDialogComponent,
            this.dialog,
            { dialogData: chargingStation, authorizations: this.chargingStationsAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
      case ChargingStationButtonAction.VIEW_CHARGING_STATION:
        if (actionDef.action) {
          (actionDef as TableViewChargingStationActionDef).action(
            ChargingStationDialogComponent,
            this.dialog,
            { dialogData: chargingStation, authorizations: this.chargingStationsAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
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
      case ChargingStationButtonAction.SMART_CHARGING:
        if (actionDef.action) {
          (actionDef as TableChargingStationsSmartChargingActionDef).action(
            ChargingStationLimitationDialogComponent,
            this.dialogService,
            this.translateService,
            this.dialog,
            {
              dialogData: {
                id: chargingStation.id,
                ocppVersion: chargingStation.ocppVersion,
                canUpdate: chargingStation.canUpdate,
              },
              authorizations: this.chargingStationsAuthorizations,
            },
            this.refreshData.bind(this)
          );
        }
        break;
      case ButtonAction.OPEN_IN_MAPS:
        if (actionDef.action) {
          actionDef.action(chargingStation.coordinates);
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
      case ChargingStationButtonAction.CLEAR_CACHE:
        if (actionDef.action) {
          (actionDef as TableChargingStationsClearCacheActionDef).action(
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
      case ChargingStationButtonAction.FORCE_AVAILABLE_STATUS:
        if (actionDef.action) {
          (actionDef as TableChargingStationsForceAvailableStatusActionDef).action(
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
      case ChargingStationButtonAction.GENERATE_QR_CODE:
        if (actionDef.action) {
          (actionDef as TableChargingStationGenerateQrCodeConnectorActionDef).action(
            chargingStation,
            this.translateService,
            this.spinnerService,
            this.messageService,
            this.centralServerService,
            this.router
          );
        }
        break;
      case ChargingStationButtonAction.FORCE_UNAVAILABLE_STATUS:
        if (actionDef.action) {
          (actionDef as TableChargingStationsForceUnavailableStatusActionDef).action(
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
      case PricingButtonAction.VIEW_PRICING_DEFINITIONS:
        if (actionDef.action) {
          (actionDef as TableViewPricingDefinitionsActionDef).action(
            PricingDefinitionsDialogComponent,
            this.dialog,
            {
              dialogData: {
                id: null,
                context: {
                  entityID: chargingStation.id,
                  entityType: PricingEntity.CHARGING_STATION,
                  entityName: chargingStation.id,
                },
              },
            },
            this.refreshData.bind(this)
          );
        }
        break;
      case TransactionButtonAction.NAVIGATE_TO_TRANSACTIONS:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action(
            'transactions#history?ChargingStationID=' +
              chargingStation.id +
              '&Issuer=' +
              chargingStation.issuer,
            this.windowService
          );
        }
        break;
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    this.issuerFilter = new IssuerFilter().getFilterDef();
    this.siteFilter = new SiteTableFilter([this.issuerFilter]).getFilterDef();
    this.siteAreaFilter = new SiteAreaTableFilter([
      this.issuerFilter,
      this.siteFilter,
    ]).getFilterDef();
    this.companyFilter = new CompanyTableFilter([this.issuerFilter]).getFilterDef();
    // Create filters
    const filters: TableFilterDef[] = [
      this.issuerFilter,
      this.siteFilter,
      this.siteAreaFilter,
      this.companyFilter,
    ];
    return filters;
  }

  public buildTableDynamicRowActions(chargingStation: ChargingStation): TableActionDef[] {
    const tableActionDef: TableActionDef[] = [];
    // Edit
    if (chargingStation.canUpdate) {
      tableActionDef.push(this.editAction);
    } else {
      tableActionDef.push(this.viewAction);
    }
    // Charging profile
    if (chargingStation.canUpdateChargingProfile) {
      tableActionDef.push(this.smartChargingAction);
    }
    // Maintain pricing
    if (this.isPricingComponentActive && chargingStation.canMaintainPricingDefinitions) {
      tableActionDef.push(this.maintainPricingDefinitionsAction);
    }
    // More action
    const moreActions = new TableMoreAction([]);
    // Reset
    if (chargingStation.canReset) {
      const rebootAction = new TableChargingStationsRebootAction().getActionDef();
      rebootAction.disabled = chargingStation.inactive;
      moreActions.addActionInMoreActions(rebootAction);
    }
    // Clear cache
    if (chargingStation.canClearCache) {
      const clearCacheAction = new TableChargingStationsClearCacheAction().getActionDef();
      clearCacheAction.disabled = chargingStation.inactive;
      moreActions.addActionInMoreActions(clearCacheAction);
    }
    // Reset
    if (chargingStation.canReset) {
      const resetAction = new TableChargingStationsResetAction().getActionDef();
      resetAction.disabled = chargingStation.inactive;
      moreActions.addActionInMoreActions(resetAction);
    }
    // Change availability
    if (chargingStation.canChangeAvailability) {
      const forceAvailableStatusAction =
        new TableChargingStationsForceAvailableStatusAction().getActionDef();
      const forceUnavailableStatusAction =
        new TableChargingStationsForceUnavailableStatusAction().getActionDef();
      forceAvailableStatusAction.disabled = chargingStation.inactive;
      forceUnavailableStatusAction.disabled = chargingStation.inactive;
      moreActions.addActionInMoreActions(forceAvailableStatusAction);
      moreActions.addActionInMoreActions(forceUnavailableStatusAction);
    }
    // Generate QR code
    if (chargingStation.canGenerateQrCode) {
      moreActions.addActionInMoreActions(this.generateQrCodeConnectorAction);
    }
    if (chargingStation.canListCompletedTransactions) {
      moreActions.addActionInMoreActions(this.navigateToTransactionsAction);
    }
    // Maps
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    openInMaps.disabled = !Utils.containsGPSCoordinates(chargingStation.coordinates);
    moreActions.addActionInMoreActions(openInMaps);
    // Delete
    if (chargingStation.canDelete) {
      moreActions.addActionInMoreActions(this.deleteAction);
    }
    // Add more action if array has more than one element
    if (moreActions.getActionsInMoreActions().length > 1) {
      tableActionDef.push(moreActions.getActionDef());
    } else if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
      // More action has only one element we put it directly in tableAction
      tableActionDef.push(moreActions.getActionsInMoreActions()[0]);
    }
    return tableActionDef;
  }
}
