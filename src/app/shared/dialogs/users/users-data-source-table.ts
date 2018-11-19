import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {TableColumnDef, TableDef, User} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';

export class UsersDataSource extends DialogTableDataSource<User> {
  constructor(
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private centralServerService: CentralServerService) {
    super();
  }

  loadData() {
    // Get data
    this.centralServerService.getUsers(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((users) => {
      // Set number of records
      this.setNumberOfRecords(users.count);
      // Update page length (number of sites is in User)
      this.updatePaginator();
      // Return sites
      this.getDataSubjet().next(users.result);
      // Keep it
      this.setData(users.result);
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
        id: 'name',
        name: 'users.name',
        class: 'text-left col-400px',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'firstName',
        name: 'users.first_name',
        class: 'text-left col-350px'
      },
      {
        id: 'email',
        name: 'users.email',
        class: 'text-left col-500px'
      }
    ];
  }
}
