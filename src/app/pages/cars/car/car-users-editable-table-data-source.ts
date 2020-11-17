import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { UsersDialogComponent } from '../../../shared/dialogs/users/users-dialog.component';
import { TableAddAction } from '../../../shared/table/actions/table-add-action';
import { TableRemoveAction } from '../../../shared/table/actions/table-remove-action';
import { EditableTableDataSource } from '../../../shared/table/editable-table-data-source';
import { DataResult } from '../../../types/DataResult';
import { ButtonAction, KeyValue } from '../../../types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef, TableEditType } from '../../../types/Table';
import { User, UserCar } from '../../../types/User';
import { Utils } from '../../../utils/Utils';

@Injectable()
export class CarUsersEditableTableDataSource extends EditableTableDataSource<UserCar> {
  private carID: string;
  private carUsers: UserCar[] = [];
  private serverCalled = false;
  private addAction: TableActionDef;
  private removeAction: TableActionDef;

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private router: Router,
    private dialog: MatDialog) {
    super(spinnerService, translateService);
    this.initDataSource();
  }

  public buildTableDef(): TableDef {
    return {
      id: 'CarUsersEditableTableDataSource',
      isEditable: true,
      class: 'table-dialog-list',
      rowFieldNameIdentifier: 'user.email',
      rowSelection: {
        enabled: true,
        multiple: true,
      },
      search: {
        enabled: false,
      },
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'user.name',
        name: 'users.name',
        class: 'text-left col-25p',
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

  public loadDataImpl(): Observable<DataResult<UserCar>> {
    return new Observable((observer) => {
      // Car provided?
      if (this.carID) {
        // Yes: Get data
        const paging = this.getPaging();
        this.centralServerService.getCarUsers(
          { ...this.buildFilterValues(), CarID: this.carID },
          paging, this.getSorting()).subscribe((usersCar) => {
            // Initial Assignment
            if (!this.serverCalled) {
              // Keep original list for comparison
              this.carUsers = Utils.cloneObject(usersCar.result) as UserCar[];
              // Set rows manually
              this.editableRows = usersCar.result;
              this.serverCalled = true;
            }
            // Check Paging
            if (paging.skip !== 0) {
              // Add new paginated rows
              this.carUsers.splice(paging.skip, paging.limit, ...Utils.cloneObject(usersCar.result) as UserCar[]);
              this.editableRows.splice(paging.skip, paging.limit, ...usersCar.result);
            }
            // Create the form controls
            this.createFormControls();
            this.removeAction.disabled = (usersCar.count === 0 || !this.hasSelectedRows());
            observer.next({
              count: usersCar.count + this.getAddedCarUsers().length - this.getRemovedCarUsers().length,
              result: paging.skip !== 0 ? usersCar.result : this.editableRows,
            });
            observer.complete();
          }, (error) => {
            // No longer exists!
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
            // Error
            observer.error(error);
          });
      } else {
        // Recreate the form controls
        this.createFormControls();
        this.removeAction.disabled = (this.editableRows.length === 0 || !this.hasSelectedRows());
        observer.next({
          count: this.editableRows.length,
          result: this.editableRows,
        });
        observer.complete();
      }
    });
  }

  protected createRow(): UserCar {
    return null;
  }

  public setCarID(carID: string) {
    this.carID = carID;
    // Handle own disconnected form array
    this.setFormArray(new FormArray([]));
  }

  public buildTableActionsDef(): TableActionDef[] {
    this.addAction = new TableAddAction().getActionDef();
    this.removeAction = new TableRemoveAction().getActionDef();
    return [
      this.addAction,
      this.removeAction,
    ];
  }

  public toggleRowSelection(row: UserCar, checked: boolean) {
    super.toggleRowSelection(row, checked);
    this.removeAction.disabled = !this.hasSelectedRows();
  }

  public buildTableRowActions(): TableActionDef[] {
    return [];
  }

  public getUpsertedUsers(): UserCar[] {
    return [
      ...this.getAddedCarUsers(),
      ...this.getUpdatedCarUsers(),
    ];
  }

  private getAddedCarUsers(): UserCar[] {
    // Check users in original list not in updated list
    const addedCarUsers: UserCar[] = [];
    // Updated users
    for (const carUser of this.editableRows) {
      // Original users
      const foundUserCar = this.carUsers.find((updatedCarUser) => updatedCarUser.user.id === carUser.user.id);
      if (!foundUserCar) {
        addedCarUsers.push({
          user: carUser.user,
          carID: carUser.carID,
          default: carUser.default,
          owner: carUser.owner,
        } as UserCar);
      }
    }
    return addedCarUsers;
  }

  private getUpdatedCarUsers(): UserCar[] {
    // Check users in original list not in updated list
    const updatedCarUsers: UserCar[] = [];
    // Original users
    for (const carUser of this.carUsers) {
      // Updated users
      const foundUserCar = this.editableRows.find((updatedCarUser) => updatedCarUser.user.id === carUser.user.id);
      if (foundUserCar) {
        // Check if diff
        if (foundUserCar.owner !== carUser.owner ||
            foundUserCar.default !== carUser.default) {
          // Yes
          updatedCarUsers.push({
            id: foundUserCar.id,
            user: foundUserCar.user,
            carID: foundUserCar.carID,
            default: foundUserCar.default,
            owner: foundUserCar.owner,
          } as UserCar);
        }
      }
    }
    return updatedCarUsers;
  }

  public getRemovedCarUsers(): UserCar[] {
    // Check users in original list not in updated list
    const removedCarUsers: UserCar[] = [];
    // Original users
    for (const carUser of this.carUsers) {
      // Updated users
      const foundUserCar = this.editableRows.find((updatedCarUser) => updatedCarUser.user.id === carUser.user.id);
      if (!foundUserCar) {
        removedCarUsers.push(carUser);
      }
    }
    return removedCarUsers;
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
          // Remove
          this.removeUsers(this.getSelectedRows());
        }
        break;
      case ButtonAction.RESET_FILTERS:
        this.setSearchValue('');
        this.resetFilters();
        this.refreshData().subscribe();
        break;
    }
  }

  private showAddUsersDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    const filter = {};
    if (this.carID) {
      filter['NotAssignedToCarID'] = this.carID;
    }
    const addedUsers = this.getAddedCarUsers();
    if (addedUsers.length > 0) {
      filter['ExcludeUserIDs'] = addedUsers.map((carUser) => carUser.user.id).join('|');
    }
    const removedUsers = this.getRemovedCarUsers();
    if (removedUsers.length > 0) {
      filter['IncludeCarUserIDs'] = removedUsers.map((carUser) => carUser.user.id).join('|');
    }
    // Set data
    dialogConfig.data = {
      staticFilter: filter,
    };
    // Show
    const dialogRef = this.dialog.open(UsersDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((users) => this.addUsers(users));
  }

  private removeUsers(carUsersToRemove: UserCar[]) {
    if (!Utils.isEmptyArray(carUsersToRemove)) {
      const carUsers = this.getContent();
      for (let i = carUsers.length - 1; i >= 0; i--) {
        const carUser = carUsers[i];
        // Search
        const foundUser = carUsersToRemove.find((carUserToRemove) => carUserToRemove.user.id === carUser.user.id);
        // Remove
        if (foundUser) {
          carUsers.splice(i, 1);
        }
      }
      // Init
      this.clearSelectedRows();
      // Refresh
      this.refreshData().subscribe();
      // Notify
      this.tableChangedSubject.next(this.editableRows);
    }
  }

  private addUsers(users: KeyValue[]) {
    if (!Utils.isEmptyArray(users)) {
      this.getContent().push(...users.map((user) => {
        return {
          user: user.objectRef as User,
          carID: this.carID,
          default: false,
          owner: false
        } as UserCar;
      }));
      // Notify
      this.tableChangedSubject.next(this.editableRows);
      // Refresh
      this.refreshData().subscribe();
    }
  }
}
