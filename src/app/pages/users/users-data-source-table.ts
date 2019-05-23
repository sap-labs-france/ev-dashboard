import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {TableDataSource} from '../../shared/table/table-data-source';
import {SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, User} from '../../common.types';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {TableAutoRefreshAction} from '../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../shared/table/actions/table-refresh-action';
import {CentralServerService} from '../../services/central-server.service';
import {MessageService} from '../../services/message.service';
import {Utils} from '../../utils/Utils';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {TableCreateAction} from 'app/shared/table/actions/table-create-action';
import {DialogService} from '../../services/dialog.service';
import {UserRolePipe} from './formatters/user-role.pipe';
import {TableEditAction} from '../../shared/table/actions/table-edit-action';
import {TableDeleteAction} from '../../shared/table/actions/table-delete-action';
import {Constants} from '../../utils/Constants';
import {TranslateService} from '@ngx-translate/core';
import {AppUserNamePipe} from '../../shared/formatters/app-user-name.pipe';
import {Injectable} from '@angular/core';
import {AppArrayToStringPipe} from '../../shared/formatters/app-array-to-string.pipe';
import {UserRoleFilter} from './filters/user-role-filter';
import {UserStatusFilter} from './filters/user-status-filter';
import {UserDialogComponent} from './user/user.dialog.component';
import {AppDatePipe} from '../../shared/formatters/app-date.pipe';
import {UserStatusComponent} from './formatters/user-status.component';
import {TableAssignSiteAction} from '../../shared/table/actions/table-edit-location';
import {UserSitesDialogComponent} from './user/user-sites.dialog.component';
import {ComponentEnum, ComponentService} from '../../services/component.service';
import { SpinnerService } from 'app/services/spinner.service';

@Injectable()
export class UsersDataSource extends TableDataSource<User> {

  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private dialogService: DialogService,
      private router: Router,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService,
      private componentService: ComponentService,
      private userRolePipe: UserRolePipe,
      private userNamePipe: AppUserNamePipe,
      private arrayToStringPipe: AppArrayToStringPipe,
      private datePipe: AppDatePipe) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectUsers();
  }

  public loadDataImpl(): Observable<any> {
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
        enabled: true
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const loggedUserRole = this.centralServerService.getLoggedUser().role;
    const columns = [];
    columns.push(
    {
      id: 'id',
      name: 'transactions.id',
      headerClass: 'd-none d-xl-table-cell',
      class: 'd-none d-xl-table-cell',
    },
    {
      id: 'status',
      name: 'users.status',
      isAngularComponent: true,
      angularComponent: UserStatusComponent,
      headerClass: 'col-10p',
      class: 'col-10p',
      sortable: true
    },
    {
      id: 'role',
      name: 'users.role',
      formatter: (role) => this.translateService.instant(this.userRolePipe.transform(role, loggedUserRole)),
      headerClass: 'col-10p',
      class: 'text-left col-10p',
      sortable: true
    },
    {
      id: 'name',
      name: 'users.name',
      headerClass: 'col-15p',
      class: 'text-left col-15p',
      sorted: true,
      direction: 'asc',
      sortable: true
    },
    {
      id: 'firstName',
      name: 'users.first_name',
      headerClass: 'col-15p',
      class: 'text-left col-15p',
      sortable: true
    },
    {
      id: 'email',
      name: 'users.email',
      headerClass: 'col-20p',
      class: 'col-20p',
      sortable: true
    },
    {
      id: 'tagIDs',
      name: 'users.tag_ids',
      formatter: this.arrayToStringPipe.transform,
      headerClass: 'col-15p',
      class: 'col-15p',
      sortable: true
    },
    {
      id: 'plateID',
      name: 'users.plate_id',
      headerClass: 'col-10p',
      class: 'col-10p',
      sortable: true
    },
    {
      id: 'createdOn',
      name: 'users.created_on',
      formatter: (createdOn) => this.datePipe.transform(createdOn),
      headerClass: 'col-15p',
      class: 'col-15p',
      sortable: true
    });
    return columns as TableColumnDef[];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableCreateAction().getActionDef(),
      ...tableActionsDef
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    if (this.componentService.isActive(ComponentEnum.ORGANIZATION)) {
      return [
        new TableEditAction().getActionDef(),
        new TableAssignSiteAction().getActionDef(),
        new TableDeleteAction().getActionDef()
      ];
    } else {
      return [
        new TableEditAction().getActionDef(),
        new TableDeleteAction().getActionDef()
      ];
    }
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
      new TableRefreshAction().getActionDef()
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new UserRoleFilter(this.centralServerService).getFilterDef(),
      new UserStatusFilter().getFilterDef()
    ];
  }

  public showUserDialog(user?: User) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (user) {
      dialogConfig.data = user.id;
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
      this.translateService.instant('users.delete_confirm', {'userFullName': this.userNamePipe.transform(user)})
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.centralServerService.deleteUser(user.id).subscribe(response => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.refreshData().subscribe();
            this.messageService.showSuccessMessage('users.delete_success', {'userFullName': this.userNamePipe.transform(user)});
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
