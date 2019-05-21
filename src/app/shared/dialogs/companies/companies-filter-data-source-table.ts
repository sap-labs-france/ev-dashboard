import {Router} from '@angular/router';
import {Company, TableColumnDef, TableDef} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';
import { Observable } from 'rxjs';
import { SpinnerService } from 'app/services/spinner.service';
import { Injectable } from '@angular/core';

@Injectable()
export class CompaniesFilterDataSource extends DialogTableDataSource<Company> {
  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private router: Router,
      private centralServerService: CentralServerService) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

 public loadDataImpl(): Observable<any> {
  return new Observable((observer) => {
    // Get data
    this.centralServerService.getCompanies(this.buildFilterValues(),
      this.getPaging(), this.getSorting()).subscribe((companies) => {
        // Ok
        observer.next(companies);
        observer.complete();
      }, (error) => {
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
        // Error
        observer.error(error);
      });
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
        name: 'companies.name',
        class: 'text-left col-600px',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'address.city',
        name: 'general.city',
        class: 'text-left col-350px'
      },
      {
        id: 'address.country',
        name: 'general.country',
        class: 'text-left col-300px'
      }
    ];
  }
}
