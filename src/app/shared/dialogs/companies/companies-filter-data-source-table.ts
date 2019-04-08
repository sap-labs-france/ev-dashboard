import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {Company, TableColumnDef, TableDef} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {SpinnerService} from 'app/services/spinner.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';

export class CompaniesFilterDataSource extends DialogTableDataSource<Company> {
  constructor(
      private messageService: MessageService,
      private translateService: TranslateService,
      private router: Router,
      private centralServerService: CentralServerService,
      private spinnerService: SpinnerService) {
    super();
    // Init
    this.initDataSource();
  }

  loadData() {
    // Show spinner
    this.spinnerService.show();
    // Get data
    this.centralServerService.getCompanies(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((companies) => {
        // Hide spinner
        this.spinnerService.hide();
        // Set number of records
        this.setNumberOfRecords(companies.count);
        // Update page length
        this.updatePaginator();
        this.setData(companies.result);
      }, (error) => {
        // Hide spinner
        this.spinnerService.hide();
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
      });
  }

  buildTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: true,
        multiple: false
      },
      search: {
        enabled: true
      }
    };
  }

  buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: this.translateService.instant('companies.name'),
        class: 'text-left col-600px',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'address.city',
        name: this.translateService.instant('general.city'),
        class: 'text-left col-350px'
      },
      {
        id: 'address.country',
        name: this.translateService.instant('general.country'),
        class: 'text-left col-300px'
      }
    ];
  }
}
