import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { SpinnerService } from 'services/spinner.service';
import { WindowService } from 'services/window.service';
import { AppDatePipe } from 'shared/formatters/app-date.pipe';
import { TableMoreAction } from 'shared/table/actions/table-more-action';
import { TableOpenURLActionDef } from 'shared/table/actions/table-open-url-action';
import { TableNavigateToTransactionsAction } from 'shared/table/actions/transactions/table-navigate-to-transactions-action';
import { organisations } from 'shared/table/filters/issuer-filter';
import { UserTableFilter } from 'shared/table/filters/user-table-filter';
import { DataResult } from 'types/DataResult';
import { HTTPError } from 'types/HTTPError';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'types/Table';
import { Tag } from 'types/Tag';
import { TransactionButtonAction } from 'types/Transaction';
import { User, UserButtonAction } from 'types/User';

import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableActivateTagAction, TableActivateTagActionDef } from '../../../shared/table/actions/users/table-activate-tag-action';
import { TableCreateTagAction, TableCreateTagActionDef } from '../../../shared/table/actions/users/table-create-tag-action';
import { TableDeactivateTagAction, TableDeactivateTagActionDef } from '../../../shared/table/actions/users/table-deactivate-tag-action';
import { TableDeleteTagAction, TableDeleteTagActionDef } from '../../../shared/table/actions/users/table-delete-tag-action';
import { TableEditTagAction, TableEditTagActionDef } from '../../../shared/table/actions/users/table-edit-tag-action';
import { TableNavigateToUserAction } from '../../../shared/table/actions/users/table-navigate-to-user-action';
import { IssuerFilter } from '../../../shared/table/filters/issuer-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { Utils } from '../../../utils/Utils';
import { TagStatusFormatterComponent } from '../formatters/tag-status-formatter.component';
import { TagDialogComponent } from '../tag/tag.dialog.component';

@Injectable()
export class TagsListTableDataSource extends TableDataSource<Tag> {
  private deleteAction = new TableDeleteTagAction().getActionDef();
  private activateAction = new TableActivateTagAction().getActionDef();
  private deactivateAction = new TableDeactivateTagAction().getActionDef();
  private editAction = new TableEditTagAction().getActionDef();
  private navigateToUserAction = new TableNavigateToUserAction().getActionDef();
  private navigateToTransactionsAction = new TableNavigateToTransactionsAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private datePipe: AppDatePipe,
    private centralServerService: CentralServerService,
    private windowService: WindowService) {
    super(spinnerService, translateService);
    this.initDataSource();
    this.initFilters();
  }

  public initFilters() {
    const userID = this.windowService.getSearch('UserID');
    if (userID) {
      const userTableFilter = this.tableFiltersDef.find(filter => filter.id === 'user');
      if (userTableFilter) {
        userTableFilter.currentValue.push({
          key: userID, value: ''
        });
        this.filterChanged(userTableFilter);
      }
      this.loadUserFilterLabel(userID);
    }
    // Issuer
    const issuer = this.windowService.getSearch('Issuer');
    if (issuer) {
      const issuerTableFilter = this.tableFiltersDef.find(filter => filter.id === 'issuer');
      if (issuerTableFilter) {
        issuerTableFilter.currentValue = [organisations.find(organisation => organisation.key === issuer)];
        this.filterChanged(issuerTableFilter);
      }
    }
    // Tag
    const tagID = this.windowService.getSearch('TagID');
    if (tagID) {
      this.setSearchValue(tagID);
      this.editAction.action(TagDialogComponent, { id: tagID } as Tag, this.dialog, this.refreshData.bind(this));
    }
  }

  public loadUserFilterLabel(userID: string) {
    this.centralServerService.getUser(userID).subscribe((user: User) => {
      const userTableFilter = this.tableFiltersDef.find(filter => filter.id === 'user');
      if (userTableFilter) {
        userTableFilter.currentValue = [{
          key: userID, value: Utils.buildUserFullName(user)
        }];
        this.filterChanged(userTableFilter);
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('users.user_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'general.unexpected_error_backend');
      }
    });
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
        id: 'createdOn',
        name: 'users.created_on',
        formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
        headerClass: 'col-15em',
        class: 'col-15em',
        sortable: true,
        sorted: true,
        direction: 'desc'
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
        formatter: (user: User) => Utils.buildUserFullName(user),
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
      if (tag.userID) {
        if (tag.active) {
          moreActions.addActionInMoreActions(this.deactivateAction);
        } else {
          moreActions.addActionInMoreActions(this.activateAction);
        }
      }
      moreActions.addActionInMoreActions(this.navigateToTransactionsAction);
      if (tag.userID) {
        moreActions.addActionInMoreActions(this.navigateToUserAction);
      }
      moreActions.addActionInMoreActions(this.deleteAction);
    } else {
      moreActions.addActionInMoreActions(this.navigateToTransactionsAction);
      if (tag.userID) {
        moreActions.addActionInMoreActions(this.navigateToUserAction);
      }
    }
    actions.push(moreActions.getActionDef());
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case UserButtonAction.CREATE_TAG:
        if (actionDef.action) {
          (actionDef as TableCreateTagActionDef).action(TagDialogComponent, this.dialog, this.refreshData.bind(this));
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
          (actionDef as TableEditTagActionDef).action(TagDialogComponent, tag, this.dialog, this.refreshData.bind(this));
        }
        break;
      case UserButtonAction.NAVIGATE_TO_USER:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action('users#all?TagID=' + tag.id + '&Issuer=' + tag.issuer);
        }
        break;
      case TransactionButtonAction.NAVIGATE_TO_TRANSACTIONS:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action('transactions#history?TagID=' + tag.id + '&Issuer=' + tag.issuer);
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
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
