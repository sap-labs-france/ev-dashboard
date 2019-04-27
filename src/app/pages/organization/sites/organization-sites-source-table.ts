import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { TableDataSource } from 'app/shared/table/table-data-source';
import { SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, Site } from 'app/common.types';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { CentralServerService } from 'app/services/central-server.service';
import { LocaleService } from 'app/services/locale.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Utils } from 'app/utils/Utils';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { AuthorizationService } from 'app/services/authorization-service';

import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditUsersAction } from 'app/shared/table/actions/table-edit-users-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { Constants } from 'app/utils/Constants';
import { DialogService } from 'app/services/dialog.service';
import { SiteDialogComponent } from './site/site.dialog.component';
import { SiteUsersDialogComponent } from './site/site-users/site-users.dialog.component';
import { CompaniesTableFilter } from 'app/shared/table/filters/company-filter';

@Injectable()
export class OrganizationSitesDataSource extends TableDataSource<Site> {
  public isAdmin = false;

  constructor(
      private localeService: LocaleService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private spinnerService: SpinnerService,
      private dialogService: DialogService,
      private router: Router,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService,
      private authorizationService: AuthorizationService) {
    super();
    // Init
    this.initDataSource();
    this.setStaticFilters([{ 'WithCompany': true }]);
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectSite();
  }

  public loadData(refreshAction = false): Observable<any> {
    return new Observable((observer) => {
      // Show
      this.spinnerService.show();
      // Get Sites
      this.centralServerService.getSites(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((sites) => {
          // Hide
          this.spinnerService.hide();
          // Update nbr records
          this.setTotalNumberOfRecords(sites.count);
          // Notify
          this.getDataSubjet().next(sites.result);
          // Ok
          observer.next(sites.result);
          observer.complete();
        }, (error) => {
          // Hide
          this.spinnerService.hide();
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
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
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
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.isAdmin) {
      return [
        new TableCreateAction().getActionDef(),
        ...tableActionsDef
      ];
    } else {
      return tableActionsDef;
    }
  }

  public buildTableRowActions(): TableActionDef[] {
    if (this.isAdmin) {
      return [
        new TableEditAction().getActionDef(),
        new TableEditUsersAction().getActionDef(),
        new TableOpenInMapsAction().getActionDef(),
        new TableDeleteAction().getActionDef()
      ];
    } else {
      return [
        new TableViewAction().getActionDef(),
        new TableOpenInMapsAction().getActionDef()
      ];
    }
  }

  buildTableDynamicRowActions(site: Site) {
    const openInMaps = new TableOpenInMapsAction().getActionDef();

    // check if GPs are available
    openInMaps.disabled = (site && site.address && site.address.latitude && site.address.longitude ) ? false : true;

    if (this.isAdmin) {
      return [
        new TableEditAction().getActionDef(),
        new TableEditUsersAction().getActionDef(),
        openInMaps,
        new TableDeleteAction().getActionDef()
      ];
    } else {
      return [
        new TableViewAction().getActionDef(),
        openInMaps
      ];
    }
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

  private _showSiteDialog(site?: any) {
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
    dialogRef.afterClosed().subscribe(result => this.loadAndPrepareData(false).subscribe());
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
      this.translateService.instant('sites.delete_confirm', { 'siteName': site.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.spinnerService.show();
        this.centralServerService.deleteSite(site.id).subscribe(response => {
          this.spinnerService.hide();
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('sites.delete_success', { 'siteName': site.name });
            this.loadAndPrepareData(false).subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'sites.delete_error');
          }
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'sites.delete_error');
        });
      }
    });
  }
}
