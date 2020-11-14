import { Asset } from '../../../types/Asset';
import { CentralServerService } from '../../../services/central-server.service';
import { DataResult } from '../../../types/DataResult';
import { DialogTableDataSource } from '../dialog-table-data-source';
import { Injectable } from '@angular/core';
import { MessageService } from '../../../services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SpinnerService } from '../../../services/spinner.service';
import { TableColumnDef } from '../../../types/Table';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from '../../../utils/Utils';

@Injectable()
export class AssetsDialogTableDataSource extends DialogTableDataSource<Asset> {
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Asset>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getAssets(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((assets) => {
          // Ok
          observer.next(assets);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'assets.titles',
        class: 'text-left',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
    ];
  }
}
