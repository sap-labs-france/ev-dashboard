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
import { TableEditUsersAction } from 'app/shared/table/actions/table-edit-users-action';
import { TableExportOCPPParamsAction } from 'app/shared/table/actions/table-export-ocpp-params-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { CompanyTableFilter } from 'app/shared/table/filters/company-table-filter';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Action, Entity } from 'app/types/Authorization';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction, RestResponse, SubjectInfo } from 'app/types/GlobalType';
import { Site } from 'app/types/Site';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { UserButtonAction } from 'app/types/User';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import ChangeNotification from '../../../../types/ChangeNotification';
import { SiteUsersDialogComponent } from '../site-users/site-users-dialog.component';
import { SiteDialogComponent } from '../site/site-dialog.component';

@Injectable()
export class SitesListTableDataSource extends TableDataSource<Site> {
  private editAction = new TableEditAction().getActionDef();
  private editUsersAction = new TableEditUsersAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();
  private exportOCPPParamsAction = new TableExportOCPPParamsAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService) {
    super(spinnerService);
    this.setStaticFilters([{ WithCompany: true }]);
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectSites();
  }

  public loadDataImpl(): Observable<DataResult<Site>> {
    return new Observable((observer) => {
      // Get Sites
      this.centralServerService.getSites(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((sites) => {
          // Ok
          observer.next(sites);
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
        name: 'sites.name',
        headerClass: 'col-30p',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'company.name',
        name: 'companies.title',
        headerClass: 'col-30p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'address.city',
        name: 'general.city',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'address.country',
        name: 'general.country',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
    ];
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.canAccess(Entity.SITE, Action.CREATE)) {
      return [
        new TableCreateAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public loadInMaps(site: Site): TableActionDef {
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // check if GPs are available
    if (site && site.address && site.address.coordinates) {
      const { coordinates } = site.address;
      if (coordinates.length === 2 && (coordinates[0] && coordinates[1])) {
        openInMaps.disabled = false;
      } else {
        openInMaps.disabled = true;
      }
    } else {
      openInMaps.disabled = true;
    }
    return openInMaps;
  }

  public buildTableDynamicRowActions(site: Site) {
    const actions = [];
    const openInMaps = this.loadInMaps(site);
    let moreActions;
    if (this.authorizationService.isSiteAdmin(site.id) || this.authorizationService.isSiteOwner(site.id)) {
      actions.push(this.editAction);
      actions.push(this.editUsersAction);
      moreActions = new TableMoreAction([
        this.exportOCPPParamsAction,
        openInMaps,
      ]).getActionDef();
    } else {
      actions.push(this.viewAction);
      moreActions = new TableMoreAction([
        openInMaps,
      ]).getActionDef();
    }
    if (this.authorizationService.canAccess(Entity.SITE, Action.DELETE)) {
      if (moreActions.dropdownActions) {
        moreActions.dropdownActions.push(this.deleteAction);
      }
    }
    actions.push(moreActions);
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.CREATE:
        this.showSiteDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: Site) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
      case ButtonAction.VIEW:
        this.showSiteDialog(rowItem);
        break;
      case UserButtonAction.EDIT_USERS:
        this.showUsersDialog(rowItem);
        break;
      case ButtonAction.DELETE:
        this.deleteSite(rowItem);
        break;
      case ButtonAction.OPEN_IN_MAPS:
        this.showPlace(rowItem);
      case ChargingStationButtonAction.EXPORT_OCPP_PARAMS:
        this.exportOCOPPParams(rowItem);
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
    return [
      new CompanyTableFilter().getFilterDef(),
    ];
  }

  private showPlace(site: Site) {
    if (site && site.address && site.address.coordinates && site.address.coordinates.length === 2) {
      window.open(`http://maps.google.com/maps?q=${site.address.coordinates[1]},${site.address.coordinates[0]}`);
    }
  }

  private showSiteDialog(site?: Site) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '70vw';
    dialogConfig.minHeight = '70vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (site) {
      dialogConfig.data = site;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(SiteDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private showUsersDialog(site?: Site) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (site) {
      dialogConfig.data = site;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    this.dialog.open(SiteUsersDialogComponent, dialogConfig);
  }

  private deleteSite(site: Site) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('sites.delete_title'),
      this.translateService.instant('sites.delete_confirm', { siteName: site.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.deleteSite(site.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage('sites.delete_success', { siteName: site.name });
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'sites.delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'sites.delete_error');
        });
      }
    });
  }
  private exportOCOPPParams(site: Site) {
    if (this.exportOCPPParamsAction && this.exportOCPPParamsAction.action) {
      this.exportOCPPParamsAction.action(
        this.dialogService,
        this.translateService,
        this.messageService,
        this.centralServerService,
        this.router,
        this.spinnerService,
        null,
        site,
      );
    }
  }
}
