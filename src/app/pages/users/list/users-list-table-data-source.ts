import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { Observable } from 'rxjs';
import { DataResult, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, User, UserToken } from '../../../common.types';
import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService, ComponentType } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { AppArrayToStringPipe } from '../../../shared/formatters/app-array-to-string.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableAssignSitesAction } from '../../../shared/table/actions/table-assign-sites-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableDeleteAction } from '../../../shared/table/actions/table-delete-action';
import { TableEditAction } from '../../../shared/table/actions/table-edit-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { UserRoleFilter } from '../filters/user-role-filter';
import { UserStatusFilter } from '../filters/user-status-filter';
import { AppUserRolePipe } from '../formatters/user-role.pipe';
import { UserStatusFormatterComponent } from '../formatters/user-status-formatter.component';
import { UserSitesDialogComponent } from '../user-sites/user-sites-dialog.component';
import { UserDialogComponent } from '../user/user.dialog.component';

@Injectable()
export class UsersListTableDataSource extends TableDataSource<User> {
  private editAction = new TableEditAction().getActionDef();
  private assignSiteAction = new TableAssignSitesAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();
  private currentUser: UserToken;

  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private translateService: TranslateService,
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
    super(spinnerService);
    // Init
    if (this.authorizationService.hasSitesAdminRights()) {
      this.setStaticFilters([{ SiteID: this.authorizationService.getSitesAdmin().join('|') }]);
    }
    this.initDataSource();
    // Store the current user
    this.currentUser = this.centralServerService.getLoggedUser();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
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
      class: 'col-10p',
      sortable: true,
    },
    {
      id: 'id',
      name: 'users.id',
      headerClass: 'd-none d-xl-table-cell',
      class: 'd-none d-xl-table-cell',
    },
    {
      id: 'role',
      name: 'users.role',
      formatter: (role) => this.translateService.instant(this.appUserRolePipe.transform(role, loggedUserRole)),
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
      id: 'tags',
      name: 'users.tags',
      formatter: (tags) => this.arrayToStringPipe.transform(tags.map((tag) => tag.id)),
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
    {
      id: 'createdOn',
      name: 'users.created_on',
      formatter: (createdOn) => this.datePipe.transform(createdOn),
      headerClass: 'col-15p',
      class: 'col-15p',
      sortable: true,
    });
    return columns as TableColumnDef[];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableCreateAction().getActionDef(),
      ...tableActionsDef,
    ];
  }

  public buildTableDynamicRowActions(user: User): TableActionDef[] {
    let actions;
    if (this.componentService.isActive(ComponentType.ORGANIZATION) && this.authorizationService.isAdmin()) {
      actions = [
        this.editAction,
        this.assignSiteAction,
      ];
    } else {
      actions = [
        this.editAction,
      ];
    }
    if (this.currentUser.id !== user.id && this.authorizationService.canAccess(Constants.ENTITY_USER, Constants.ACTION_DELETE)) {
      actions.push(this.deleteAction);
    }
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case 'create':
        this.showUserDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'edit':
        this.showUserDialog(rowItem);
        break;
      case 'assign_site':
        this.showSitesDialog(rowItem);
        break;
      case 'delete':
        this.deleteUser(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
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
      new UserRoleFilter(this.centralServerService).getFilterDef(),
      new UserStatusFilter().getFilterDef(),
    ];
  }

  public showUserDialog(user?: User) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (user) {
      dialogConfig.data = user;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(UserDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private showSitesDialog(user?: User) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (user) {
      dialogConfig.data = user;
    }
    // Open
    this.dialog.open(UserSitesDialogComponent, dialogConfig);
  }

  private deleteUser(user: User) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('users.delete_title'),
      this.translateService.instant('users.delete_confirm', {userFullName: this.appUserNamePipe.transform(user)}),
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.centralServerService.deleteUser(user.id).subscribe((response) => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.refreshData().subscribe();
            this.messageService.showSuccessMessage('users.delete_success', {userFullName: this.appUserNamePipe.transform(user)});
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'users.delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'users.delete_error');
        });
      }
    });
  }
}
