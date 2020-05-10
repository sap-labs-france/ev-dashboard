import { Action, Entity } from 'app/types/Authorization';
import { Site, SiteButtonAction } from 'app/types/Site';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';

import { AuthorizationService } from 'app/services/authorization.service';
import { ButtonAction } from 'app/types/GlobalType';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import ChangeNotification from '../../../../types/ChangeNotification';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { CompanyTableFilter } from 'app/shared/table/filters/company-table-filter';
import { DataResult } from 'app/types/DataResult';
import { DialogService } from 'app/services/dialog.service';
import { Injectable } from '@angular/core';
import { IssuerFilter } from '../../../../shared/table/filters/issuer-filter';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAssignUsersToSiteAction } from 'app/shared/table/actions/table-assign-users-to-site-action';
import { TableCreateSiteAction } from 'app/shared/table/actions/table-create-site-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { TableDeleteSiteAction } from 'app/shared/table/actions/table-delete-site-action';
import { TableEditSiteAction } from 'app/shared/table/actions/table-edit-site-action';
import { TableExportOCPPParamsAction } from 'app/shared/table/actions/table-export-ocpp-params-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

@Injectable()
export class SitesListTableDataSource extends TableDataSource<Site> {
  private editAction = new TableEditSiteAction().getActionDef();
  private assignUsersToSite = new TableAssignUsersToSiteAction().getActionDef();
  private deleteAction = new TableDeleteSiteAction().getActionDef();
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
        new TableCreateSiteAction().getActionDef(),
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
    if (this.authorizationService.isAdmin() ||
        this.authorizationService.isSiteAdmin(site.id) ||
        this.authorizationService.isSiteOwner(site.id)) {
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
      case SiteButtonAction.CREATE_SITE:
        if (actionDef.action) {
          actionDef.action(this.dialog, this.refreshData.bind(this));
        }
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, site: Site) {
    switch (actionDef.id) {
      case SiteButtonAction.EDIT_SITE:
      case SiteButtonAction.VIEW_SITE:
        if (actionDef.action) {
          actionDef.action(site, this.dialog, this.refreshData.bind(this));
        }
        break;
      case SiteButtonAction.ASSIGN_USERS_TO_SITE:
        if (actionDef.action) {
          actionDef.action(site, this.dialog, this.refreshData.bind(this));
        }
        break;
      case SiteButtonAction.DELETE_SITE:
        if (actionDef.action) {
          actionDef.action(site, this.dialogService, this.translateService, this.messageService,
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
          actionDef.action(this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.router, this.spinnerService, null, site);
        }
        break;
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
}
