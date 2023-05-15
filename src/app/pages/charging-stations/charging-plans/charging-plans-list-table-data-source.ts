import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { IssuerFilter } from 'shared/table/filters/issuer-filter';
import { ChargingProfilesAuthorizations } from 'types/Authorization';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import {
  TableChargingStationsSmartChargingAction,
  TableChargingStationsSmartChargingActionDef,
} from '../../../shared/table/actions/charging-stations/table-charging-stations-smart-charging-action';
import { TableNavigateToSiteAreaAction } from '../../../shared/table/actions/charging-stations/table-navigate-to-site-area-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { ChargingStationTableFilter } from '../../../shared/table/filters/charging-station-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { ChargingProfile } from '../../../types/ChargingProfile';
import { ChargingStationButtonAction } from '../../../types/ChargingStation';
import { ChargingProfileDataResult } from '../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { TenantComponents } from '../../../types/Tenant';
import { Utils } from '../../../utils/Utils';
import { ChargingStationLimitationDialogComponent } from '../charging-station-limitation/charging-station-limitation.dialog.component';

@Injectable()
export class ChargingPlansListTableDataSource extends TableDataSource<ChargingProfile> {
  private readonly isOrganizationComponentActive: boolean;
  private smartChargingAction = new TableChargingStationsSmartChargingAction().getActionDef();
  private navigateToSiteAreaAction = new TableNavigateToSiteAreaAction().getActionDef();
  private chargingStationTableFilter: TableFilterDef;
  private chargingProfilesAuthorizations: ChargingProfilesAuthorizations;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private appUnitPipe: AppUnitPipe,
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
    const chargingStationID = this.windowService.getUrlParameterValue('ChargingStationID');
    if (chargingStationID) {
      const chargingStationTableFilter = this.tableFiltersDef.find(
        (filter) => filter.id === 'charger'
      );
      if (chargingStationTableFilter) {
        chargingStationTableFilter.currentValue = [
          { key: chargingStationID, value: chargingStationID },
        ];
        this.filterChanged(chargingStationTableFilter);
      }
    }
    const transactionID = this.windowService.getUrlParameterValue('TransactionID');
    if (transactionID) {
      this.setSearchValue(transactionID);
    }
  }

  public loadDataImpl(): Observable<ChargingProfileDataResult> {
    return new Observable((observer) => {
      this.centralServerService
        .getChargingProfiles(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe(
          (chargingProfiles) => {
            // Build auth object
            this.chargingProfilesAuthorizations = {
              canListChargingStations: Utils.convertToBoolean(
                chargingProfiles.canListChargingStations
              ),
              metadata: chargingProfiles.metadata,
            };
            // Update filters visibility
            this.chargingStationTableFilter.visible =
              this.chargingProfilesAuthorizations.canListChargingStations;
            observer.next(chargingProfiles);
            observer.complete();
          },
          (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          }
        );
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
    return [
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
      {
        id: 'chargingStation.siteArea.name',
        name: 'chargers.smart_charging.charging_plans.site_area',
        sortable: false,
        visible: this.isOrganizationComponentActive,
      },
      {
        id: 'chargingStation.siteArea.maximumPower',
        name: 'chargers.smart_charging.charging_plans.site_area_limit',
        sortable: false,
        formatter: (maximumPower: number) =>
          maximumPower > 0
            ? this.appUnitPipe.transform(maximumPower, 'W', 'kW', true, 0, 0, 0)
            : '',
        visible: this.isOrganizationComponentActive,
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
    return tableActionsDef;
  }

  public rowActionTriggered(actionDef: TableActionDef, chargingProfile: ChargingProfile) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.SMART_CHARGING:
        if (actionDef.action) {
          (actionDef as TableChargingStationsSmartChargingActionDef).action(
            ChargingStationLimitationDialogComponent,
            this.dialogService,
            this.translateService,
            this.dialog,
            {
              dialogData: {
                id: chargingProfile.chargingStationID,
                canUpdate: chargingProfile.canUpdate,
                ocppVersion: chargingProfile.chargingStation.ocppVersion,
              },
              authorizations: this.chargingProfilesAuthorizations,
            },
            this.refreshData.bind(this)
          );
        }
        break;
      case ChargingStationButtonAction.NAVIGATE_TO_SITE_AREA:
        this.navigateToSiteAreaAction.action(
          'organization#site-areas?SiteAreaID=' + chargingProfile.chargingStation.siteArea.id,
          this.windowService
        );
        break;
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    const issuerFilter = new IssuerFilter().getFilterDef();
    this.chargingStationTableFilter = new ChargingStationTableFilter([issuerFilter]).getFilterDef();
    this.chargingStationTableFilter.visible = false;
    return [this.chargingStationTableFilter];
  }

  public buildTableDynamicRowActions(chargingProfile: ChargingProfile): TableActionDef[] {
    const tableActionDef: TableActionDef[] = [];
    if (chargingProfile.canUpdate) {
      tableActionDef.push(this.smartChargingAction);
    }
    if (chargingProfile.canReadSiteArea) {
      const moreActions = new TableMoreAction([this.navigateToSiteAreaAction]);
      tableActionDef.push(moreActions.getActionDef());
    }
    return tableActionDef;
  }
}
