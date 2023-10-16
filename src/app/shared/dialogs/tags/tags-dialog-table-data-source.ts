import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TagStatusFormatterComponent } from 'pages/tags/formatters/tag-status-formatter.component';
import { Observable } from 'rxjs';
import { User } from 'types/User';

import { CentralServerService } from '../../../services/central-server.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { DataResult } from '../../../types/DataResult';
import { TableColumnDef } from '../../../types/Table';
import { Tag } from '../../../types/Tag';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataSource } from '../dialog-table-data-source';

@Injectable()
export class TagsDialogTableDataSource extends DialogTableDataSource<Tag> {
  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private router: Router,
    private centralServerService: CentralServerService
  ) {
    super(spinnerService, translateService);
    // Init
    this.setStaticFilters([{ WithUser: true }]);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Tag>> {
    return new Observable((observer) => {
      this.centralServerService
        .getTags(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe({
          next: (tags) => {
            observer.next(tags);
            observer.complete();
          },
          error: (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          },
        });
    });
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'active',
        name: 'tags.status',
        isAngularComponent: true,
        angularComponent: TagStatusFormatterComponent,
        headerClass: 'text-center col-10em',
        class: 'text-center col-10em',
        sortable: true,
      },
      {
        id: 'id',
        name: 'tags.id',
        class: 'text-left col-20p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'visualID',
        name: 'tags.visual_id',
        class: 'text-left col-20p',
        sortable: true,
      },
      {
        id: 'description',
        name: 'general.description',
        class: 'text-left',
        sortable: true,
      },
      {
        id: 'user.email',
        name: 'users.email',
        headerClass: 'col-25p',
        class: 'col-25p',
      },
      {
        id: 'default',
        name: 'general.default',
        headerClass: 'text-center col-10em',
        class: 'text-center col-10em',
        sortable: true,
        formatter: (defaultTag) => Utils.displayYesNo(this.translateService, defaultTag),
      },
    ];
  }
}
