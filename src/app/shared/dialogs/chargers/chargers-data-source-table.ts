import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {Charger, TableColumnDef, TableDef, TableFilterDef} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';
import { Injectable } from '@angular/core';
@Injectable()
export class ChargersDataSource extends DialogTableDataSource<Charger> {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private centralServerService: CentralServerService) {
    super();
  }

  loadData() {
    // Get data
    this.centralServerService.getChargers(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((chargers) => {
      // Set number of records
      this.setNumberOfRecords(chargers.count);
      // Update page length (number of sites is in User)
      this.updatePaginator();
      this.setData(chargers.result);
    }, (error) => {
      // No longer exists!
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
    });
  }

  getTableDef(): TableDef {
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

  getTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'id',
        name: 'chargers.chargers',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'chargePointVendor',
        name: 'chargers.name',
        class: 'text-left'
      }
    ];
  }
}
