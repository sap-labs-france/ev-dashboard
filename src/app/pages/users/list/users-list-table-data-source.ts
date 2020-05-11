import { Action, Entity } from '../../../types/Authorization';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { User, UserButtonAction, UserToken } from 'app/types/User';

import { AppArrayToStringPipe } from '../../../shared/formatters/app-array-to-string.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { AppUserRolePipe } from '../formatters/user-role.pipe';
import { AuthorizationService } from '../../../services/authorization.service';
import { BillingButtonAction } from '../../../types/Billing';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import ChangeNotification from '../../../types/ChangeNotification';
import { ComponentService } from '../../../services/component.service';
import { DataResult } from 'app/types/DataResult';
import { DialogService } from '../../../services/dialog.service';
import { Injectable } from '@angular/core';
import { IssuerFilter } from '../../../shared/table/filters/issuer-filter';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../../services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAssignSitesToUserAction } from 'app/shared/table/actions/table-assign-sites-to-user-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableCreateUserAction } from 'app/shared/table/actions/table-create-user-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { TableDeleteUserAction } from 'app/shared/table/actions/table-delete-user-action';
import { TableEditUserAction } from 'app/shared/table/actions/table-edit-user-action';
import { TableForceSyncBillingAction } from 'app/shared/table/actions/table-force-sync-billing-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableSyncBillingUsersAction } from '../../../shared/table/actions/table-sync-billing-users-action';
import { Tag } from 'app/types/Tag';
import TenantComponents from 'app/types/TenantComponents';
import { TranslateService } from '@ngx-translate/core';
import { UserRoleFilter } from '../filters/user-role-filter';
import { UserStatusFilter } from '../filters/user-status-filter';
import { UserStatusFormatterComponent } from '../formatters/user-status-formatter.component';
import { Utils } from '../../../utils/Utils';

@Injectable()
export class UsersListTableDataSource extends TableDataSource<User> {
  private editAction = new TableEditUserAction().getActionDef();
  private assignSitesToUser = new TableAssignSitesToUserAction().getActionDef();
  private deleteAction = new TableDeleteUserAction().getActionDef();
  private syncBillingUsersAction = new TableSyncBillingUsersAction().getActionDef();
  private forceSyncBillingUserAction = new TableForceSyncBillingAction().getActionDef();
  private currentUser: UserToken;

  constructor(
      public spinnerService: SpinnerService,
      public translateService: TranslateService,
      private messageService: MessageService,
      private dialogService: DialogService,
      private router: Router,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService,
      private authorizationService: AuthorizationService,
      private componentService: ComponentService,
      private appUserRolePipe: AppUserRolePipe,
      private appUserNamePipe: AppUserNamePipe,
      private arrayToStringPipe: AppArrayToStringPipe,
      private datePipe: AppDatePipe) {
    super(spinnerService, translateService);
    // Init
    if (this.authorizationService.hasSitesAdminRights()) {
      this.setStaticFilters([{ SiteID: this.authorizationService.getSitesAdmin().join('|') }]);
    }
    this.initDataSource();
    // Store the current user
    this.currentUser = this.centralServerService.getLoggedUser();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectUsers();
  }

  public loadDataImpl(): Observable<DataResult<User>> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService.getUsers(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((users) => {
        // Ok
        observer.next(users);
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
    const loggedUserRole = this.centralServerService.getLoggedUser().role;
    const columns = [];
    columns.push(
      {
        id: 'status',
        name: 'users.status',
        isAngularComponent: true,
        angularComponent: UserStatusFormatterComponent,
        headerClass: 'col-10p',
        class: 'col-10p table-cell-angular-big-component',
        sortable: true,
      },
      {
        id: 'role',
        name: 'users.role',
        formatter: (role: string) => role ? this.translateService.instant(this.appUserRolePipe.transform(role, loggedUserRole)) : '-',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        sortable: true,
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
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
      },
    );
    if (this.authorizationService.isAdmin()) {
      columns.push(
        {
          id: 'tags',
          name: 'users.tags',
          formatter: (tags: Tag[]) => this.arrayToStringPipe.transform(tags.map((tag: Tag) => tag.id)),
          headerClass: 'col-15p',
          class: 'col-15p',
          sortable: true,
        },
        {
          id: 'plateID',
          name: 'users.plate_id',
          headerClass: 'col-10p',
          class: 'col-10p',
          sortable: true,
        },
      );
    }
    columns.push(
      {
        id: 'eulaAcceptedOn',
        name: 'users.eula_accepted_on',
        formatter: (eulaAcceptedOn: Date, row: User) => {
          return eulaAcceptedOn ? this.datePipe.transform(eulaAcceptedOn) + ` (${this.translateService.instant('general.version')} ${row.eulaAcceptedVersion})` : '-';
        },
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true,
      },
      {
        id: 'createdOn',
        name: 'users.created_on',
        formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true,
      },
      {
        id: 'lastChangedOn',
        name: 'users.changed_on',
        formatter: (lastChangedOn: Date) => this.datePipe.transform(lastChangedOn),
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true,
      },
      {
        id: 'lastChangedBy',
        name: 'users.changed_by',
        headerClass: 'col-15p',
        class: 'col-15p',
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
          name: 'billing.updatedOn',
          headerClass: 'col-15p',
          formatter: (lastChangedOn: Date) => this.datePipe.transform(lastChangedOn),
          class: 'col-15p',
          sortable: true,
        },
      );
    }
    return columns as TableColumnDef[];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    tableActionsDef.unshift(new TableCreateUserAction().getActionDef());
    if (this.componentService.isActive(TenantComponents.BILLING) &&
        this.authorizationService.canSynchronizeUsers()) {
      tableActionsDef.splice(1, 0, this.syncBillingUsersAction);
    }
    return [
      ...tableActionsDef,
    ];
  }

  public buildTableDynamicRowActions(user: User): TableActionDef[] {
    let actions;
    if (this.componentService.isActive(TenantComponents.ORGANIZATION) &&
        this.authorizationService.canAccess(Entity.USER, Action.UPDATE) &&
        this.authorizationService.canAccess(Entity.SITE, Action.UPDATE)) {
      actions = [
        this.editAction,
        this.assignSitesToUser,
      ];
    } else {
      actions = [
        this.editAction,
      ];
    }
    const moreActions = new TableMoreAction([]);
    if (this.componentService.isActive(TenantComponents.BILLING) &&
        this.authorizationService.canAccess(Entity.BILLING, Action.SYNCHRONIZE_USER)) {
      moreActions.addActionInMoreActions(this.forceSyncBillingUserAction);
    }
    if (this.currentUser.id !== user.id && this.authorizationService.canAccess(Entity.USER, Action.DELETE)) {
      moreActions.addActionInMoreActions(this.deleteAction);
    }
    if (moreActions.getActionsInMoreActions().length > 0) {
      actions.push(moreActions.getActionDef());
    }
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case UserButtonAction.CREATE_USER:
        if (actionDef.action) {
          actionDef.action(this.dialog, this.refreshData.bind(this));
        }
        break;
      case BillingButtonAction.SYNCHRONIZE_USERS:
        if (this.syncBillingUsersAction.action) {
          this.syncBillingUsersAction.action(
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.router,
          );
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, user: User) {
    switch (actionDef.id) {
      case UserButtonAction.EDIT_USER:
        if (actionDef.action) {
          actionDef.action(user, this.dialog, this.refreshData.bind(this));
        }
        break;
      case UserButtonAction.ASSIGN_SITES_TO_USER:
        if (actionDef.action) {
          actionDef.action(user, this.dialog, this.refreshData.bind(this));
        }
        break;
      case UserButtonAction.DELETE_USER:
        if (actionDef.action) {
          actionDef.action(user, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case UserButtonAction.BILLING_FORCE_SYNCHRONIZE_USER:
        if (this.forceSyncBillingUserAction.action) {
          this.forceSyncBillingUserAction.action(
            user, this.dialogService, this.translateService, this.spinnerService,
            this.messageService, this.centralServerService, this.router,
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
    return [
      new IssuerFilter().getFilterDef(),
      new UserRoleFilter(this.centralServerService).getFilterDef(),
      new UserStatusFilter().getFilterDef(),
    ];
  }
}
