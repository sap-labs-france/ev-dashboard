import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';

import { TableDataSource } from 'app/shared/table/table-data-source';
import { SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, SiteArea, Charger } from 'app/common.types';
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
import { TableEditChargersAction } from 'app/shared/table/actions/table-edit-chargers-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { Constants } from 'app/utils/Constants';
import { DialogService } from 'app/services/dialog.service';
import { SiteAreaDialogComponent } from './site-area/site-area.dialog.component';
import { SiteAreaChargersDialogComponent } from './site-area/site-area-chargers/site-area-chargers.dialog.component';
import { SitesTableFilter } from 'app/shared/table/filters/site-filter';

@Injectable()
export class OrganizationSiteAreasDataSource extends TableDataSource<SiteArea> {
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
    this.setStaticFilters([{ 'WithSite': true }]);
    this.isAdmin = this.authorizationService.isAdmin() || this.authorizationService.isSuperAdmin();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectSite();
  }

  public loadData() {
    // Show
    this.spinnerService.show();
    // Get Site Areas
    this.centralServerService.getSiteAreas(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((siteAreas) => {
        // Hide
        this.spinnerService.hide();
        // Update nbr records
        this.setNumberOfRecords(siteAreas.count);
        // Update Paginator
        this.updatePaginator();
        // Notify
        this.getDataSubjet().next(siteAreas.result);
        // Set the data
        this.setData(siteAreas.result);
      }, (error) => {
        // Hide
        this.spinnerService.hide();
        // Show error
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
  }

  public getTableDef(): TableDef {
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
  }

  public getTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.getTableActionsDef();
    if (this.isAdmin) {
      return [
        new TableCreateAction().getActionDef()
      ].concat(tableActionsDef);
    } else {
      return tableActionsDef;
    }
  }

  public getTableRowActions(): TableActionDef[] {
    if (this.isAdmin) {
      return [
        new TableEditAction().getActionDef(),
        new TableEditChargersAction().getActionDef(),
        new TableOpenInMapsAction().getActionDef(),
        new TableDeleteAction().getActionDef()
      ];
    } else {
      return [
        new TableViewAction().getActionDef(),
        new TableEditChargersAction().getActionDef(),
        new TableOpenInMapsAction().getActionDef()
      ];
    }
  }

  specificRowActions(siteArea: SiteArea) {
    const openInMaps = new TableOpenInMapsAction().getActionDef();

    // check if GPs are available
    openInMaps.disabled = (siteArea && siteArea.address && siteArea.address.latitude && siteArea.address.longitude ) ? false : true;

    if (this.isAdmin) {
      return [
        new TableEditAction().getActionDef(),
        new TableEditChargersAction().getActionDef(),
        openInMaps,
        new TableDeleteAction().getActionDef()
      ];
    } else {
      return [
        new TableViewAction().getActionDef(),
        new TableEditChargersAction().getActionDef(),
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

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      // new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
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
    dialogRef.afterClosed().subscribe(result => this.loadData());
  }

  private _showChargersDialog(charger?: Charger) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    if (charger) {
      dialogConfig.data = charger;
    }
    // Open
    this.dialog.open(SiteAreaChargersDialogComponent, dialogConfig);
  }

  private _deleteSiteArea(siteArea) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('site_areas.delete_title'),
      this.translateService.instant('site_areas.delete_confirm', { 'siteAreaName': siteArea.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.spinnerService.show();
        this.centralServerService.deleteSiteArea(siteArea.id).subscribe(response => {
          this.spinnerService.hide();
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('site_areas.delete_success', { 'siteAreaName': siteArea.name });
            this.loadData();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'site_areas.delete_error');
          }
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'site_areas.delete_error');
        });
      }
    });
  }
}
