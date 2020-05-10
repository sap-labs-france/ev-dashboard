import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { ButtonType, DropdownItem, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { ChargingStationButtonAction, Connector, OCPPGeneralResponse, OCPPVersion } from 'app/types/ChargingStation';
import { ChargingStationInError, ChargingStationInErrorType, ErrorMessage } from 'app/types/InError';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import ChangeNotification from '../../../types/ChangeNotification';
import { ChargingStationSettingsComponent } from '../charging-station/settings/charging-station-settings.component';
import { ChargingStationsConnectorsCellComponent } from '../cell-components/charging-stations-connectors-cell.component';
import { ChargingStationsHeartbeatCellComponent } from '../cell-components/charging-stations-heartbeat-cell.component';
import { ComponentService } from '../../../services/component.service';
import { DataResult } from 'app/types/DataResult';
import { DialogService } from 'app/services/dialog.service';
import { ErrorCodeDetailsComponent } from '../../../shared/component/error-code-details/error-code-details.component';
import { ErrorTypeTableFilter } from '../../../shared/table/filters/error-type-table-filter';
import { Injectable } from '@angular/core';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from 'app/shared/table/filters/site-table-filter';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableChargingStationsRebootAction } from '../../../shared/table/actions/table-charging-stations-reboot-action';
import { TableChargingStationsResetAction } from '../../../shared/table/actions/table-charging-stations-reset-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import TenantComponents from 'app/types/TenantComponents';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

@Injectable()
export class ChargingStationsInErrorTableDataSource extends TableDataSource<ChargingStationInError> {
  private isAdmin: boolean;
  private editAction = new TableEditAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();
  private resetAction = new TableChargingStationsResetAction().getActionDef();
  private rebootAction = new TableChargingStationsRebootAction().getActionDef();
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
          {WithSite: true},
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
      this.centralServerService.getChargersInError(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((chargers) => {
        this.formatErrorMessages(chargers.result);
        // Update details status
        chargers.result.forEach((charger: ChargingStationInError) => {
          // At first filter out the connectors that are null
          charger.connectors = charger.connectors.filter((connector) => !Utils.isNull(connector));
          charger.connectors.forEach((connector) => {
            connector.hasDetails = connector.activeTransactionID > 0;
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

  public getConnectors(id: string): Observable<Connector>|null {
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
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, chargingStation: ChargingStationInError, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.REBOOT:
        if (actionDef.action) {
          actionDef.action(chargingStation, this.dialogService, this.translateService,
            this.messageService, this.centralServerService, this.spinnerService, this.router);
        }
        break;
      case ChargingStationButtonAction.SOFT_RESET:
        if (actionDef.action) {
          actionDef.action(chargingStation, this.dialogService, this.translateService,
            this.messageService, this.centralServerService, this.spinnerService, this.router);
        }
        break;
      case ButtonAction.DELETE:
        this.deleteChargingStation(chargingStation);
        break;
      case ButtonAction.EDIT:
        this.showChargingStationDialog(chargingStation);
        break;
      default:
        super.rowActionTriggered(actionDef, chargingStation);
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
            new TableMoreAction([
              this.deleteAction
            ]).getActionDef(),
          ];
        case ChargingStationInErrorType.CONNECTOR_ERROR:
          return [
            this.editAction,
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

  private showChargingStationDialog(chargingStation?: ChargingStationInError) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.height = '90vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (chargingStation) {
      dialogConfig.data = chargingStation;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(ChargingStationSettingsComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private deleteChargingStation(chargingStation: ChargingStationInError) {
    if (chargingStation.connectors.findIndex((connector) => connector.activeTransactionID > 0) >= 0) {
      // Do not delete when active transaction on going
      this.dialogService.createAndShowOkDialog(
        this.translateService.instant('chargers.action_error.delete_title'),
        this.translateService.instant('chargers.action_error.delete_active_transaction'));
    } else {
      this.dialogService.createAndShowYesNoDialog(
        this.translateService.instant('chargers.delete_title'),
        this.translateService.instant('chargers.delete_confirm', {chargeBoxID: chargingStation.id}),
      ).subscribe((result) => {
        if (result === ButtonType.YES) {
          this.centralServerService.deleteChargingStation(chargingStation.id).subscribe((response) => {
            if (response.status === RestResponse.SUCCESS) {
              this.refreshData().subscribe();
              this.messageService.showSuccessMessage('chargers.delete_success', {chargeBoxID: chargingStation.id});
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, 'chargers.delete_error');
            }
          }, (error) => {
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
              'chargers.delete_error');
          });
        }
      });
    }
  }
}
