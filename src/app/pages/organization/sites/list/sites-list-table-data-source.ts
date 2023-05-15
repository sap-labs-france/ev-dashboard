import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ComponentService } from 'services/component.service';
import { PricingDefinitionsDialogComponent } from 'shared/pricing-definitions/pricing-definitions.dialog.component';
import {
  TableSiteGenerateQrCodeConnectorAction,
  TableSiteGenerateQrCodeConnectorsActionDef,
} from 'shared/table/actions/sites/table-site-generate-qr-code-connector-action';
import {
  TableViewPricingDefinitionsAction,
  TableViewPricingDefinitionsActionDef,
} from 'shared/table/actions/table-view-pricing-definitions-action';
import { SitesAuthorizations } from 'types/Authorization';
import { PricingButtonAction, PricingEntity } from 'types/Pricing';
import { TenantComponents } from 'types/Tenant';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import {
  TableExportOCPPParamsAction,
  TableExportOCPPParamsActionDef,
} from '../../../../shared/table/actions/charging-stations/table-export-ocpp-params-action';
import {
  TableAssignUsersToSiteAction,
  TableAssignUsersToSiteActionDef,
} from '../../../../shared/table/actions/sites/table-assign-users-to-site-action';
import {
  TableViewAssignedUsersOfSiteAction,
  TableViewAssignedUsersOfSiteActionDef,
} from '../../../../shared/table/actions/sites/table-assign-view-users-of-site-action';
import {
  TableCreateSiteAction,
  TableCreateSiteActionDef,
} from '../../../../shared/table/actions/sites/table-create-site-action';
import {
  TableDeleteSiteAction,
  TableDeleteSiteActionDef,
} from '../../../../shared/table/actions/sites/table-delete-site-action';
import {
  TableEditSiteAction,
  TableEditSiteActionDef,
} from '../../../../shared/table/actions/sites/table-edit-site-action';
import {
  TableViewSiteAction,
  TableViewSiteActionDef,
} from '../../../../shared/table/actions/sites/table-view-site-action';
import { TableAutoRefreshAction } from '../../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../../shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from '../../../../shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from '../../../../shared/table/actions/table-refresh-action';
import { CompanyTableFilter } from '../../../../shared/table/filters/company-table-filter';
import { IssuerFilter } from '../../../../shared/table/filters/issuer-filter';
import { TableDataSource } from '../../../../shared/table/table-data-source';
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
  private readonly isPricingComponentActive: boolean;
  private editAction = new TableEditSiteAction().getActionDef();
  private assignUsersToSite = new TableAssignUsersToSiteAction().getActionDef();
  private viewUsersOfSite = new TableViewAssignedUsersOfSiteAction().getActionDef();
  private deleteAction = new TableDeleteSiteAction().getActionDef();
  private viewAction = new TableViewSiteAction().getActionDef();
  private exportOCPPParamsAction = new TableExportOCPPParamsAction().getActionDef();
  private siteGenerateQrCodeConnectorAction =
    new TableSiteGenerateQrCodeConnectorAction().getActionDef();
  private createAction = new TableCreateSiteAction().getActionDef();
  private maintainPricingDefinitionsAction = new TableViewPricingDefinitionsAction().getActionDef();
  private companyFilter: TableFilterDef;
  private issuerFilter: TableFilterDef;
  private sitesAuthorizations: SitesAuthorizations;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe,
    private componentService: ComponentService
  ) {
    super(spinnerService, translateService);
    this.isPricingComponentActive = this.componentService.isActive(TenantComponents.PRICING);
    this.setStaticFilters([{ WithCompany: true }]);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Site>> {
    return new Observable((observer) => {
      // Get Sites
      this.centralServerService
        .getSites(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (sites) => {
            this.sitesAuthorizations = {
              canListCompanies: sites.canListCompanies,
              canCreate: sites.canCreate,
              projectFields: sites.projectFields,
              metadata: sites.metadata,
            };
            this.createAction.visible = Utils.convertToBoolean(sites.canCreate);
            this.companyFilter.visible = Utils.convertToBoolean(sites.canListCompanies);
            observer.next(sites);
            observer.complete();
          },
          error: (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          },
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
    return [
      {
        id: 'id',
        name: 'general.id',
        sortable: true,
        headerClass: 'col-30p',
        class: 'col-30p',
        sorted: true,
        direction: 'asc',
      },
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
        formatter: (publicSite: boolean, site: Site) =>
          site.issuer ? Utils.displayYesNo(this.translateService, publicSite) : '-',
      },
      {
        id: 'autoUserSiteAssignment',
        name: 'sites.auto_assignment',
        headerClass: 'col-15p text-center',
        class: 'col-15p text-center',
        formatter: (autoUserAssignment: boolean, site: Site) =>
          site.issuer ? Utils.displayYesNo(this.translateService, autoUserAssignment) : '-',
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
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [this.createAction, ...tableActionsDef];
  }

  public buildTableDynamicRowActions(site: Site): TableActionDef[] {
    const rowActions = [];
    // Check if GPS is available
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    openInMaps.disabled = !Utils.containsAddressGPSCoordinates(site.address);
    const moreActions = new TableMoreAction([]);
    if (site.canUpdate) {
      rowActions.push(this.editAction);
    } else {
      rowActions.push(this.viewAction);
    }
    if (site.canAssignUnassignUsers) {
      rowActions.push(this.assignUsersToSite);
    } else if (site.canListSiteUsers) {
      rowActions.push(this.viewUsersOfSite);
    }
    if (this.isPricingComponentActive && site.canMaintainPricingDefinitions) {
      rowActions.push(this.maintainPricingDefinitionsAction);
    }
    if (site.canExportOCPPParams) {
      moreActions.addActionInMoreActions(this.exportOCPPParamsAction);
    }
    if (site.canGenerateQrCode) {
      moreActions.addActionInMoreActions(this.siteGenerateQrCodeConnectorAction);
    }
    moreActions.addActionInMoreActions(openInMaps);
    if (site.canDelete) {
      moreActions.addActionInMoreActions(this.deleteAction);
    }
    rowActions.push(moreActions.getActionDef());
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case SiteButtonAction.CREATE_SITE:
        if (actionDef.action) {
          (actionDef as TableCreateSiteActionDef).action(
            SiteDialogComponent,
            this.dialog,
            { authorizations: this.sitesAuthorizations },
            this.refreshData.bind(this)
          );
        }
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, site: Site) {
    switch (actionDef.id) {
      case SiteButtonAction.EDIT_SITE:
        if (actionDef.action) {
          (actionDef as TableEditSiteActionDef).action(
            SiteDialogComponent,
            this.dialog,
            { dialogData: site, authorizations: this.sitesAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
      case SiteButtonAction.VIEW_SITE:
        if (actionDef.action) {
          (actionDef as TableViewSiteActionDef).action(
            SiteDialogComponent,
            this.dialog,
            { dialogData: site, authorizations: this.sitesAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
      case SiteButtonAction.ASSIGN_USERS_TO_SITE:
        if (actionDef.action) {
          (actionDef as TableAssignUsersToSiteActionDef).action(
            SiteUsersDialogComponent,
            { dialogData: site, authorizations: this.sitesAuthorizations },
            this.dialog,
            this.refreshData.bind(this)
          );
        }
        break;
      case SiteButtonAction.VIEW_USERS_OF_SITE:
        if (actionDef.action) {
          (actionDef as TableViewAssignedUsersOfSiteActionDef).action(
            SiteUsersDialogComponent,
            { dialogData: site, authorizations: this.sitesAuthorizations },
            this.dialog,
            this.refreshData.bind(this)
          );
        }
        break;
      case SiteButtonAction.DELETE_SITE:
        if (actionDef.action) {
          (actionDef as TableDeleteSiteActionDef).action(
            site,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
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
            { site },
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.router,
            this.spinnerService
          );
        }
        break;
      case ChargingStationButtonAction.GENERATE_QR_CODE:
        if (actionDef.action) {
          (actionDef as TableSiteGenerateQrCodeConnectorsActionDef).action(
            site,
            this.translateService,
            this.spinnerService,
            this.messageService,
            this.centralServerService,
            this.router
          );
        }
        break;
      case PricingButtonAction.VIEW_PRICING_DEFINITIONS:
        if (actionDef.action) {
          (actionDef as TableViewPricingDefinitionsActionDef).action(
            PricingDefinitionsDialogComponent,
            this.dialog,
            {
              dialogData: {
                id: null,
                context: {
                  entityID: site.id,
                  entityType: PricingEntity.SITE,
                  entityName: site.name,
                },
              },
            },
            this.refreshData.bind(this)
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
    this.issuerFilter = new IssuerFilter().getFilterDef();
    this.companyFilter = new CompanyTableFilter([this.issuerFilter]).getFilterDef();
    // Filter visibility will be defined by auth
    this.companyFilter.visible = false;
    const filters = [this.issuerFilter, this.companyFilter];
    return filters;
  }
}
