import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { InvoicesComponent } from '../invoices.component';
import { TransfersTableDataSource } from './transfers-table-data-source';

@Component({
  selector: 'app-transfers-list',
  template: '<app-table [dataSource]="transfersListTableDataSource"></app-table>',
  providers: [TransfersTableDataSource, InvoicesComponent],
})
export class TransfersListComponent implements OnInit {
  // eslint-disable-next-line no-useless-constructor
  public constructor(
    public transfersListTableDataSource: TransfersTableDataSource,
    public activatedRoute: ActivatedRoute,
    public centralServerService: CentralServerService,
    public spinnerService: SpinnerService,
    public windowService: WindowService,
    public messageService: MessageService
  ) {}

  // Download from email
  public ngOnInit() {}
}
