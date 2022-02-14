import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ErrorCodeDetailsComponent } from '../../../shared/component/error-code-details/error-code-details.component';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableAssignSitesToUserAction, TableAssignSitesToUserActionDef } from '../../../shared/table/actions/users/table-assign-sites-to-user-action';
import { TableDeleteUserAction, TableDeleteUserActionDef } from '../../../shared/table/actions/users/table-delete-user-action';
import { TableEditUserAction, TableEditUserActionDef } from '../../../shared/table/actions/users/table-edit-user-action';
import { TableForceSyncBillingUserAction } from '../../../shared/table/actions/users/table-force-sync-billing-user-action';
import { ErrorTypeTableFilter } from '../../../shared/table/filters/error-type-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { DataResult } from '../../../types/DataResult';
import { ErrorMessage, UserInError, UserInErrorType } from '../../../types/InError';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { TenantComponents } from '../../../types/Tenant';
import { User, UserButtonAction } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { UserRoleFilter } from '../filters/user-role-filter';
import { AppUserRolePipe } from '../formatters/user-role.pipe';
import { UserStatusFormatterComponent } from '../formatters/user-status-formatter.component';
import { UserSitesDialogComponent } from '../user-sites/user-sites-dialog.component';
import { UserDialogComponent } from '../user/user-dialog.component';

@Injectable()
export class UsersInErrorTableDataSource extends TableDataSource<User> {
  private editAction = new TableEditUserAction().getActionDef();
  private assignSitesToUser = new TableAssignSitesToUserAction().getActionDef();
  private deleteAction = new TableDeleteUserAction().getActionDef();
  private forceSyncBillingUserAction = new TableForceSyncBillingUserAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private userRolePipe: AppUserRolePipe) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<User>> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService.getUsersInError(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((users) => {
        this.formatErrorMessages(users.result);
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
        headerClass: 'col-10p text-center',
        class: 'col-10p table-cell-angular-big-component',
        sortable: true,
      },
      {
        id: 'role',
        name: 'users.role',
        formatter: (role: string) => this.translateService.instant(this.userRolePipe.transform(role, loggedUserRole)),
        headerClass: 'col-10p text-center',
        class: 'text-left col-10p text-center',
        sortable: true,
      },
      {
        id: 'name',
        name: 'users.name',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
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
      {
        id: 'errorCodeDetails',
        name: 'errors.details',
        sortable: false,
        headerClass: 'text-center',
        class: 'action-cell text-center',
        isAngularComponent: true,
        angularComponent: ErrorCodeDetailsComponent,
      },
      {
        id: 'errorCode',
        name: 'errors.title',
        class: 'col-30p text-danger',
        sortable: true,
        formatter: (value: string, row: UserInError) => this.translateService.instant(`users.errors.${row.errorCode}.title`),
      });
    return columns as TableColumnDef[];
  }

  public buildTableActionsDef(): TableActionDef[] {
    return super.buildTableActionsDef();
  }

  public buildTableDynamicRowActions(user: UserInError): TableActionDef[] {
    const rowActions: TableActionDef[] = [
      this.editAction,
      this.assignSitesToUser,
    ];
    const moreActions = new TableMoreAction([]);
    if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
      rowActions.push(moreActions.getActionDef());
    }
    if (this.componentService.isActive(TenantComponents.BILLING)) {
      if (user.errorCode === UserInErrorType.FAILED_BILLING_SYNCHRO) {
        moreActions.addActionInMoreActions(this.forceSyncBillingUserAction);
      }
    }
    moreActions.addActionInMoreActions(this.deleteAction);
    return rowActions;
  }

  public rowActionTriggered(actionDef: TableActionDef, user: UserInError) {
    switch (actionDef.id) {
      case UserButtonAction.EDIT_USER:
        if (actionDef.action) {
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
        if (this.forceSyncBillingUserAction.action) {
          this.forceSyncBillingUserAction.action(
            user, this.dialogService, this.translateService, this.spinnerService,
            this.messageService, this.centralServerService, this.router, this.refreshData.bind(this)
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
    // Create error type
    const errorTypes = [];
    errorTypes.push({
      key: UserInErrorType.NOT_ACTIVE,
      value: this.translateService.instant(`users.errors.${UserInErrorType.NOT_ACTIVE}.title`),
    });
    errorTypes.push({
      key: UserInErrorType.NOT_ASSIGNED,
      value: this.translateService.instant(`users.errors.${UserInErrorType.NOT_ASSIGNED}.title`),
    });
    errorTypes.push({
      key: UserInErrorType.INACTIVE_USER_ACCOUNT,
      value: this.translateService.instant(`users.errors.${UserInErrorType.INACTIVE_USER_ACCOUNT}.title`),
    });
    if (this.componentService.isActive(TenantComponents.BILLING)) {
      errorTypes.push({
        key: UserInErrorType.FAILED_BILLING_SYNCHRO,
        value: this.translateService.instant(`users.errors.${UserInErrorType.FAILED_BILLING_SYNCHRO}.title`),
      });
    }
    // Sort
    errorTypes.sort(Utils.sortArrayOfKeyValue);
    // Build filters
    const filters: TableFilterDef[] = [
      new UserRoleFilter(this.centralServerService).getFilterDef(),
    ];
    // Show Error types filter only if Organization component is active
    if (this.componentService.isActive(TenantComponents.ORGANIZATION)) {
      filters.push(new ErrorTypeTableFilter(errorTypes).getFilterDef());
    }
    return filters;
  }

  private formatErrorMessages(users: UserInError[]) {
    users.forEach((user: UserInError) => {
      const path = `users.errors.${user.errorCode}`;
      const errorMessage: ErrorMessage = {
        title: `${path}.title`,
        titleParameters: {},
        description: `${path}.description`,
        descriptionParameters: {},
        action: `${path}.action`,
        actionParameters: {},
      };
      user.errorMessage = errorMessage;
    });
  }
}
