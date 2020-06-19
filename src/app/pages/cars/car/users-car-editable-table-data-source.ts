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
import { EditableTableDataSource } from 'app/shared/table/editable-table-data-source';
import { ChangeEvent, UserCar } from 'app/types/Car';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableEditType } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

@Injectable()
export class UsersCarEditableTableDataSource extends EditableTableDataSource<UserCar> {
  private carID: string;
  private changed: ChangeEvent = { changed: false };
  private removeAction = new TableRemoveAction().getActionDef();
  private users: UserCar[] = [];
  private usersToUpdate: UserCar[] = [];
  private usersToAdd: UserCar[] = [];
  private usersToRemove: UserCar[] = [];
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
        this.changed.changed = true;
        observer.next({
          count: this.users.length,
          result: this.users,
        });
        observer.complete();
      }
    });
  }

  public createRow() {
    return null;
  }

  public rowCellUpdated(cellValue: any, rowIndex: number, columnDef: TableColumnDef) {
    switch (columnDef.id) {
      case 'owner':
        if (cellValue === true) {
          this.changed.changed = true;
          this.users.forEach(userCar => {
            userCar.owner = false;
          });
          this.users[rowIndex].owner = true;
          let toAdd = false;
          this.usersToAdd.forEach(userCar => {
            if (userCar.user.id === this.users[rowIndex].user.id) {
              toAdd = true;
              userCar.owner = true;
            } else {
              userCar.owner = false;
            }
          });
          if (!toAdd) {
            const index = this.usersToUpdate.indexOf(this.users[rowIndex]);
            if (index > 0) {
              this.usersToUpdate.splice(index, 1);
            }
            this.usersToAdd.forEach(userCar => {
              userCar.owner = false;
            });
            this.users[rowIndex].owner = true;
            this.usersToUpdate.push(this.users[rowIndex]);
          } else {
            this.usersToAdd.forEach(userCar => {
              userCar.owner = false;
            });
          }
        } else {
          this.users[rowIndex].owner = true;
        }
        break;
      case 'default':
        let toAdd = false;
        this.usersToAdd.forEach(userCar => {
          if (userCar.user.id === this.users[rowIndex].user.id) {
            toAdd = true;
            userCar.default = cellValue;
          }
        });
        if (!toAdd) {
          this.changed.changed = true;
          const index = this.usersToUpdate.indexOf(this.users[rowIndex]);
          if (index > 0) {
            this.usersToUpdate.splice(index, 1);
          }
          this.users[rowIndex].default = cellValue;
          this.usersToUpdate.push(this.users[rowIndex]);
        }
        this.users[rowIndex].default = cellValue;
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, userCar: UserCar) {
    const index = this.editableRows.indexOf(userCar);
    let actionDone = false;
    switch (actionDef.id) {
      case ButtonAction.DELETE:
        this.editableRows.splice(index, 1);
        actionDone = true;
        break;
    }
  }

  public buildTableDef(): TableDef {
    return {
      isEditable: true,
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
    return [
      new TableAddAction().getActionDef(),
      new TableRemoveAction().getActionDef()
    ];
  }

  private showAddUsersDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    const staticFilters: { NotAssignedToCarID?: string; ExcludeUserIDs?: string } = {};
    if (this.carID) {
      staticFilters.NotAssignedToCarID = this.carID;
    }
    staticFilters.ExcludeUserIDs = this.users.map((userID) => userID.user.id).join('|');
    if (this.carID) {
      staticFilters.NotAssignedToCarID = this.carID;
    }
    dialogConfig.data = {
      staticFilter: staticFilters,
    };
    // Show
    const dialogRef = this.dialog.open(UsersDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((users) => this.addUsers(users));
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'user.name',
        name: 'users.name',
        class: 'text-left col-25p',
        sorted: true,
        direction: 'asc',
        sortable: true,
        editType: TableEditType.DISPLAY_ONLY,
      },
      {
        id: 'user.firstName',
        name: 'users.first_name',
        class: 'text-left col-25p',
        editType: TableEditType.DISPLAY_ONLY,
      },
      {
        id: 'user.email',
        name: 'users.email',
        class: 'text-left col-40p',
        editType: TableEditType.DISPLAY_ONLY,
      },
      {
        id: 'default',
        editType: TableEditType.CHECK_BOX,
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        name: 'cars.default_car',
      },
      {
        id: 'owner',
        editType: TableEditType.RADIO_BUTTON,
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        name: 'cars.car_owner',
      },
    ];
    return tableColumnDef;
  }

  public buildTableRowActions(): TableActionDef[] {
    return [];
  }

  public getUsers() {
    return this.users;
  }

  public getUsersToAdd() {
    return this.usersToAdd;
  }

  public getUsersToRemove() {
    return this.usersToRemove;
  }

  public getUsersToUpdate() {
    return this.usersToUpdate;
  }

  public emptyList(): boolean {
    return this.users.length < 1;
  }

  public changedList(): boolean {
    return this.changed.changed;
  }

  private removeUsers(users: UserCar[]) {
    users.forEach(userToRemove => {
      let toRemove = true;
      this.users.forEach((element, index) => {
        if (userToRemove.user.id === element.user.id) {
          this.users.splice(index, 1);
          if (userToRemove.owner && this.users.length > 0) {
            this.users[0].owner = true;
            this.rowCellUpdated(true, 0, { id: 'owner', name: '' });
          }
        }
      });
      this.usersToAdd.forEach((element, index) => {
        if (userToRemove.user.id === element.user.id) {
          toRemove = false;
          this.usersToAdd.splice(index, 1);
        }
      });
      this.usersToUpdate.forEach((element, index) => {
        if (userToRemove.user.id === element.user.id) {
          this.usersToUpdate.splice(index, 1);
        }
      });
      if (toRemove) {
        this.usersToRemove.push(userToRemove);
      }
    });
    this.refreshData().subscribe();
  }

  private addUsers(users: any[]) {
    if (users && users.length > 0) {
      for (const user of users) {
        let toAdd = true;
        this.usersToRemove.forEach((element, index) => {
          if (user.id === element.user.id) {
            toAdd = false;
            this.usersToRemove.splice(index, 1);
          }
        });
        if (toAdd) {
          this.usersToAdd.push({
            id: user.id,
            user: user.objectRef,
            default: false,
            owner: this.users.length === 0 ? true : false
          } as UserCar);
        }
        this.users.push({
          id: user.id,
          user: user.objectRef,
          default: false,
          owner: this.users.length === 0 ? true : false
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
