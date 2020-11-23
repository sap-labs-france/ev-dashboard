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
import { WindowService } from '../../../services/window.service';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { TableChargingStationsSmartChargingAction, TableChargingStationsSmartChargingActionDef } from '../../../shared/table/actions/charging-stations/table-charging-stations-smart-charging-action';
import { TableNavigateToSiteAreaAction } from '../../../shared/table/actions/charging-stations/table-navigate-to-site-area-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { ChargingStationTableFilter } from '../../../shared/table/filters/charging-station-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { ChargingProfile } from '../../../types/ChargingProfile';
import { ChargingStationButtonAction } from '../../../types/ChargingStation';
import { DataResult } from '../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import TenantComponents from '../../../types/TenantComponents';
import { Utils } from '../../../utils/Utils';
import { ChargingStationLimitationDialogComponent } from '../charging-station-limitation/charging-station-limitation.dialog.component';

@Injectable()
export class ChargingPlansListTableDataSource extends TableDataSource<ChargingProfile> {
  private readonly isOrganizationComponentActive: boolean;
  private smartChargingAction = new TableChargingStationsSmartChargingAction().getActionDef();
  private checkSiteAreaAction = new TableNavigateToSiteAreaAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private appUnitPipe: AppUnitPipe,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private windowService: WindowService
  ) {
    super(spinnerService, translateService);
    this.isOrganizationComponentActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
    if (this.isOrganizationComponentActive) {
      this.setStaticFilters([{ WithChargingStation: 'true' }, { WithSiteArea: 'true' }]);
    } else {
      this.setStaticFilters([{ WithChargingStation: 'true' }]);
    }
    this.initDataSource();
    this.initFilters();
  }

  public initFilters() {
        // Charging Station
        const chargingStationID = this.windowService.getSearch('ChargingStationID');
        if (chargingStationID) {
          const chargingStationTableFilter = this.tableFiltersDef.find(filter => filter.id === 'charger');
          if (chargingStationTableFilter) {
            chargingStationTableFilter.currentValue = [{ key: chargingStationID, value: chargingStationID }];
            this.filterChanged(chargingStationTableFilter);
          }
        }
        const transactionID = this.windowService.getSearch('TransactionID');
        if (transactionID) {
          this.setSearchValue(transactionID);
        }
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectChargingProfiles();
  }

  public loadDataImpl(): Observable<DataResult<ChargingProfile>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getChargingProfiles(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe((chargingProfiles) => {
          observer.next(chargingProfiles);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
    // Build common part for all cases
    const tableColumns: TableColumnDef[] = [
      {
        id: 'chargingStationID',
        name: 'chargers.smart_charging.charging_plans.charging_station_id',
        sortable: true,
      },
      {
        id: 'connectorID',
        name: 'chargers.smart_charging.charging_plans.connector_id',
        sortable: false,
      },
      {
        id: 'profile.chargingProfileKind',
        name: 'chargers.smart_charging.charging_plans.kind',
        sortable: false,
      },
      {
        id: 'profile.chargingProfilePurpose',
        name: 'chargers.smart_charging.charging_plans.purpose',
        sortable: false,
      },
      {
        id: 'profile.stackLevel',
        name: 'chargers.smart_charging.charging_plans.stack_level',
        sortable: false,
      },
    ];
    if (this.isOrganizationComponentActive) {
      tableColumns.push(
        {
          id: 'chargingStation.siteArea.name',
          name: 'chargers.smart_charging.charging_plans.site_area',
          sortable: false,
        },
        {
          id: 'chargingStation.siteArea.maximumPower',
          name: 'chargers.smart_charging.charging_plans.site_area_limit',
          sortable: false,
          formatter: (maximumPower: number) => maximumPower > 0 ? this.appUnitPipe.transform(maximumPower, 'W', 'kW', true, 0, 0, 0) : '',
        },
      );
    }
    return tableColumns;
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.isAdmin()) {
      return [
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public rowActionTriggered(actionDef: TableActionDef, chargingProfile: ChargingProfile) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.SMART_CHARGING:
        if (actionDef.action) {
          (actionDef as TableChargingStationsSmartChargingActionDef).action(
            ChargingStationLimitationDialogComponent, chargingProfile.chargingStation, this.dialogService,
            this.translateService, this.dialog, this.refreshData.bind(this)
          );
        }
        break;
        case ChargingStationButtonAction.NAVIGATE_TO_SITE_AREA:
          this.checkSiteAreaAction.action('organization#site-areas?SiteAreaID=' + chargingProfile.chargingStation.siteArea.id);
          break;
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    if (this.isOrganizationComponentActive) {
      return [
        new ChargingStationTableFilter().getFilterDef(),
      ];
    }
    return [];
  }

  public buildTableDynamicRowActions(chargingProfile: ChargingProfile): TableActionDef[] {
    if (!chargingProfile) {
      return [];
    }
    if (this.authorizationService.isAdmin() && !this.isOrganizationComponentActive ) {
      return [
        this.smartChargingAction
      ];
    }
    if (this.authorizationService.isAdmin() ||
      this.authorizationService.isSiteAdmin(chargingProfile.chargingStation.siteArea ? chargingProfile.chargingStation.siteArea.siteID : '')) {
      const moreActions = new TableMoreAction([this.checkSiteAreaAction]);
      return [
        this.smartChargingAction,
        moreActions.getActionDef(),
      ];
    }
    return [];
  }
}
