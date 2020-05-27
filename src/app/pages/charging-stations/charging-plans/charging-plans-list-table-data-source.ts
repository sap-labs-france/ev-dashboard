import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { ChargerTableFilter } from 'app/shared/table/filters/charger-table-filter';
import { SiteTableFilter } from 'app/shared/table/filters/site-table-filter';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { ChargingProfile } from 'app/types/ChargingProfile';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { DropdownItem, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import TenantComponents from 'app/types/TenantComponents';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

import { ComponentService } from '../../../services/component.service';
import { IssuerFilter } from '../../../shared/table/filters/issuer-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import ChangeNotification from '../../../types/ChangeNotification';
import { ChargingPlansCurrentLimitCellComponent } from '../cell-components/charging-plans-current-limit-cell.component';
import { ChargingStationChargingLimitDialogComponent } from '../charging-limit/charging-station-charging-limit.dialog.component';
import { ChargingStationsConnectorsDetailComponent } from '../details-component/charging-stations-connectors-detail-component.component';
import { TableChargingStationsSmartChargingAction } from '../table-actions/table-charging-stations-smart-charging-action';
import { TableExportChargingStationsAction } from '../table-actions/table-export-charging-stations-action';

@Injectable()
export class ChargingPlansListTableDataSource extends TableDataSource<ChargingProfile> {
  private readonly isOrganizationComponentActive: boolean;
  private smartChargingAction = new TableChargingStationsSmartChargingAction().getActionDef();

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
    private dialogService: DialogService,
  ) {
    super(spinnerService, translateService);
    // Init
    this.isOrganizationComponentActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
    if (this.isOrganizationComponentActive) {
      this.setStaticFilters([{ WithSite: true }]);
    }
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectChargingStations();
  }

  public loadDataImpl(): Observable<DataResult<ChargingProfile>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getChargingProfiles(null, null, true, true).subscribe((chargingProfiles) => {
          // Ok
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
      rowSelection: {
        enabled: false,
        multiple: false,
      },
      rowDetails: {
        enabled: true,
        angularComponent: ChargingStationsConnectorsDetailComponent,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
    // Build common part for all cases
    let tableColumns: TableColumnDef[] = [
      {
        id: 'id',
        name: 'chargers.smart_charging.charging_plans.charging_plan_name',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
        sorted: true,
        direction: 'asc',
      },
      {
        id: 'chargingStationID',
        name: 'chargers.smart_charging.charging_plans.charging_station_id',
        headerClass: 'text-center col-30p',
        class: 'text-center col-30p',
        sortable: false,
      },
      {
        id: 'connectorID',
        name: 'chargers.smart_charging.charging_plans.connector_id',
        headerClass: 'text-center',
        class: 'text-center table-cell-angular-big-component',
        sortable: false,
      },
      {
        id: 'profile.chargingSchedule.chargingSchedulePeriod',
        name: 'chargers.smart_charging.charging_plans.current_limit',
        sortable: false,
        headerClass: 'text-center col-15em',
        class: 'text-center col-15em',
        isAngularComponent: true,
        angularComponent: ChargingPlansCurrentLimitCellComponent,
      },
      {
        id: 'siteArea.name',
        name: 'chargers.smart_charging.charging_plans.site_area',
        sortable: true,
        class: 'd-none d-xl-table-cell col-20p',
        headerClass: 'd-none d-xl-table-cell col-20p',
      },
      {
        id: 'siteArea.maximumPower',
        name: 'chargers.smart_charging.charging_plans.site_area_limit',
        sortable: false,
        headerClass: 'text-center col-15em',
        class: 'text-center col-15em',
      },
    ];
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
        new TableExportChargingStationsAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.EXPORT_CHARGING_STATIONS:
        if (actionDef.action) {
          actionDef.action(this.buildFilterValues(), this.dialogService,
            this.translateService, this.messageService, this.centralServerService, this.router,
            this.spinnerService);
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, chargingProfile: ChargingProfile, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.SMART_CHARGING:
        this.dialogSmartCharging(chargingProfile);
        break;
    }
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    if (this.isOrganizationComponentActive) {
      return [
        new ChargerTableFilter().getFilterDef(),
        new SiteAreaTableFilter().getFilterDef(),
      ];
    }
    return [];
  }

  public buildTableDynamicRowActions(chargingProfile: ChargingProfile): TableActionDef[] {
    if (!chargingProfile) {
      return [];
    }
    if (this.authorizationService.isAdmin() ||
      this.authorizationService.isSiteAdmin(chargingProfile.siteArea ? chargingProfile.siteArea.siteID : '')) {
      return [
        this.smartChargingAction,
      ];
    }
  }

  private dialogSmartCharging(chargingProfile: ChargingProfile) {
    if (parseFloat(chargingProfile.chargingStation.ocppVersion) < 1.6) {
      this.dialogService.createAndShowOkDialog(
        this.translateService.instant('chargers.action_error.smart_charging_title'),
        this.translateService.instant('chargers.action_error.smart_charging_charger_version'));
    } else {
      // Create the dialog
      const dialogConfig = new MatDialogConfig();
      dialogConfig.minWidth = '80vw';
      dialogConfig.minHeight = '60vh';
      dialogConfig.maxHeight = '90vh';
      dialogConfig.panelClass = 'transparent-dialog-container';
      if (chargingProfile.chargingStation) {
        dialogConfig.data = chargingProfile.chargingStation;
      }
      // disable outside click close
      dialogConfig.disableClose = true;
      // Open
      const dialogRef = this.dialog.open(ChargingStationChargingLimitDialogComponent, dialogConfig);
      dialogRef.afterClosed().subscribe(() => {
        this.refreshData().subscribe();
      });
    }
  }
}
