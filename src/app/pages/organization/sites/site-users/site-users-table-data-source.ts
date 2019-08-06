import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Site, TableActionDef, TableColumnDef, TableDef, UserSite } from 'app/common.types';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { UsersDialogComponent } from 'app/shared/dialogs/users/users-dialog.component';
import { TableAddAction } from 'app/shared/table/actions/table-add-action';
import { TableRemoveAction } from 'app/shared/table/actions/table-remove-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';

@Injectable()
export class SiteUsersTableDataSource extends TableDataSource<UserSite> {
  private _site: Site;

  constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private centralServerService: CentralServerService) {
    super(spinnerService);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
      // Site provided?
      if (this._site) {
        // Yes: Get data
        this.centralServerService.getSiteUsers(
          {...this.buildFilterValues(), SiteID: this._site.id},
          this.getPaging(), this.getSorting()).subscribe((siteUsers) => {
          // Ok
          observer.next(siteUsers);
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
      rowFieldNameIdentifier: 'user.email',
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
        id: 'user.name',
        name: 'users.name',
        class: 'text-left col-25p',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'user.firstName',
        name: 'users.first_name',
        class: 'text-left col-25p'
      },
      {
        id: 'user.email',
        name: 'users.email',
        class: 'text-left col-40p'
      // },
      // {
      //   id: 'siteAdmin',
      //   isAngularComponent: true,
      //   angularComponent: SiteAdminCheckboxComponent,
      //   name: 'sites.admin_role',
      //   class: 'col-10p'
      }
    ];
  }

  public setSite(site: Site) {
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
              this._removeUsers(this.getSelectedRows().map((row) => row.user.id));
            }
          });
        }
        break;

      case 'reset-filters':
        this.setSearchValue('');
        this.resetFilters();
        this.refreshData().subscribe();
        break;
    }
  }

  public _showAddUsersDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      staticFilter: {
        ExcludeSiteID: this._site.id
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
        this.refreshData().subscribe();
        // Clear selection
        this.clearSelectedRows();
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
          this.refreshData().subscribe();
          // Clear selection
          this.clearSelectedRows();
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
