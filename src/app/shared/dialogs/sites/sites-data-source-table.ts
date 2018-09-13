import { DataSource } from '@angular/cdk/table';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TableDataSource } from '../../table/table-data-source';
import { Site, TableDef, TableColumnDef } from '../../../common.types';
import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { Utils } from '../../../utils/Utils';

export class SitesDataSource extends TableDataSource<Site> implements DataSource<Site> {
    constructor(
        private messageService: MessageService,
        private translateService: TranslateService,
        private router: Router,
        private centralServerService: CentralServerService) {
        super();
    }

    loadData() {
        // Get data
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
    }

    getTableDef(): TableDef {
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

    getTableColumnDefs(): TableColumnDef[] {
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

    public getPaginatorPageSizes() {
        return [10, 25, 50];
    }
}
