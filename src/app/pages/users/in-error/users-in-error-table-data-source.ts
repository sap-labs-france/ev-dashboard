import { ErrorMessage, UserInError, UserInErrorType } from 'app/types/InError';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { User, UserButtonAction } from 'app/types/User';

import { AppArrayToStringPipe } from '../../../shared/formatters/app-array-to-string.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { AppUserRolePipe } from '../formatters/user-role.pipe';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import ChangeNotification from '../../../types/ChangeNotification';
import { ComponentService } from '../../../services/component.service';
import { DataResult } from 'app/types/DataResult';
import { DialogService } from '../../../services/dialog.service';
import { ErrorCodeDetailsComponent } from '../../../shared/component/error-code-details/error-code-details.component';
import { ErrorTypeTableFilter } from '../../../shared/table/filters/error-type-table-filter';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MessageService } from '../../../services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAssignSitesToUserAction } from 'app/shared/table/actions/table-assign-sites-to-user-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { TableDeleteUserAction } from 'app/shared/table/actions/table-delete-user-action';
import { TableEditUserAction } from 'app/shared/table/actions/table-edit-user-action';
import { TableForceSyncBillingAction } from '../../../shared/table/actions/table-force-sync-billing-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableSyncBillingUserAction } from '../../../shared/table/actions/table-sync-billing-user-action';
import TenantComponents from 'app/types/TenantComponents';
import { TranslateService } from '@ngx-translate/core';
import { UserRoleFilter } from '../filters/user-role-filter';
import { UserStatusFormatterComponent } from '../formatters/user-status-formatter.component';
import { Utils } from '../../../utils/Utils';

@Injectable()
export class UsersInErrorTableDataSource extends TableDataSource<User> {
  private editAction = new TableEditUserAction().getActionDef();
  private assignSitesToUser = new TableAssignSitesToUserAction().getActionDef();
  private deleteAction = new TableDeleteUserAction().getActionDef();
  private syncBillingUserAction = new TableSyncBillingUserAction().getActionDef();
  private forceSyncBillingUserAction = new TableForceSyncBillingAction().getActionDef();

  constructor(
      public spinnerService: SpinnerService,
      public translateService: TranslateService,
      private messageService: MessageService,
      private dialogService: DialogService,
      private router: Router,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService,
      private componentService: ComponentService,
      private userRolePipe: AppUserRolePipe,
      private userNamePipe: AppUserNamePipe,
      private arrayToStringPipe: AppArrayToStringPipe,
      private datePipe: AppDatePipe) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectUsers();
  }

  public loadDataImpl(): Observable<DataResult<User>> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService.getUsersInError(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((users) => {
          this.formatErrorMessages(users.result);
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
    },
    {
      id: 'createdOn',
      name: 'users.created_on',
      formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
      headerClass: 'col-15p',
      class: 'col-15p',
      sortable: true,
    });
    return columns as TableColumnDef[];
  }

  public buildTableActionsDef(): TableActionDef[] {
    return super.buildTableActionsDef();
  }

  public buildTableDynamicRowActions(user: UserInError): TableActionDef[] {
    const actions: TableActionDef[] = [
      this.editAction,
      this.assignSitesToUser,
    ];
    const moreActions = new TableMoreAction([]);
    actions.push(moreActions.getActionDef());
    if (this.componentService.isActive(TenantComponents.BILLING)) {
      if (user.errorCode === UserInErrorType.FAILED_BILLING_SYNCHRO) {
        moreActions.addActionInMoreActions(this.forceSyncBillingUserAction);
      } else if (user.errorCode === UserInErrorType.NO_BILLING_DATA) {
        moreActions.addActionInMoreActions(this.syncBillingUserAction);
      }
    }
    moreActions.addActionInMoreActions(this.deleteAction);
    return actions;
  }

  public rowActionTriggered(actionDef: TableActionDef, user: UserInError) {
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
            this.messageService, this.centralServerService, this.router, this.refreshData.bind(this)
          );
        }
        break;
      case UserButtonAction.SYNCHRONIZE_USER:
        if (this.syncBillingUserAction.action) {
          this.syncBillingUserAction.action(
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
      errorTypes.push({
        key: UserInErrorType.NO_BILLING_DATA,
        value: this.translateService.instant(`users.errors.${UserInErrorType.NO_BILLING_DATA}.title`),
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
