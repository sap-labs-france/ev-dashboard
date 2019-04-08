import {MatDialog, MatDialogConfig} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableDataSource} from '../../../shared/table/table-data-source';
import {Site, TableActionDef, TableColumnDef, TableDef, User} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {SitesDialogComponent} from '../../../shared/dialogs/sites/sites-dialog-component';
import {MessageService} from '../../../services/message.service';
import {Utils} from '../../../utils/Utils';
import {TableAddAction} from '../../../shared/table/actions/table-add-action';
import {TableRemoveAction} from '../../../shared/table/actions/table-remove-action';
import {DialogService} from '../../../services/dialog.service';
import {Constants} from '../../../utils/Constants';
import {Injectable} from '@angular/core';

@Injectable()
export class UserSitesDataSource extends TableDataSource<Site> {
  private user: User;

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

  public loadData() {
    // User provided?
    if (this.user) {
      // Yes: Get data
      this.centralServerService.getSites(this.getFilterValues(),
        this.getPaging(), this.getOrdering()).subscribe((sites) => {
        // Set number of records
        this.setNumberOfRecords(sites.count);
        // Update Paginator
        this.updatePaginator();
        // Notify
        this.getDataSubjet().next(sites.result);
        // Set the data
        this.setData(sites.result);
      }, (error) => {
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
    } else {
      this.updatePaginator();
        this.setData([]);
    }
  }

  public buildTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: true,
        multiple: true
      },
      search: {
        enabled: false
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'sites.name',
        headerClass: 'col-50p',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'address.city',
        name: 'general.city',
        headerClass: 'col-25p',
        class: 'text-left'
      },
      {
        id: 'address.country',
        name: 'general.country',
        headerClass: 'col-20p',
        class: 'text-left'
      }
    ];
  }

  public setUser(user: User) {
    // Set static filter
    this.setStaticFilters([
      {'UserID': user.id}
    ]);
    // Set user
    this.user = user;
  }

  public getTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.getTableActionsDef();
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
        this._showAddSitesDialog();
        break;

      // Remove
      case 'remove':
        // Empty?
        if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          // Confirm
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('users.remove_sites_title'),
            this.translateService.instant('users.remove_sites_confirm')
          ).subscribe((response) => {
            // Check
            if (response === Constants.BUTTON_TYPE_YES) {
              // Remove
              this._removeSites(this.getSelectedRows().map((row) => row.id));
            }
          });
        }
        break;
    }
  }

  public _showAddSitesDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      userID: this.user.id
    };
    // Show
    const dialogRef = this.dialog.open(SitesDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe(sites => this._addSites(sites));
  }

  private _removeSites(siteIDs) {
    // Yes: Update
    this.centralServerService.removeSitesFromUser(this.user.id, siteIDs).subscribe(response => {
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage(this.translateService.instant('users.remove_sites_success'));
        // Refresh
        this.loadData();
        // Clear selection
        this.clearSelectedRows()
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.translateService.instant('users.remove_sites_error'));
      }
    }, (error) => {
      // No longer exists!
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'users.remove_sites_error');
    });
  }

  private _addSites(sites) {
    // Check
    if (sites && sites.length > 0) {
      // Get the IDs
      const siteIDs = sites.map((site) => site.key);
      // Yes: Update
      this.centralServerService.addSitesToUser(this.user.id, siteIDs).subscribe(response => {
        // Ok?
        if (response.status === Constants.REST_RESPONSE_SUCCESS) {
          // Ok
          this.messageService.showSuccessMessage(this.translateService.instant('users.update_sites_success'));
          // Refresh
          this.loadData();
          // Clear selection
          this.clearSelectedRows()
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
