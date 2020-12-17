import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { TableSiteGenerateQrCodeConnectorAction, TableSiteGenerateQrCodeConnectorsActionDef } from 'shared/table/actions/sites/table-site-generate-qr-code-connector-action';

import { AuthorizationService } from '../../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../../services/central-server-notification.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { TableExportOCPPParamsAction, TableExportOCPPParamsActionDef } from '../../../../shared/table/actions/charging-stations/table-export-ocpp-params-action';
import { TableAssignUsersToSiteAction, TableAssignUsersToSiteActionDef } from '../../../../shared/table/actions/sites/table-assign-users-to-site-action';
import { TableCreateSiteAction, TableCreateSiteActionDef } from '../../../../shared/table/actions/sites/table-create-site-action';
import { TableDeleteSiteAction, TableDeleteSiteActionDef } from '../../../../shared/table/actions/sites/table-delete-site-action';
import { TableEditSiteAction, TableEditSiteActionDef } from '../../../../shared/table/actions/sites/table-edit-site-action';
import { TableViewSiteAction, TableViewSiteActionDef } from '../../../../shared/table/actions/sites/table-view-site-action';
import { TableAutoRefreshAction } from '../../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../../shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from '../../../../shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from '../../../../shared/table/actions/table-refresh-action';
import { CompanyTableFilter } from '../../../../shared/table/filters/company-table-filter';
import { IssuerFilter } from '../../../../shared/table/filters/issuer-filter';
import { TableDataSource } from '../../../../shared/table/table-data-source';
import ChangeNotification from '../../../../types/ChangeNotification';
import { ChargingStationButtonAction } from '../../../../types/ChargingStation';
import { DataResult } from '../../../../types/DataResult';
import { ButtonAction } from '../../../../types/GlobalType';
import { Site, SiteButtonAction } from '../../../../types/Site';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../../types/Table';
import { User } from '../../../../types/User';
import { Utils } from '../../../../utils/Utils';
import { SiteUsersDialogComponent } from '../site-users/site-users-dialog.component';
import { SiteDialogComponent } from '../site/site-dialog.component';

@Injectable()
export class SitesListTableDataSource extends TableDataSource<Site> {
  private editAction = new TableEditSiteAction().getActionDef();
  private assignUsersToSite = new TableAssignUsersToSiteAction().getActionDef();
  private deleteAction = new TableDeleteSiteAction().getActionDef();
  private viewAction = new TableViewSiteAction().getActionDef();
  private exportOCPPParamsAction = new TableExportOCPPParamsAction().getActionDef();
  private siteGenerateQrCodeConnectorAction = new TableSiteGenerateQrCodeConnectorAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe,
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
        headerClass: 'col-20p',
        class: 'text-left col-20p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'public',
        name: 'sites.public_site',
        headerClass: 'text-center col-10em',
        class: 'text-center col-10em',
        formatter: (publicSite: boolean) => publicSite ? this.translateService.instant('general.yes') : this.translateService.instant('general.no')
      },
      {
        id: 'autoUserSiteAssignment',
        name: 'sites.auto_assignment',
        headerClass: 'col-15p text-center',
        class: 'col-15p text-center',
        formatter: (autoUserSiteAssignment: boolean) => autoUserSiteAssignment ?
          this.translateService.instant('general.yes') : this.translateService.instant('general.no'),
      },
      {
        id: 'company.name',
        name: 'companies.title',
        headerClass: 'col-20p',
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
    if (this.authorizationService.isAdmin()) {
      tableColumnDef.push(
        {
          id: 'createdOn',
          name: 'users.created_on',
          formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
          headerClass: 'col-15em',
          class: 'col-15em',
          sortable: true,
        },
        {
          id: 'createdBy',
          name: 'users.created_by',
          formatter: (user: User) => Utils.buildUserFullName(user),
          headerClass: 'col-15em',
          class: 'col-15em',
        },
        {
          id: 'lastChangedOn',
          name: 'users.changed_on',
          formatter: (lastChangedOn: Date) => this.datePipe.transform(lastChangedOn),
          headerClass: 'col-15em',
          class: 'col-15em',
          sortable: true,
        },
        {
          id: 'lastChangedBy',
          name: 'users.changed_by',
          formatter: (user: User) => Utils.buildUserFullName(user),
          headerClass: 'col-15em',
          class: 'col-15em',
        },
      );
    }
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.canCreateSite()) {
      return [
        new TableCreateSiteAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(site: Site): TableActionDef[] {
    const actions = [];
    // Check if GPS is available
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    openInMaps.disabled = !Utils.containsAddressGPSCoordinates(site.address);
    let moreActions;
    if (site.issuer) {
      if (this.authorizationService.isAdmin() ||
        this.authorizationService.isSiteAdmin(site.id) ||
        this.authorizationService.isSiteOwner(site.id)) {
        actions.push(this.editAction);
        actions.push(this.assignUsersToSite);
        moreActions = new TableMoreAction([
          this.exportOCPPParamsAction,
          openInMaps,
          this.siteGenerateQrCodeConnectorAction
        ]).getActionDef();
      } else {
        actions.push(this.viewAction);
        moreActions = new TableMoreAction([
          openInMaps,
        ]).getActionDef();
      }
      if (this.authorizationService.canDeleteSite()) {
        if (moreActions.dropdownActions) {
          moreActions.dropdownActions.push(this.deleteAction);
        }
      }
    } else {
      actions.push(this.viewAction);
      actions.push(this.assignUsersToSite);
      moreActions = new TableMoreAction([
        openInMaps,
      ]).getActionDef();
    }
    actions.push(moreActions);
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case SiteButtonAction.CREATE_SITE:
        if (actionDef.action) {
          (actionDef as TableCreateSiteActionDef).action(SiteDialogComponent, this.dialog, this.refreshData.bind(this));
        }
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, site: Site) {
    switch (actionDef.id) {
      case SiteButtonAction.EDIT_SITE:
        if (actionDef.action) {
          (actionDef as TableEditSiteActionDef).action(SiteDialogComponent, site, this.dialog, this.refreshData.bind(this));
        }
        break;
      case SiteButtonAction.VIEW_SITE:
        if (actionDef.action) {
          (actionDef as TableViewSiteActionDef).action(SiteDialogComponent, site, this.dialog, this.refreshData.bind(this));
        }
        break;
      case SiteButtonAction.ASSIGN_USERS_TO_SITE:
        if (actionDef.action) {
          (actionDef as TableAssignUsersToSiteActionDef).action(
            SiteUsersDialogComponent, site, this.dialog, this.refreshData.bind(this));
        }
        break;
      case SiteButtonAction.DELETE_SITE:
        if (actionDef.action) {
          (actionDef as TableDeleteSiteActionDef).action(
            site, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ButtonAction.OPEN_IN_MAPS:
        if (actionDef.action) {
          actionDef.action(site.address.coordinates);
        }
        break;
      case ChargingStationButtonAction.EXPORT_OCPP_PARAMS:
        if (actionDef.action) {
          (actionDef as TableExportOCPPParamsActionDef).action(
            { site }, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.router, this.spinnerService);
        }
        break;
        case ChargingStationButtonAction.GENERATE_QR_CODE:
          if (actionDef.action) {
            (actionDef as TableSiteGenerateQrCodeConnectorsActionDef).action(
              site, this.translateService, this.spinnerService,
              this.messageService, this.centralServerService, this.router
            );
          }
          break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new IssuerFilter().getFilterDef(),
      new CompanyTableFilter().getFilterDef(),
    ];
  }
}
