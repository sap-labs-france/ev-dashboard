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
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Building, BuildingImage } from 'app/types/Building';
import ChangeNotification from 'app/types/ChangeNotification';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { BuildingDialogComponent } from '../building/building.dialog.component';

@Injectable()
export class BuildingsListTableDataSource extends TableDataSource<Building> {
  private isAdmin = false;
  private editAction = new TableEditAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
) {
    super(spinnerService, translateService);
    // Init
    this.isAdmin = this.authorizationService.isAdmin();
    this.setStaticFilters([{WithLogo: true, WithSiteArea: true}]);
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectBuildings();
  }

  public loadDataImpl(): Observable<DataResult<Building>> {
    return new Observable((observer) => {
      // get buildings
      this.centralServerService.getBuildings(this.buildFilterValues(), this.getPaging(), this.getSorting()).subscribe((buildings) => {
        // lookup for image otherwise assign default
        for (const building of buildings.result) {
          if (!building.image) {
            building.image = BuildingImage.NO_IMAGE;
          }
        }
        // Ok
        observer.next(buildings);
        observer.complete();
      }, (error) => {
        // Show error
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
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'name',
        name: 'buildings.name',
        headerClass: 'col-30p',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'siteArea.name',
        name: 'site_areas.titles',
        headerClass: 'col-30p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'address.city',
        name: 'general.city',
        headerClass: 'col-30p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'address.country',
        name: 'general.country',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: true,
      },
    ];
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.isAdmin) {
      return [
        new TableCreateAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(building: Building) {
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // Check if GPS is available
    openInMaps.disabled = !Utils.containsAddressGPSCoordinates(building.address);
    if (this.isAdmin) {
      return [
        this.editAction,
        openInMaps,
        this.deleteAction,
      ];
    }
    return [
      this.viewAction,
      openInMaps,
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.CREATE:
        this.showBuildingDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: Building) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
      case ButtonAction.VIEW:
        this.showBuildingDialog(rowItem);
        break;
      case ButtonAction.DELETE:
        this.deleteBuilding(rowItem);
        break;
      case ButtonAction.OPEN_IN_MAPS:
        this.showPlace(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private showBuildingDialog(building?: Building) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (building) {
      dialogConfig.data = building.id;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(BuildingDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private showPlace(building: Building) {
    if (building && building.address && building.address.coordinates) {
      window.open(`http://maps.google.com/maps?q=${building.address.coordinates[1]},${building.address.coordinates[0]}`);
    }
  }

  private deleteBuilding(building: Building) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('buildings.delete_title'),
      this.translateService.instant('buildings.delete_confirm', {buildingName: building.name}),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.deleteBuilding(building.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage('buildings.delete_success', {buildingName: building.name});
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'buildings.delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'buildings.delete_error');
        });
      }
    });
  }
}
