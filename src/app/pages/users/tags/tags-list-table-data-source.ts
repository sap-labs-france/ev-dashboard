import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { IssuerFilter } from 'app/shared/table/filters/issuer-filter';
import { UserTableFilter } from 'app/shared/table/filters/user-table-filter';
import { DataResult } from 'app/types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Tag } from 'app/types/Tag';
import { User, UserButtonAction } from 'app/types/User';
import { Observable } from 'rxjs';

import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { Utils } from '../../../utils/Utils';
import { TagStatusFormatterComponent } from '../formatters/tag-status-formatter.component';
import { TableActivateTagAction, TableActivateTagActionDef } from '../table-actions/table-activate-tag-action';
import { TableCreateTagAction, TableCreateTagActionDef } from '../table-actions/table-create-tag-action';
import { TableDeactivateTagAction, TableDeactivateTagActionDef } from '../table-actions/table-deactivate-tag-action';
import { TableDeleteTagAction, TableDeleteTagActionDef } from '../table-actions/table-delete-tag-action';
import { TableEditTagAction, TableEditTagActionDef } from '../table-actions/table-edit-tag-action';

@Injectable()
export class TagsListTableDataSource extends TableDataSource<Tag> {
  private deleteAction = new TableDeleteTagAction().getActionDef();
  private activateAction = new TableActivateTagAction().getActionDef();
  private deactivateAction = new TableDeactivateTagAction().getActionDef();
  private editAction = new TableEditTagAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private datePipe: AppDatePipe,
    private centralServerService: CentralServerService) {
    super(spinnerService, translateService);
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectTags();
  }

  public loadDataImpl(): Observable<DataResult<Tag>> {
    return new Observable((observer) => {
      // Get the Tags
      this.centralServerService.getTags(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((tags) => {
          // Ok
          observer.next(tags);
          observer.complete();
        }, (error) => {
          // Show error
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [];
    tableColumnDef.push(
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
        headerClass: 'text-center col-15em',
        class: 'text-center col-15em',
        sortable: true,
      },
      {
        id: 'description',
        name: 'general.description',
        headerClass: 'text-center col-20p',
        class: 'text-center col-20p',
        formatter: (description: string) => description ? description : '-',
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
    );
    tableColumnDef.push(
      {
        id: 'createdOn',
        name: 'users.created_on',
        formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
        headerClass: 'col-15em',
        class: 'col-15em',
        sortable: true,
        sorted: true,
      },
      {
        id: 'createdBy',
        name: 'users.created_by',
        headerClass: 'col-15em',
        class: 'col-15em',
      },
      {
        id: 'lastChangedOn',
        name: 'users.changed_on',
        formatter: (lastChangedOn: Date) => this.datePipe.transform(lastChangedOn),
        headerClass: 'col-15em',
        class: 'col-15em',
        sortable: true,
      },
      {
        id: 'lastChangedBy',
        name: 'users.changed_by',
        headerClass: 'col-15em',
        class: 'col-15em',
      },
      {
        id: 'issuer',
        name: 'issuer.title',
        headerClass: 'text-center col-15em',
        class: 'text-center col-15em',
        sortable: true,
        formatter: (issuer) => issuer ? this.translateService.instant('issuer.local') :
          this.translateService.instant('issuer.foreign'),
      },
    );
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    tableActionsDef.unshift(new TableCreateTagAction().getActionDef());
    return [
      ...tableActionsDef,
    ];
  }

  public buildTableDynamicRowActions(tag: Tag): TableActionDef[] {
    const actions = [];
    const moreActions = new TableMoreAction([]);
    if (tag.issuer) {
      actions.push(this.editAction);
      if (tag.active) {
        moreActions.addActionInMoreActions(this.deactivateAction);
      } else {
        moreActions.addActionInMoreActions(this.activateAction);
      }
      moreActions.addActionInMoreActions(this.deleteAction);
      actions.push(moreActions.getActionDef());
    }
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case UserButtonAction.CREATE_TAG:
        if (actionDef.action) {
          (actionDef as TableCreateTagActionDef).action(this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, tag: Tag) {
    switch (actionDef.id) {
      case UserButtonAction.ACTIVATE_TAG:
        if (actionDef.action) {
          (actionDef as TableActivateTagActionDef).action(tag, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case UserButtonAction.DEACTIVATE_TAG:
        if (actionDef.action) {
          (actionDef as TableDeactivateTagActionDef).action(tag, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case UserButtonAction.DELETE_TAG:
        if (actionDef.action) {
          (actionDef as TableDeleteTagActionDef).action(tag, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case UserButtonAction.EDIT_TAG:
        if (actionDef.action) {
          (actionDef as TableEditTagActionDef).action(tag, this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new IssuerFilter().getFilterDef(),
      new UserTableFilter().getFilterDef(),
    ];
  }
}
