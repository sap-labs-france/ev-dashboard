import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ImportDialogComponent } from 'shared/dialogs/import/import-dialog.component';
import { TableImportUsersAction, TableImportUsersActionDef } from 'shared/table/actions/users/table-import-users-action';
import { AuthorizationDefinitionFieldMetadata } from 'types/Authorization';
import { TagButtonAction } from 'types/Tag';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableOpenURLActionDef } from '../../../shared/table/actions/table-open-url-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableNavigateToTagsAction } from '../../../shared/table/actions/tags/table-navigate-to-tags-action';
import { TableNavigateToTransactionsAction } from '../../../shared/table/actions/transactions/table-navigate-to-transactions-action';
import { TableAssignSitesToUserAction, TableAssignSitesToUserActionDef } from '../../../shared/table/actions/users/table-assign-sites-to-user-action';
import { TableCreateUserAction, TableCreateUserActionDef } from '../../../shared/table/actions/users/table-create-user-action';
import { TableDeleteUserAction, TableDeleteUserActionDef } from '../../../shared/table/actions/users/table-delete-user-action';
import { TableEditUserAction, TableEditUserActionDef } from '../../../shared/table/actions/users/table-edit-user-action';
import { TableExportUsersAction, TableExportUsersActionDef } from '../../../shared/table/actions/users/table-export-users-action';
import { TableForceSyncBillingUserAction } from '../../../shared/table/actions/users/table-force-sync-billing-user-action';
import { IssuerFilter, organizations } from '../../../shared/table/filters/issuer-filter';
import { SiteTableFilter } from '../../../shared/table/filters/site-table-filter';
import { TagTableFilter } from '../../../shared/table/filters/tag-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { BillingButtonAction } from '../../../types/Billing';
import { DataResult } from '../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { TenantComponents } from '../../../types/Tenant';
import { TransactionButtonAction } from '../../../types/Transaction';
import { User, UserButtonAction } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { UserFreeAccessFilter } from '../filters/user-free-access-filter';
import { UserRoleFilter } from '../filters/user-role-filter';
import { UserStatusFilter } from '../filters/user-status-filter';
import { UserTechnicalFilter } from '../filters/user-technical-filter';
import { AppUserRolePipe } from '../formatters/user-role.pipe';
import { UserStatusFormatterComponent } from '../formatters/user-status-formatter.component';
import { UserSitesDialogComponent } from '../user-sites/user-sites-dialog.component';
import { UserDialogComponent } from '../user/user-dialog.component';

@Injectable()
export class UsersListTableDataSource extends TableDataSource<User> {
  private editAction = new TableEditUserAction().getActionDef();
  private assignSitesToUser = new TableAssignSitesToUserAction().getActionDef();
  private deleteAction = new TableDeleteUserAction().getActionDef();
  private synchronizeBillingUserAction = new TableForceSyncBillingUserAction().getActionDef();
  private navigateToTagsAction = new TableNavigateToTagsAction().getActionDef();
  private navigateToTransactionsAction = new TableNavigateToTransactionsAction().getActionDef();
  private metadata?: Record<string, AuthorizationDefinitionFieldMetadata>;
  private exportAction = new TableExportUsersAction().getActionDef();
  private importAction = new TableImportUsersAction().getActionDef();
  private createAction = new TableCreateUserAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    private appUserRolePipe: AppUserRolePipe,
    private datePipe: AppDatePipe,
    private windowService: WindowService) {
    super(spinnerService, translateService);
    // Init
    if (this.authorizationService.hasSitesAdminRights()) {
      this.setStaticFilters([{ SiteID: this.authorizationService.getSitesAdmin().join('|') }]);
    }
    this.initDataSource();
    this.initFilters();
  }

  public initFilters() {
    // Tag
    const tagID = this.windowService.getSearch('TagID');
    if (tagID) {
      const tagTableFilter = this.tableFiltersDef.find(filter => filter.id === 'tag');
      if (tagTableFilter) {
        tagTableFilter.currentValue.push({
          key: tagID, value: tagID,
        });
        this.filterChanged(tagTableFilter);
      }
    }
    // Issuer
    const issuer = this.windowService.getSearch('Issuer');
    if (issuer) {
      const issuerTableFilter = this.tableFiltersDef.find(filter => filter.id === 'issuer');
      if (issuerTableFilter) {
        issuerTableFilter.currentValue = [organizations.find(organisation => organisation.key === issuer)];
        this.filterChanged(issuerTableFilter);
      }
    }
  }

  public loadDataImpl(): Observable<DataResult<User>> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService.getUsers(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((users) => {
        this.metadata = users.metadata;
        this.createAction.visible = users.canCreate;
        this.importAction.visible = users.canImport;
        this.exportAction.visible = users.canExport;
        observer.next(users);
        observer.complete();
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
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
    const loggedUserRole = this.centralServerService.getLoggedUser().role;
    const columns = [];
    columns.push(
      {
        id: 'status',
        name: 'users.status',
        isAngularComponent: true,
        angularComponent: UserStatusFormatterComponent,
        headerClass: 'col-10em text-center',
        class: 'col-10em table-cell-angular-big-component',
        sortable: true,
      },
      {
        id: 'role',
        name: 'users.role',
        headerClass: 'col-10em',
        class: 'text-left col-10em',
        sortable: true,
        formatter: (role: string) => role ? this.translateService.instant(this.appUserRolePipe.transform(role, loggedUserRole)) : '-',
      },
      {
        id: 'name',
        name: 'users.name',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'firstName',
        name: 'users.first_name',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
      },
      {
        id: 'email',
        name: 'users.email',
        headerClass: 'col-20p',
        class: 'text-left col-20p',
        sortable: true,
      },
    );
    if (this.componentService.isActive(TenantComponents.BILLING)) {
      columns.push(
        {
          id: 'billingData.customerID',
          name: 'billing.id',
          headerClass: 'col-15p',
          class: 'col-15p',
          sortable: true,
        },
        {
          id: 'billingData.lastChangedOn',
          name: 'billing.updated_on',
          headerClass: 'col-15p',
          class: 'col-15p',
          sortable: true,
          formatter: (lastChangedOn: Date) => this.datePipe.transform(lastChangedOn),
        },
      );
    }
    columns.push(
      {
        id: 'createdOn',
        name: 'users.created_on',
        headerClass: 'col-15em',
        class: 'col-15em',
        sortable: true,
        formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
      },
      {
        id: 'createdBy',
        name: 'users.created_by',
        headerClass: 'col-15em',
        class: 'col-15em',
        formatter: (user: User) => Utils.buildUserFullName(user),
      },
      {
        id: 'lastChangedOn',
        name: 'users.changed_on',
        headerClass: 'col-15em',
        class: 'col-15em',
        sortable: true,
        formatter: (lastChangedOn: Date) => this.datePipe.transform(lastChangedOn),
      },
      {
        id: 'lastChangedBy',
        name: 'users.changed_by',
        headerClass: 'col-15em',
        class: 'col-15em',
        formatter: (user: User) => Utils.buildUserFullName(user),
      },
      {
        id: 'eulaAcceptedOn',
        name: 'users.eula_accepted_on',
        headerClass: 'col-20em',
        class: 'col-20em',
        sortable: true,
        formatter: (eulaAcceptedOn: Date, row: User) => eulaAcceptedOn ? this.datePipe.transform(eulaAcceptedOn) + ` (${this.translateService.instant('general.version')} ${row.eulaAcceptedVersion})` : '-',
      },
      {
        id: 'technical',
        name: 'users.technical_title',
        headerClass: 'col-10em text-center',
        class: 'col-10em text-center',
        sortable: true,
        formatter: (technicalUser: boolean) => Utils.displayYesNo(this.translateService, technicalUser),
      },
    );
    return columns as TableColumnDef[];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      this.createAction,
      this.importAction,
      this.exportAction,
      ...tableActionsDef,
    ];
  }

  public buildTableDynamicRowActions(user: User): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    const moreActions = new TableMoreAction([]);
    if (user.issuer) {
      if (user.canUpdate) {
        rowActions.push(this.editAction);
      }
      if (this.componentService.isActive(TenantComponents.ORGANIZATION)) {
        if (this.authorizationService.canListUsersSites()) {
          rowActions.push(this.assignSitesToUser);
        }
      }
      if (this.authorizationService.canListTokens()) {
        moreActions.addActionInMoreActions(this.navigateToTagsAction);
      }
      if (this.authorizationService.canListTransactions()) {
        moreActions.addActionInMoreActions(this.navigateToTransactionsAction);
      }
      if (this.componentService.isActive(TenantComponents.BILLING)) {
        if (this.authorizationService.canSynchronizeBillingUser()) {
          moreActions.addActionInMoreActions(this.synchronizeBillingUserAction);
        }
      }
      if (user.canDelete) {
        moreActions.addActionInMoreActions(this.deleteAction);
      }
      if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
        rowActions.push(moreActions.getActionDef());
      }
    } else {
      if (this.authorizationService.canListTokens()) {
        moreActions.addActionInMoreActions(this.navigateToTagsAction);
      }
      if (this.authorizationService.canListTransactions()) {
        moreActions.addActionInMoreActions(this.navigateToTransactionsAction);
      }
      if (user.canDelete) {
        moreActions.addActionInMoreActions(this.deleteAction);
      }
      if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
        rowActions.push(moreActions.getActionDef());
      }
    }
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case UserButtonAction.CREATE_USER:
        if (actionDef.action) {
          (actionDef as TableCreateUserActionDef).action(UserDialogComponent,
            this.dialog,{ dialogData: { metadata: this.metadata } as User }, this.refreshData.bind(this));
        }
        break;
      case UserButtonAction.EXPORT_USERS:
        if (actionDef.action) {
          (actionDef as TableExportUsersActionDef).action(this.buildFilterValues(), this.dialogService,
            this.translateService, this.messageService, this.centralServerService, this.router,
            this.spinnerService);
        }
        break;
      case UserButtonAction.IMPORT_USERS:
        if (actionDef.action) {
          (actionDef as TableImportUsersActionDef).action(ImportDialogComponent, this.dialog);
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, user: User) {
    switch (actionDef.id) {
      case UserButtonAction.EDIT_USER:
        if (actionDef.action) {
          user.metadata= this.metadata;
          (actionDef as TableEditUserActionDef).action(UserDialogComponent, this.dialog,
            { dialogData: user }, this.refreshData.bind(this));
        }
        break;
      case UserButtonAction.ASSIGN_SITES_TO_USER:
        if (actionDef.action) {
          (actionDef as TableAssignSitesToUserActionDef).action(
            UserSitesDialogComponent, { dialogData: user }, this.dialog, this.refreshData.bind(this));
        }
        break;
      case UserButtonAction.DELETE_USER:
        if (actionDef.action) {
          (actionDef as TableDeleteUserActionDef).action(
            user, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case UserButtonAction.BILLING_FORCE_SYNCHRONIZE_USER:
        if (this.synchronizeBillingUserAction.action) {
          this.synchronizeBillingUserAction.action(
            user, this.dialogService, this.translateService, this.spinnerService,
            this.messageService, this.centralServerService, this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case TagButtonAction.NAVIGATE_TO_TAGS:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action('tags#all?UserID=' + user.id + '&Issuer=' + user.issuer);
        }
        break;
      case TransactionButtonAction.NAVIGATE_TO_TRANSACTIONS:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action('transactions#history?UserID=' + user.id + '&Issuer=' + user.issuer);
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
    const issuerFilter = new IssuerFilter().getFilterDef();
    const siteFilter = new SiteTableFilter([issuerFilter]).getFilterDef();
    const filters = [
      issuerFilter,
      new UserRoleFilter(this.centralServerService).getFilterDef(),
      new UserStatusFilter().getFilterDef(),
      new TagTableFilter([issuerFilter]).getFilterDef(),
      siteFilter,
      new UserTechnicalFilter().getFilterDef(),
    ];
    if (this.componentService.isActive(TenantComponents.BILLING)) {
      filters.push(new UserFreeAccessFilter().getFilterDef());
    }
    if (!this.componentService.isActive(TenantComponents.ORGANIZATION)) {
      siteFilter.visible = false;
    }
    return filters;
  }
}
