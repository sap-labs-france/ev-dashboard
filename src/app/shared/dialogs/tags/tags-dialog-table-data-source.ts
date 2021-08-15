import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TagStatusFormatterComponent } from 'pages/users/formatters/tag-status-formatter.component';
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
    private centralServerService: CentralServerService) {
    super(spinnerService, translateService);
    // Init
    this.setStaticFilters([{ WithUser: true }]);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<Tag>> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getTags(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((tags) => {
        // Ok
        observer.next(tags);
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
        id: 'user',
        name: 'users.title',
        headerClass: 'col-20p',
        class: 'col-20p',
        formatter: (user: User) => Utils.buildUserFullName(user),
      },
      {
        id: 'user.email',
        name: 'users.email',
        headerClass: 'col-20em',
        class: 'col-20em',
      },
      {
        id: 'default',
        name: 'general.default',
        headerClass: 'text-center col-5em',
        class: 'text-center col-10em',
        sortable: true,
        formatter: (defaultTag) => defaultTag ? this.translateService.instant('general.yes') :
          this.translateService.instant('general.no'),
      },
    ];
  }
}
