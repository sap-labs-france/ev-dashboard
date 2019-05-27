import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { TableDataSource } from 'app/shared/table/table-data-source';
import { SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, SiteArea, Charger } from 'app/common.types';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { CentralServerService } from 'app/services/central-server.service';
import { MessageService } from 'app/services/message.service';
import { Utils } from 'app/utils/Utils';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { AuthorizationService } from 'app/services/authorization-service';

import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditChargersAction } from 'app/shared/table/actions/table-edit-chargers-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { Constants } from 'app/utils/Constants';
import { DialogService } from 'app/services/dialog.service';
import { SiteAreaDialogComponent } from './site-area/site-area.dialog.component';
import { SiteAreaChargersDialogComponent } from './site-area/site-area-chargers/site-area-chargers.dialog.component';
import { SitesTableFilter } from 'app/shared/table/filters/site-filter';
import { TableDisplayChargersAction } from 'app/shared/table/actions/table-display-chargers-action';
import { SpinnerService } from 'app/services/spinner.service';

@Injectable()
export class OrganizationSiteAreasDataSource extends TableDataSource<SiteArea> {
  private isAdmin = false;
  private editAction = new TableEditAction().getActionDef();
  private editChargersAction = new TableEditChargersAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();
  private displayChargersAction = new TableDisplayChargersAction().getActionDef();

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
    // Init
    this.setStaticFilters([{ 'WithSite': true }]);
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectSite();
  }

  public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
      // Get Site Areas
      this.centralServerService.getSiteAreas(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((siteAreas) => {
          // Ok
          observer.next(siteAreas);
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
        name: 'site_areas.title',
        headerClass: 'col-30p',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'site.name',
        name: 'sites.site',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true
      },
      {
        id: 'site.address.city',
        name: 'general.city',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true
      },
      {
        id: 'site.address.country',
        name: 'general.country',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true
      }
    ];
    if (this.isAdmin) {
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
    if (this.isAdmin) {
      return [
        new TableCreateAction().getActionDef(),
        ...tableActionsDef
      ];
    } else {
      return tableActionsDef;
    }
  }

  buildTableDynamicRowActions(siteArea: SiteArea) {
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    // check if GPs are available
    openInMaps.disabled = (siteArea && siteArea.address && siteArea.address.latitude && siteArea.address.longitude ) ? false : true;
    if (this.isAdmin) {
      return [
        this.editAction,
        this.editChargersAction,
        openInMaps,
        this.deleteAction
      ];
    } else {
      return [
        this.viewAction,
        this.displayChargersAction,
        openInMaps
      ];
    }
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this._showSiteAreaDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'edit':
      case 'view':
        this._showSiteAreaDialog(rowItem);
        break;
      case 'edit_chargers':
      case 'display_chargers':
        this._showChargersDialog(rowItem);
        break;
      case 'delete':
        this._deleteSiteArea(rowItem);
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
      new SitesTableFilter().getFilterDef()
    ];
  }


  private _showPlace(rowItem) {
    if (rowItem && rowItem.address && rowItem.address.longitude && rowItem.address.latitude) {
      window.open(`http://maps.google.com/maps?q=${rowItem.address.latitude},${rowItem.address.longitude}`);
    }
  }

  private _showSiteAreaDialog(siteArea?: any) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '60vw';
    dialogConfig.minHeight = '40vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (siteArea) {
      dialogConfig.data = siteArea.id;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(SiteAreaDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe()
      }
    });
  }

  private _showChargersDialog(charger?: Charger) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (charger) {
      dialogConfig.data = charger;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    this.dialog.open(SiteAreaChargersDialogComponent, dialogConfig);
  }

  private _deleteSiteArea(siteArea) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('site_areas.delete_title'),
      this.translateService.instant('site_areas.delete_confirm', { 'siteAreaName': siteArea.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.centralServerService.deleteSiteArea(siteArea.id).subscribe(response => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('site_areas.delete_success', { 'siteAreaName': siteArea.name });
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'site_areas.delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'site_areas.delete_error');
        });
      }
    });
  }
}
