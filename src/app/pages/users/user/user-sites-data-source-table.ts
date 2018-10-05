import { MatDialog, MatDialogConfig } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { Site, User, TableDef, TableColumnDef, TableActionDef } from '../../../common.types';
import { CentralServerService } from '../../../services/central-server.service';
import { SitesDialogComponent } from '../../../shared/dialogs/sites/sites-dialog-component';
import { MessageService } from '../../../services/message.service';
import { Utils } from '../../../utils/Utils';
import { TableAddAction } from '../../../shared/table/actions/table-add-action';
import { TableRemoveAction } from '../../../shared/table/actions/table-remove-action';
import { DialogService } from '../../../services/dialog.service';
import { Constants } from '../../../utils/Constants';

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
    }

    public loadData() {
        // User provided?
        if (this.user) {
            // Yes: Get data
            this.centralServerService.getSites(this.getFilterValues(),
                this.getPaging(), this.getOrdering()).subscribe((sites) => {
                    // Set number of records
                    this.setNumberOfRecords(sites.count);
                    // Update page length (number of sites is in User)
                    this.updatePaginator();
                    // Return sites
                    this.getDataSubjet().next(sites.result);
                    // Keep it
                    this.setData(sites.result);
                }, (error) => {
                    // No longer exists!
                    Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                        this.translateService.instant('general.error_backend'));
                });
        } else {
            // Update page length
            this.updatePaginator();
            // Return sites
            this.getDataSubjet().next([]);
        }
    }

    public getTableDef(): TableDef {
        return {
            class: 'table-list-under-tabs',
            rowSelection: {
                enabled: true,
                multiple: true
            },
            search: {
                enabled: false
            }
        };
    }

    public getTableColumnDefs(): TableColumnDef[] {
        return [
            {
                id: 'name',
                name: this.translateService.instant('sites.name'),
                class: 'text-left col-50p',
                sorted: true,
                direction: 'asc'
            },
            {
                id: 'address.city',
                name: this.translateService.instant('general.city'),
                class: 'text-left col-25p'
            },
            {
                id: 'address.country',
                name: this.translateService.instant('general.country'),
                class: 'text-left col-20p'
            }
        ];
    }

    public setUser(user: User) {
        // Set static filter
        this.setStaticFilters([
            { 'UserID': user.id }
        ]);
        // Set user
        this.user = user;
    }

    public getTableActionsDef(): TableActionDef[] {
        return [
            new TableAddAction(this.translateService).getActionDef(),
            new TableRemoveAction(this.translateService).getActionDef()
        ];
    }

    public actionTriggered(actionDef: TableActionDef) {
        // Action
        switch (actionDef.id) {
            case 'remove':
                // Empty?
                if (this.getSelectedRows().length === 0) {
                    this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
                } else {
                    // Confirm
                    this.dialogService.createAndShowYesNoDialog(
                        this.dialog,
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
            default:
                super.actionTriggered(actionDef);
        }
    }

    public showAddComponent() {
        const dialogConfig = new MatDialogConfig();
        // Set data
        dialogConfig.data = {
            userID: this.user.id
        }
        // Show
        const dialogRef = this.dialog.open(SitesDialogComponent, dialogConfig);
        // Register to the answer
        dialogRef.afterClosed().subscribe(sites => this._addSites(sites));
    }

    private _removeSites(siteIDs) {
        // Yes: Update
        this.centralServerService.removeSitesFromUser(this.user.id, siteIDs).subscribe(response => {
            // Ok?
            if (response.status === 'Success') {
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
            Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                this.translateService.instant('users.remove_sites_error'));
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
                if (response.status === 'Success') {
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
                Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
                    this.translateService.instant('users.update_error'));
            });
        }
    }
}
