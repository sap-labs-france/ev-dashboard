import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { UserSitesAuthorizations } from 'types/Authorization';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { SitesDialogComponent } from '../../../shared/dialogs/sites/sites-dialog.component';
import { TableAddAction } from '../../../shared/table/actions/table-add-action';
import { TableRemoveAction } from '../../../shared/table/actions/table-remove-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { DataResult } from '../../../types/DataResult';
import { ButtonAction, RestResponse } from '../../../types/GlobalType';
import { Site, SiteUser } from '../../../types/Site';
import { ButtonType, TableActionDef, TableColumnDef, TableDef } from '../../../types/Table';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { UserSitesAdminCheckboxComponent } from './user-sites-admin-checkbox.component';
import { UserSitesOwnerRadioComponent } from './user-sites-owner-radio.component';

@Injectable()
export class UserSitesTableDataSource extends TableDataSource<SiteUser> {
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
    private centralServerService: CentralServerService) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<SiteUser>> {
    return new Observable((observer) => {
      // User provided?
      if (this.user) {
        // Yes: Get data
        this.centralServerService.getUserSites(this.buildFilterValues(),
          this.getPaging(), this.getSorting()).subscribe((userSites) => {
          // Initialize siteUsers authorization
          this.userSitesAuthorization = {
            // Authorization actions
            canUpdateUserSite: Utils.convertToBoolean(userSites.canUpdateUserSite)
          };
          // Set table column def with userSitesAuthorization set
          this.setTableColumnDef(this.buildDynamicTableColumnDefs());
          this.setTableActionDef(this.buildDynamicTableActionsDef());
          observer.next(userSites);
          observer.complete();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          observer.error(error);
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
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: true,
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
        angularComponent: UserSitesAdminCheckboxComponent,
        name: 'sites.admin_role',
        class: 'col-10p',
        visible: this.userSitesAuthorization?.canUpdateUserSite,
      },
      {
        id: 'siteOwner',
        isAngularComponent: true,
        angularComponent: UserSitesOwnerRadioComponent,
        name: 'sites.owner_role',
        class: 'col-10p',
        visible: this.userSitesAuthorization?.canUpdateUserSite,
      }
    ];
    return columns;
  }

  public setUser(user: User) {
    // Set static filter
    this.setStaticFilters([
      {UserID: user.id},
    ]);
    // Set user
    this.user = user;
  }

  public buildTableActionsDef(): TableActionDef[] {
    return super.buildTableActionsDef();
  }

  public buildDynamicTableActionsDef(): TableActionDef[] {
    // Update filters visibility
    this.addAction.visible = this.userSitesAuthorization.canUpdateUserSite;
    this.removeAction.visible = this.userSitesAuthorization.canUpdateUserSite;
    const tableActionsDef = super.buildTableActionsDef();
    return [
      this.addAction,
      this.removeAction,
      ...tableActionsDef,
    ];
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
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          // Confirm
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('users.remove_sites_title'),
            this.translateService.instant('users.remove_sites_confirm'),
          ).subscribe((response) => {
            if (response === ButtonType.YES) {
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
        Issuer: true,
      },
    };
    // Show
    const dialogRef = this.dialog.open(SitesDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((sites) => this.addSites(sites));
  }

  private removeSites(siteIDs: string[]) {
    // Yes: Update
    this.centralServerService.removeSitesFromUser(this.user.id, siteIDs).subscribe((response) => {
      // Ok?
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage(this.translateService.instant('users.remove_sites_success'));
        // Refresh
        this.refreshData().subscribe();
        // Clear selection
        this.clearSelectedRows();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.translateService.instant('users.remove_sites_error'));
      }
    }, (error) => {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.remove_sites_error');
    });
  }

  private addSites(sites: Site[]) {
    if (!Utils.isEmptyArray(sites)) {
      // Get the IDs
      const siteIDs = sites.map((site) => site.key);
      // Yes: Update
      this.centralServerService.addSitesToUser(this.user.id, siteIDs).subscribe((response) => {
        // Ok?
        if (response.status === RestResponse.SUCCESS) {
          this.messageService.showSuccessMessage(this.translateService.instant('users.update_sites_success'));
          // Refresh
          this.refreshData().subscribe();
          // Clear selection
          this.clearSelectedRows();
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, this.translateService.instant('users.update_error'));
        }
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.update_error');
      });
    }
  }
}
