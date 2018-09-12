import { MatDialog, MatDialogConfig } from '@angular/material';
import { DataSource } from '@angular/cdk/table';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { Site, User, TableDef, TableColumnDef, TableActionDef } from '../../../common.types';
import { CentralServerService } from '../../../services/central-server.service';
import { SitesDialogComponent } from '../../../shared/dialogs/sites-dialog-component';
import { MessageService } from '../../../services/message.service';
import { Utils } from '../../../utils/Utils';
import { TableAddAction } from '../../../shared/table/actions/table-add-action';

export class UserSitesDataSource extends TableDataSource<Site> implements DataSource<Site> {
    private user: User;

    constructor(
            private messageService: MessageService,
            private translateService: TranslateService,
            private router: Router,
            private dialog: MatDialog,
            private centralServerService: CentralServerService) {
        super();
    }

    loadData() {
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

    getTableDef(): TableDef {
        return {
            rowSelection: {
                enabled: true,
                multiple: true
            },
            search: {
                enabled: true
            }
        };
    }

    getTableColumnDefs(): TableColumnDef[] {
        // As sort directive in table can only be unset in Angular 7, all columns will be sortable
        return [
            {
                id: 'name',
                name: this.translateService.instant('sites.name'),
                class: 'text-left col-300',
                sorted: true,
                direction: 'asc'
            },
            {
                id: 'address.city',
                name: this.translateService.instant('general.city'),
                class: 'text-left col-200'
            },
            {
                id: 'address.country',
                name: this.translateService.instant('general.country'),
                class: 'text-left col-150'
            }
        ];
    }

    setUser(user: User) {
        // Set user
        this.user = user;
    }

    public getTableActionsDef(): TableActionDef[] {
        return [
            new TableAddAction(this.translateService).getActionDef()
        ];
    }

    public actionTriggered(actionDef: TableActionDef) {
        // Action
        switch (actionDef.id) {
            // Add
            case 'add':
                this.showAddSitesDialog();
                break;
        }
    }

    showAddSitesDialog() {
        const dialogConfig = new MatDialogConfig();

        // Set config
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;

        // Set data
        dialogConfig.data = {
            userID: this.user.id
        }

        // Show
        const dialogRef = this.dialog.open(SitesDialogComponent, dialogConfig);

        // Add sites
        dialogRef.afterClosed().subscribe(siteIDs => this.addSites(siteIDs) );
    }

    addSites(siteIDs) {
        // Check
        if (siteIDs) {
            console.log('====================================');
            console.log(siteIDs);
            console.log('====================================');
        }
    }
}
