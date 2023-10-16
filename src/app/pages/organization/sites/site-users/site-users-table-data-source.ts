import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../../services/central-server.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { UsersDialogComponent } from '../../../../shared/dialogs/users/users-dialog.component';
import { TableAddAction } from '../../../../shared/table/actions/table-add-action';
import { TableRemoveAction } from '../../../../shared/table/actions/table-remove-action';
import { TableDataSource } from '../../../../shared/table/table-data-source';
import { SiteUsersAuthorizations } from '../../../../types/Authorization';
import { DataResult } from '../../../../types/DataResult';
import { ButtonAction, RestResponse } from '../../../../types/GlobalType';
import { Site } from '../../../../types/Site';
import {
  TableActionDef,
  TableColumnDef,
  TableDataSourceMode,
  TableDef,
} from '../../../../types/Table';
import { SiteUser, User } from '../../../../types/User';
import { Utils } from '../../../../utils/Utils';
import { SiteUsersSiteAdminComponent } from './site-users-site-admin.component';
import { SiteUsersSiteOwnerComponent } from './site-users-site-owner.component';

@Injectable()
export class SiteUsersTableDataSource extends TableDataSource<SiteUser> {
  private site!: Site;
  private addAction = new TableAddAction().getActionDef();
  private removeAction = new TableRemoveAction().getActionDef();
  private siteUsersAuthorization: SiteUsersAuthorizations;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private centralServerService: CentralServerService
  ) {
    super(spinnerService, translateService);
    this.initDataSource();
  }

  public loadDataImpl(requestNumberOfRecords: boolean): Observable<DataResult<SiteUser>> {
    return new Observable((observer) => {
      // Site data provided?
      if (this.site) {
        // Yes: Get data
        this.centralServerService
          .getSiteUsers(
            { ...this.buildFilterValues(), SiteID: this.site.id },
            this.getPaging(),
            this.getSorting()
          )
          .subscribe({
            next: (siteUser) => {
              // Initialize siteUsers authorization
              this.siteUsersAuthorization = {
                // Authorization actions
                canUpdateSiteUsers: Utils.convertToBoolean(siteUser.canUpdateSiteUsers),
              };
              // Don't override table def in case of number of record request
              if (!requestNumberOfRecords) {
                this.setTableColumnDef(this.buildDynamicTableColumnDefs());
                this.setTableDef(this.buildDynamicTableDef());
                this.setTableActionDef(this.buildDynamicTableActionsDef());
              }
              observer.next(siteUser);
              observer.complete();
            },
            error: (error) => {
              Utils.handleHttpError(
                error,
                this.router,
                this.messageService,
                this.centralServerService,
                'general.error_backend'
              );
              observer.error(error);
            },
          });
      } else {
        observer.next({
          count: 0,
          result: [],
        });
        observer.complete();
      }
    });
  }

  public buildTableDef(): TableDef {
    return this.buildDynamicTableDef();
  }

  public buildDynamicTableDef(): TableDef {
    if (this.getMode() === TableDataSourceMode.READ_WRITE) {
      return {
        class: 'table-dialog-list',
        rowFieldNameIdentifier: 'user.email',
        rowSelection: {
          enabled: this.siteUsersAuthorization?.canUpdateSiteUsers,
          multiple: true,
        },
        search: {
          enabled: true,
        },
      };
    }
    return {
      class: 'table-dialog-list',
      rowFieldNameIdentifier: 'user.email',
      rowSelection: {
        enabled: false,
        multiple: false,
      },
      search: {
        enabled: true,
      },
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    // need to split into build vs buildDynamic as there are info we don't have at the init time (user "can"s)
    return [];
  }

  public buildDynamicTableColumnDefs(): TableColumnDef[] {
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
        id: 'siteAdmin',
        isAngularComponent: true,
        angularComponent: SiteUsersSiteAdminComponent,
        name: 'sites.admin_role',
        headerClass: 'text-center',
        class: 'col-10p',
        visible: this.siteUsersAuthorization?.canUpdateSiteUsers,
        disabled: this.getMode() !== TableDataSourceMode.READ_WRITE,
        additionalParameters: {
          site: this.site,
        },
      },
      {
        id: 'siteOwner',
        isAngularComponent: true,
        angularComponent: SiteUsersSiteOwnerComponent,
        name: 'sites.owner_role',
        headerClass: 'text-center',
        class: 'col-10p',
        visible: this.siteUsersAuthorization?.canUpdateSiteUsers,
        disabled: this.getMode() !== TableDataSourceMode.READ_WRITE,
        additionalParameters: {
          site: this.site,
        },
      },
    ];
    return columns;
  }

  public setSite(site: Site) {
    this.site = site;
  }

  public buildTableActionsDef(): TableActionDef[] {
    return super.buildTableActionsDef();
  }

  public buildDynamicTableActionsDef(): TableActionDef[] {
    // Update filters visibility
    this.addAction.visible = this.site?.canAssignUnassignUsers;
    this.removeAction.visible = this.site?.canAssignUnassignUsers;
    const tableActionsDef = [];
    if (this.getMode() === TableDataSourceMode.READ_WRITE) {
      tableActionsDef.push(this.addAction);
      tableActionsDef.push(this.removeAction);
    }
    return tableActionsDef;
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
        if (Utils.isEmptyArray(this.getSelectedRows())) {
          this.messageService.showErrorMessage(
            this.translateService.instant('general.select_at_least_one_record')
          );
        } else {
          // Confirm
          this.dialogService
            .createAndShowYesNoDialog(
              this.translateService.instant('sites.remove_users_title'),
              this.translateService.instant('sites.remove_users_confirm')
            )
            .subscribe((response) => {
              if (response === ButtonAction.YES) {
                // Remove
                this.removeUsers(this.getSelectedRows().map((row) => row.user.id));
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

  private showAddUsersDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      staticFilter: {
        ExcludeSiteID: this.site.id,
        Issuer: true,
      },
    };
    // Show
    const dialogRef = this.dialog.open(UsersDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((users) => this.addUsers(users));
  }

  private removeUsers(userIDs: string[]) {
    // Yes: Update
    this.centralServerService.removeUsersFromSite(this.site.id, userIDs).subscribe({
      next: (response) => {
        // Ok?
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage(
            this.translateService.instant('sites.remove_users_success')
          );
          // Refresh
          this.refreshData().subscribe();
          // Clear selection
          this.clearSelectedRows();
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            this.translateService.instant('sites.remove_users_error')
          );
        }
      },
      error: (error) => {
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'sites.remove_users_error'
        );
      },
    });
  }

  private addUsers(users: User[]) {
    if (!Utils.isEmptyArray(users)) {
      // Get the IDs
      const userIDs = users.map((user) => user.key);
      // Yes: Update
      this.centralServerService.addUsersToSite(this.site.id, userIDs).subscribe({
        next: (response) => {
          // Ok?
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage(
              this.translateService.instant('sites.update_users_success')
            );
            // Refresh
            this.refreshData().subscribe();
            // Clear selection
            this.clearSelectedRows();
          } else {
            Utils.handleError(
              JSON.stringify(response),
              this.messageService,
              this.translateService.instant('sites.update_users_error')
            );
          }
        },
        error: (error) => {
          Utils.handleHttpError(
            error,
            this.router,
            this.messageService,
            this.centralServerService,
            'sites.update_users_error'
          );
        },
      });
    }
  }
}
