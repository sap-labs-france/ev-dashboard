import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {Site, TableColumnDef} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';
import { Observable } from 'rxjs';

export class SitesDataSource extends DialogTableDataSource<Site> {
  constructor(
      private messageService: MessageService,
      private translateService: TranslateService,
      private router: Router,
      private centralServerService: CentralServerService) {
    super();
    // Init
    this.initDataSource();
  }

 public loadData(): Observable<any> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getSites(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((sites) => {
          // Set number of records
          this.setTotalNumberOfRecords(sites.count);
          // Ok
          observer.next(sites.result);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: this.translateService.instant('sites.name'),
        class: 'text-left col-50p',
        sorted: true,
        direction: 'asc',
        sortable: true
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
}
