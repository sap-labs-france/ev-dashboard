import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { SitesDialogComponent } from '../../../shared/dialogs/sites/sites-dialog.component';
import { TableAddAction } from '../../../shared/table/actions/table-add-action';
import { TableRemoveAction } from '../../../shared/table/actions/table-remove-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { UserSitesAuthorizations } from '../../../types/Authorization';
import { DataResult } from '../../../types/DataResult';
import { ButtonAction, RestResponse } from '../../../types/GlobalType';
import { Site, UserSite } from '../../../types/Site';
import {
  TableActionDef,
  TableColumnDef,
  TableDataSourceMode,
  TableDef,
} from '../../../types/Table';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { UserSitesSiteAdminComponent } from './user-sites-site-admin.component';
import { UserSitesSiteOwnerComponent } from './user-sites-site-owner.component';

@Injectable()
export class UserSitesTableDataSource extends TableDataSource<UserSite> {
  private user!: User;
  private addAction = new TableAddAction().getActionDef();
  private removeAction = new TableRemoveAction().getActionDef();
  private userSitesAuthorization: UserSitesAuthorizations;
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
    // Init
    this.initDataSource();
  }

  public loadDataImpl(requestNumberOfRecords: boolean): Observable<DataResult<UserSite>> {
    return new Observable((observer) => {
      // User provided?
      if (this.user) {
        // Yes: Get data
        this.centralServerService
          .getUserSites(this.buildFilterValues(), this.getPaging(), this.getSorting())
          .subscribe({
            next: (userSites) => {
              // Initialize userSites authorization
              this.userSitesAuthorization = {
                // Authorization actions
                canUpdateUserSites: Utils.convertToBoolean(userSites.canUpdateUserSites),
              };
              // Don't override table def in case of number of record request
              if (!requestNumberOfRecords) {
                this.setTableColumnDef(this.buildDynamicTableColumnDefs());
                this.setTableDef(this.buildDynamicTableDef());
                this.setTableActionDef(this.buildDynamicTableActionsDef());
              }
              observer.next(userSites);
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
        rowSelection: {
          enabled: this.userSitesAuthorization?.canUpdateUserSites,
          multiple: true,
        },
        search: {
          enabled: true,
        },
        rowFieldNameIdentifier: 'site.id',
      };
    }
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: false,
        multiple: true,
      },
      search: {
        enabled: true,
      },
      rowFieldNameIdentifier: 'site.id',
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    // need to split into build vs buildDynamic as there are info we don't have at the init time (user "can"s)
    return [];
  }

  public buildDynamicTableColumnDefs(): TableColumnDef[] {
    const columns: TableColumnDef[] = [
      {
        id: 'site.name',
        name: 'sites.name',
        headerClass: 'col-50p',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'site.address.city',
        name: 'general.city',
        headerClass: 'col-25p',
        class: 'text-left',
      },
      {
        id: 'site.address.country',
        name: 'general.country',
        headerClass: 'col-20p',
        class: 'text-left',
      },
      {
        id: 'siteAdmin',
        isAngularComponent: true,
        angularComponent: UserSitesSiteAdminComponent,
        name: 'sites.admin_role',
        class: 'col-10p',
        visible: this.userSitesAuthorization?.canUpdateUserSites,
        disabled: this.getMode() !== TableDataSourceMode.READ_WRITE,
        additionalParameters: {
          user: this.user,
        },
      },
      {
        id: 'siteOwner',
        isAngularComponent: true,
        angularComponent: UserSitesSiteOwnerComponent,
        name: 'sites.owner_role',
        class: 'col-10p',
        visible: this.userSitesAuthorization?.canUpdateUserSites,
        disabled: this.getMode() !== TableDataSourceMode.READ_WRITE,
        additionalParameters: {
          user: this.user,
        },
      },
    ];
    return columns;
  }

  public setUser(user: User) {
    // Set static filter
    this.setStaticFilters([{ UserID: user.id }]);
    // Set user
    this.user = user;
  }

  public buildTableActionsDef(): TableActionDef[] {
    return super.buildTableActionsDef();
  }

  public buildDynamicTableActionsDef(): TableActionDef[] {
    // Update filters visibility
    this.addAction.visible = this.user?.canAssignUnassignSites;
    this.removeAction.visible = this.user?.canAssignUnassignSites;
    const tableActionsDef = super.buildTableActionsDef();
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
        this.showAddSitesDialog();
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
              this.translateService.instant('users.remove_sites_title'),
              this.translateService.instant('users.remove_sites_confirm')
            )
            .subscribe((response) => {
              if (response === ButtonAction.YES) {
                // Remove
                this.removeSites(this.getSelectedRows().map((row) => row.site.id));
              }
            });
        }
        break;
    }
  }

  public showAddSitesDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      staticFilter: {
        ExcludeSitesOfUserID: this.user.id,
      },
    };
    // Show
    const dialogRef = this.dialog.open(SitesDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((sites) => this.addSites(sites));
  }

  private removeSites(siteIDs: string[]) {
    // Yes: Update
    this.centralServerService.removeSitesFromUser(this.user.id, siteIDs).subscribe({
      next: (response) => {
        // Ok?
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage(
            this.translateService.instant('users.remove_sites_success')
          );
          // Refresh
          this.refreshData().subscribe();
          // Clear selection
          this.clearSelectedRows();
        } else {
          Utils.handleError(
            JSON.stringify(response),
            this.messageService,
            this.translateService.instant('users.remove_sites_error')
          );
        }
      },
      error: (error) => {
        Utils.handleHttpError(
          error,
          this.router,
          this.messageService,
          this.centralServerService,
          'users.remove_sites_error'
        );
      },
    });
  }

  private addSites(sites: Site[]) {
    if (!Utils.isEmptyArray(sites)) {
      // Get the IDs
      const siteIDs = sites.map((site) => site.key);
      // Yes: Update
      this.centralServerService.addSitesToUser(this.user.id, siteIDs).subscribe({
        next: (response) => {
          // Ok?
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage(
              this.translateService.instant('users.update_sites_success')
            );
            // Refresh
            this.refreshData().subscribe();
            // Clear selection
            this.clearSelectedRows();
          } else {
            Utils.handleError(
              JSON.stringify(response),
              this.messageService,
              this.translateService.instant('users.update_error')
            );
          }
        },
        error: (error) => {
          Utils.handleHttpError(
            error,
            this.router,
            this.messageService,
            this.centralServerService,
            'users.update_error'
          );
        },
      });
    }
  }
}
