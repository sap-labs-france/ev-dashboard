import {MatDialog, MatDialogConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from 'app/shared/table/table-data-source';
import {Site, TableActionDef, TableColumnDef, TableDef, User} from 'app/common.types';
import {CentralServerService} from 'app/services/central-server.service';
import {UsersDialogComponent} from 'app/shared/dialogs/users/users-dialog-component';
import {MessageService} from 'app/services/message.service';
import {Utils} from 'app/utils/Utils';
import {TableAddAction} from 'app/shared/table/actions/table-add-action';
import {TableRemoveAction} from 'app/shared/table/actions/table-remove-action';
import {DialogService} from 'app/services/dialog.service';
import {Constants} from 'app/utils/Constants';
import {Injectable} from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class SiteUsersDataSource extends TableDataSource<User> {
  private _site: Site;

  constructor(
      private messageService: MessageService,
      private translateService: TranslateService,
      private router: Router,
      private dialog: MatDialog,
      private dialogService: DialogService,
      private centralServerService: CentralServerService) {
    super();
    // Init
    this.initDataSource();
  }

  public loadData(refreshAction = false): Observable<any> {
    return new Observable((observer) => {
      // Site provided?
      if (this._site) {
        // Yes: Get data
        this.centralServerService.getUsers(this.buildFilterValues(),
          this.buildPaging(), this.buildOrdering()).subscribe((users) => {
          // Set number of records
          this.setNumberOfRecords(users.count);
          // Notify
          this.getDataSubjet().next(users.result);
          // Ok
          observer.next(users.result);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
      } else {
        observer.next([]);
        observer.complete();
      }
    });
  }

  public buildTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: true,
        multiple: true
      },
      search: {
        enabled: true
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'users.name',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'firstName',
        name: 'users.first_name',
        class: 'text-left col-25p'
      },
      {
        id: 'email',
        name: 'users.email',
        class: 'text-left col-40p'
      }
    ];
  }

  public setSite(site: Site) {
    // Set static filter
    this.setStaticFilters([
      {'SiteID': site.id}
    ]);
    // Set site
    this._site = site;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableAddAction().getActionDef(),
      new TableRemoveAction().getActionDef(),
      ...tableActionsDef
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'add':
        this._showAddUsersDialog();
        break;

      // Remove
      case 'remove':
        // Empty?
        if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          // Confirm
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('sites.remove_users_title'),
            this.translateService.instant('sites.remove_users_confirm')
          ).subscribe((response) => {
            // Check
            if (response === Constants.BUTTON_TYPE_YES) {
              // Remove
              this._removeUsers(this.getSelectedRows().map((row) => row.id));
            }
          });
        }
        break;
        case 'reset_filters':
          this.setSearchValue('');
          this.resetFilters();
          this.loadData();
          break;
    }
  }

  public _showAddUsersDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      excludeUsersOfSiteID: this._site.id,
      tableDef: {
        class: 'table-dialog-list',
        rowSelection: {
          enabled: true,
          multiple: true
        },
        search: {
          enabled: true
        }
      }
    };
    // Show
    const dialogRef = this.dialog.open(UsersDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe(users => this._addUsers(users));
  }

  private _removeUsers(userIDs) {
    // Yes: Update
    this.centralServerService.removeUsersFromSite(this._site.id, userIDs).subscribe(response => {
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage(this.translateService.instant('sites.remove_users_success'));
        // Refresh
        this.loadData();
        // Clear selection
        this.clearSelectedRows()
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.translateService.instant('sites.remove_users_error'));
      }
    }, (error) => {
      // No longer exists!
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'sites.remove_users_error');
    });
  }

  private _addUsers(users) {
    // Check
    if (users && users.length > 0) {
      // Get the IDs
      const userIDs = users.map((user) => user.key);
      // Yes: Update
      this.centralServerService.addUsersToSite(this._site.id, userIDs).subscribe(response => {
        // Ok?
        if (response.status === Constants.REST_RESPONSE_SUCCESS) {
          // Ok
          this.messageService.showSuccessMessage(this.translateService.instant('sites.update_users_success'));
          // Refresh
          this.loadData();
          // Clear selection
          this.clearSelectedRows()
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, this.translateService.instant('sites.update_users_error'));
        }
      }, (error) => {
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'sites.update_users_error');
      });
    }
  }
}
