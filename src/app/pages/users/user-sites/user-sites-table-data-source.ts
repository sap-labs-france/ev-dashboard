import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

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

  constructor(
      public spinnerService: SpinnerService,
      public translateService: TranslateService,
      private messageService: MessageService,
      private router: Router,
      private dialog: MatDialog,
      private dialogService: DialogService,
      private centralServerService: CentralServerService,
      private authorisationService: AuthorizationService) {
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
          this.removeAction.disabled = (userSites.count === 0 || !this.hasSelectedRows());
          observer.next(userSites);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
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

  public toggleRowSelection(row: SiteUser, checked: boolean) {
    super.toggleRowSelection(row, checked);
    this.removeAction.disabled = !this.hasSelectedRows();
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
      },

    ];
    if (this.authorisationService.canCreateSiteArea()) {
      columns.push({
        id: 'siteOwner',
        isAngularComponent: true,
        angularComponent: UserSitesOwnerRadioComponent,
        name: 'sites.owner_role',
        class: 'col-10p',
      });
    }
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
        if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          // Confirm
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('users.remove_sites_title'),
            this.translateService.instant('users.remove_sites_confirm'),
          ).subscribe((response) => {
            // Check
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
        // Ok
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
      // No longer exists!
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.remove_sites_error');
    });
  }

  private addSites(sites: Site[]) {
    // Check
    if (sites && sites.length > 0) {
      // Get the IDs
      const siteIDs = sites.map((site) => site.key);
      // Yes: Update
      this.centralServerService.addSitesToUser(this.user.id, siteIDs).subscribe((response) => {
        // Ok?
        if (response.status === RestResponse.SUCCESS) {
          // Ok
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
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.update_error');
      });
    }
  }
}
