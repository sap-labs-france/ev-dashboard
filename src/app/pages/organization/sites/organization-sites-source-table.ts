import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {TranslateService} from '@ngx-translate/core';
import {Observable} from 'rxjs';

import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import {Site, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef} from 'app/common.types';
import {AuthorizationService} from 'app/services/authorization-service';
import {CentralServerNotificationService} from 'app/services/central-server-notification.service';
import {CentralServerService} from 'app/services/central-server.service';
import {MessageService} from 'app/services/message.service';
import {TableRefreshAction} from 'app/shared/table/actions/table-refresh-action';
import {TableDataSource} from 'app/shared/table/table-data-source';
import {Utils} from 'app/utils/Utils';

import {DialogService} from 'app/services/dialog.service';
import {SpinnerService} from 'app/services/spinner.service';
import {TableCreateAction} from 'app/shared/table/actions/table-create-action';
import {TableDeleteAction} from 'app/shared/table/actions/table-delete-action';
import {TableEditAction} from 'app/shared/table/actions/table-edit-action';
import {TableEditUsersAction} from 'app/shared/table/actions/table-edit-users-action';
import {TableOpenInMapsAction} from 'app/shared/table/actions/table-open-in-maps-action';
import {TableViewAction} from 'app/shared/table/actions/table-view-action';
import {CompaniesTableFilter} from 'app/shared/table/filters/company-filter';
import {Constants} from 'app/utils/Constants';
import {SiteUsersDialogComponent} from './site/site-users/site-users.dialog.component';
import {SiteDialogComponent} from './site/site.dialog.component';

@Injectable()
export class OrganizationSitesDataSource extends TableDataSource<Site> {
  private editAction = new TableEditAction().getActionDef();
  private editUsersAction = new TableEditUsersAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();

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
    this.setStaticFilters([{'WithCompany': true}]);
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectSite();
  }

  public loadDataImpl(): Observable<any> {
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
        enabled: true
      },
      hasDynamicRowAction: true
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
        sortable: true
      },
      {
        id: 'company.name',
        name: 'companies.title',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true
      },
      {
        id: 'address.city',
        name: 'general.city',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true
      },
      {
        id: 'address.country',
        name: 'general.country',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true
      }
    ];
    if (this.authorizationService.isAdmin()) {
      tableColumnDef.unshift({
        id: 'id',
        name: 'general.id',
        headerClass: 'd-none col-15p d-xl-table-cell',
        class: 'd-none col-15p d-xl-table-cell'
      });
    }
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.canAccess(Constants.ENTITY_SITE, Constants.ACTION_CREATE)) {
      return [
        new TableCreateAction().getActionDef(),
        ...tableActionsDef
      ];
    }
    return tableActionsDef;
  }

  buildTableDynamicRowActions(site: Site) {
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // check if GPs are available
    openInMaps.disabled = (site && site.address && site.address.latitude && site.address.longitude) ? false : true;
    if (this.authorizationService.isSiteAdmin(site.id)) {
      return [
        this.editAction,
        this.editUsersAction,
        openInMaps,
        this.deleteAction
      ];
    }
    return [
      this.viewAction,
      openInMaps
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this._showSiteDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'edit':
      case 'view':
        this._showSiteDialog(rowItem);
        break;
      case 'edit_users':
        this._showUsersDialog(rowItem);
        break;
      case 'delete':
        this._deleteSite(rowItem);
        break;
      case 'open_in_maps':
        this._showPlace(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      // new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new CompaniesTableFilter().getFilterDef()
    ];
  }

  private _showPlace(rowItem) {
    if (rowItem && rowItem.address && rowItem.address.longitude && rowItem.address.latitude) {
      window.open(`http://maps.google.com/maps?q=${rowItem.address.latitude},${rowItem.address.longitude}`);
    }
  }

  private _showSiteDialog(site?: Site) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '70vw';
    dialogConfig.minHeight = '70vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (site) {
      dialogConfig.data = site.id;
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

  private _showUsersDialog(site?: Site) {
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

  private _deleteSite(site) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('sites.delete_title'),
      this.translateService.instant('sites.delete_confirm', {'siteName': site.name})
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.centralServerService.deleteSite(site.id).subscribe(response => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('sites.delete_success', {'siteName': site.name});
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
}
