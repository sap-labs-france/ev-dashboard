import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {TableDataSource} from '../../shared/table/table-data-source';
import {SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, User} from '../../common.types';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {TableAutoRefreshAction} from '../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../shared/table/actions/table-refresh-action';
import {CentralServerService} from '../../services/central-server.service';
import {LocaleService} from '../../services/locale.service';
import {MessageService} from '../../services/message.service';
import {SpinnerService} from '../../services/spinner.service';
import {Utils} from '../../utils/Utils';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {TableCreateAction} from 'app/shared/table/actions/table-create-action';
import {DialogService} from '../../services/dialog.service';
import {UserRolePipe} from './formatters/user-role.pipe';
import {UserStatusPipe} from './formatters/user-status.pipe';
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

@Injectable()
export class UsersDataSource extends TableDataSource<User> {
  private readonly tableActionsRow: TableActionDef[];

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
    private userRolePipe: UserRolePipe,
    private userStatusPipe: UserStatusPipe,
    private userNamePipe: AppUserNamePipe,
    private arrayToStringPipe: AppArrayToStringPipe,
    private datePipe: AppDatePipe) {
    super();

    this.tableActionsRow = [
      new TableEditAction().getActionDef(),
      new TableDeleteAction().getActionDef()
    ];
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectUsers();
  }

  public loadData() {
    // Show
    this.spinnerService.show();
    // Get the Tenants
    this.centralServerService.getUsers(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((users) => {
      // Hide
      this.spinnerService.hide();
      // Update nbr records
      this.setNumberOfRecords(users.count);
      // Update Paginator
      this.updatePaginator();
      // Notify
      this.getDataSubjet().next(users.result);
      // Set the data
      this.setData(users.result);
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

  public getTableColumnDefs(): TableColumnDef[] {
    return [
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
        id: 'createdOn',
        name: 'users.created_on',
        formatter: (createdOn) => this.datePipe.transform(createdOn),
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true
      },
      {
        id: 'role',
        name: 'users.role',
        formatter: this.userRolePipe.transform,
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        sortable: true
      },
      {
        id: 'status',
        name: 'users.status',
        formatter: this.userStatusPipe.transform,
        headerClass: 'col-10p',
        class: 'text-left col-10p',
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
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableCreateAction().getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableRowActions(): TableActionDef[] {
    return this.tableActionsRow;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'edit':
        this._showUserDialog(rowItem);
        break;
      case 'delete':
        this._deleteUser(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [
      new UserRoleFilter(this.centralServerService).getFilterDef(),
      new UserStatusFilter(this.centralServerService).getFilterDef()
    ];
  }

  private _showUserDialog(user?: User) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    if (user) {
      dialogConfig.data = user;
    }
    // Open
    this.dialog.open(UserDialogComponent, dialogConfig);
  }

  private _deleteUser(user: User) {
    this.dialogService.createAndShowYesNoDialog(
      this.dialog,
      this.translateService.instant('users.delete_title'),
      this.translateService.instant('users.delete_confirm', {'userFullName': this.userNamePipe.transform(user)})
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.spinnerService.show();
        this.centralServerService.deleteUser(user.id).subscribe(response => {
          this.spinnerService.hide();
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.messageService.showSuccessMessage('users.delete_success', {'userFullName': this.userNamePipe.transform(user)});
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'users.delete_error');
          }
        }, (error) => {
          this.spinnerService.hide();
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'users.delete_error');
        });
      }
    });
  }
}
