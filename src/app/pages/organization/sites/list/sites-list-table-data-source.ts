import { Action, Entity } from 'app/types/Authorization';
import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import ChangeNotification from '../../../../types/ChangeNotification';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { CompanyTableFilter } from 'app/shared/table/filters/company-table-filter';
import { DataResult } from 'app/types/DataResult';
import { DialogService } from 'app/services/dialog.service';
import { Injectable } from '@angular/core';
import { IssuerFilter } from '../../../../shared/table/filters/issuer-filter';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Site } from 'app/types/Site';
import { SiteDialogComponent } from '../site/site-dialog.component';
import { SiteUsersDialogComponent } from '../site-users/site-users-dialog.component';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAssignUsersToSiteAction } from 'app/shared/table/actions/table-assign-users-to-site-action';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableExportOCPPParamsAction } from 'app/shared/table/actions/table-export-ocpp-params-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { TranslateService } from '@ngx-translate/core';
import { UserButtonAction } from 'app/types/User';
import { Utils } from 'app/utils/Utils';

@Injectable()
export class SitesListTableDataSource extends TableDataSource<Site> {
  private editAction = new TableEditAction().getActionDef();
  private assignUsersToSite = new TableAssignUsersToSiteAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();
  private exportOCPPParamsAction = new TableExportOCPPParamsAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService) {
    super(spinnerService, translateService);
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

  public buildTableDynamicRowActions(site: Site): TableActionDef[] {
    const actions = [];
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // Check if GPS is available
    openInMaps.disabled = !Utils.containsAddressGPSCoordinates(site.address);
    let moreActions;
    if (this.authorizationService.isSiteAdmin(site.id) || this.authorizationService.isSiteOwner(site.id)) {
      actions.push(this.editAction);
      actions.push(this.assignUsersToSite);
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

  public rowActionTriggered(actionDef: TableActionDef, site: Site) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
      case ButtonAction.VIEW:
        this.showSiteDialog(site);
        break;
      case UserButtonAction.EDIT_USERS:
        this.showUsersDialog(site);
        break;
      case ButtonAction.DELETE:
        this.deleteSite(site);
        break;
      case ButtonAction.OPEN_IN_MAPS:
        this.showPlace(site);
      case ChargingStationButtonAction.EXPORT_OCPP_PARAMS:
        this.exportOCOPPParams(site);
        break;
      default:
        super.rowActionTriggered(actionDef, site);
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new IssuerFilter().getFilterDef(),
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
