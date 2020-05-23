import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { UsersDialogComponent } from 'app/shared/dialogs/users/users-dialog.component';
import { TableAddAction } from 'app/shared/table/actions/table-add-action';
import { TableRemoveAction } from 'app/shared/table/actions/table-remove-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { UserCar } from 'app/types/Car';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { ButtonType, TableActionDef, TableColumnDef, TableDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { UsersCarDefaultCheckboxComponent } from './users-car-default-checkbox.component';

@Injectable()
export class UsersCarTableDataSource extends TableDataSource<UserCar> {
  private carID: string;
  private addAction = new TableAddAction().getActionDef();
  private removeAction = new TableRemoveAction().getActionDef();
  private users: UserCar[] = [];
  private usersInitial: UserCar[] = [];
  private usersToRemove: UserCar[] = [];
  private usersToAdd: UserCar[] = [];
  private serverCalled = false;
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private centralServerService: CentralServerService) {
    super(spinnerService, translateService);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<UserCar>> {
    return new Observable((observer) => {
      // Site provided?
      if (this.carID && !this.serverCalled) {
        // Yes: Get data
        this.centralServerService.getUsersCar(
          { ...this.buildFilterValues(), carID: this.carID },
          this.getPaging(), this.getSorting()).subscribe((usersCar) => {
            this.users = usersCar.result;
            this.usersInitial = usersCar.result;
            this.removeAction.disabled = (this.users.length === 0);
            this.serverCalled = true;
            observer.next(usersCar);
            observer.complete();
          }, (error) => {
            // No longer exists!
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
            // Error
            observer.error(error);
          });
      } else {
        observer.next({
          count: this.users.length,
          result: this.users,
        });
        observer.complete();
      }
    });
  }

  public buildTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowFieldNameIdentifier: 'user.email',
      rowSelection: {
        enabled: true,
        multiple: true,
      },
      search: {
        enabled: true,
      },
    };
  }

  public setCarID(carID: string) {
    this.carID = carID;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      this.addAction,
      this.removeAction,
      ...tableActionsDef,
    ];
  }

  private showAddUsersDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      staticFilter: {
        ExcludeUserIDs: this.users.map((userID) => userID.user.id).join('|'),
      },
    };
    // Show
    const dialogRef = this.dialog.open(UsersDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((users) => this.addUsers(users));
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns: TableColumnDef[] = [
      {
        id: 'user.name',
        name: 'users.name',
        class: 'text-left col-25p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'user.firstName',
        name: 'users.first_name',
        class: 'text-left col-25p',
      },
      {
        id: 'user.email',
        name: 'users.email',
        class: 'text-left col-40p',
      },
      {
        id: 'isDefault',
        isAngularComponent: true,
        angularComponent: UsersCarDefaultCheckboxComponent,
        name: 'cars.default_car',
        class: 'col-10p',
      },
    ];
    return columns;
  }

  public getUsers() {
    return this.users;
  }


  private removeUsers(users: UserCar[]) {
    users.forEach(userToRemove => {
      this.users.forEach((element, index) => {
        if (userToRemove.user.id === element.user.id) {
          this.users.splice(index, 1);
        }
      });
    });
    this.refreshData().subscribe();
  }

  private addUsers(users: any[]) {
    if (users && users.length > 0) {
      for (const user of users) {
        this.users.push({
          id: user.id,
          user: user.objectRef,
          default: false
        } as UserCar);
        this.refreshData().subscribe();
      }
    }
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.ADD:
        this.showAddUsersDialog();
        break;

      // Remove
      case ButtonAction.REMOVE:
        // Empty?
        if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          // Confirm
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('cars.remove_users_title'),
            this.translateService.instant('cars.remove_users_confirm'),
          ).subscribe((response) => {
            // Check
            if (response === ButtonType.YES) {
              // Remove
              this.removeUsers(this.getSelectedRows().map((row) => row));
            }
          });
        }
        break;

      case ButtonAction.RESET_FILTERS:
        this.setSearchValue('');
        this.resetFilters();
        this.refreshData().subscribe();
        break;
    }
  }
}
