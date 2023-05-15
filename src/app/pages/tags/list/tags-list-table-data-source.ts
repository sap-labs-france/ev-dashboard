import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatusCodes } from 'http-status-codes';
import { Observable } from 'rxjs';
import { SpinnerService } from 'services/spinner.service';
import { WindowService } from 'services/window.service';
import { ImportDialogComponent } from 'shared/dialogs/import/import-dialog.component';
import { AppDatePipe } from 'shared/formatters/app-date.pipe';
import { TableMoreAction } from 'shared/table/actions/table-more-action';
import { TableOpenURLActionDef } from 'shared/table/actions/table-open-url-action';
import {
  TableAssignTagAction,
  TableAssignTagActionDef,
} from 'shared/table/actions/tags/table-assign-tag-action';
import {
  TableDeleteTagsAction,
  TableDeleteTagsActionDef,
} from 'shared/table/actions/tags/table-delete-tags-action';
import {
  TableEditTagByVisualIDAction,
  TableEditTagByVisualIDActionDef,
} from 'shared/table/actions/tags/table-edit-tag-by-visual-id-action';
import {
  TableExportTagsAction,
  TableExportTagsActionDef,
} from 'shared/table/actions/tags/table-export-tags-action';
import {
  TableImportTagsAction,
  TableImportTagsActionDef,
} from 'shared/table/actions/tags/table-import-tags-action';
import {
  TableUnassignTagAction,
  TableUnassignTagActionDef,
} from 'shared/table/actions/tags/table-unassign-tag-action';
import {
  TableUnassignTagsAction,
  TableUnassignTagsActionDef,
} from 'shared/table/actions/tags/table-unassign-tags-action';
import {
  TableViewTagAction,
  TableViewTagActionDef,
} from 'shared/table/actions/tags/table-view-tag-action';
import { TableNavigateToTransactionsAction } from 'shared/table/actions/transactions/table-navigate-to-transactions-action';
import { organizations } from 'shared/table/filters/issuer-filter';
import { StatusFilter } from 'shared/table/filters/status-filter';
import { UserTableFilter } from 'shared/table/filters/user-table-filter';
import { TagsAuthorizations } from 'types/Authorization';
import { DataResult } from 'types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'types/Table';
import { Tag, TagButtonAction } from 'types/Tag';
import { TransactionButtonAction } from 'types/Transaction';
import { User, UserButtonAction } from 'types/User';

import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import {
  TableActivateTagAction,
  TableActivateTagActionDef,
} from '../../../shared/table/actions/tags/table-activate-tag-action';
import {
  TableCreateTagAction,
  TableCreateTagActionDef,
} from '../../../shared/table/actions/tags/table-create-tag-action';
import {
  TableDeactivateTagAction,
  TableDeactivateTagActionDef,
} from '../../../shared/table/actions/tags/table-deactivate-tag-action';
import {
  TableDeleteTagAction,
  TableDeleteTagActionDef,
} from '../../../shared/table/actions/tags/table-delete-tag-action';
import {
  TableEditTagAction,
  TableEditTagActionDef,
} from '../../../shared/table/actions/tags/table-edit-tag-action';
import { TableNavigateToUserAction } from '../../../shared/table/actions/users/table-navigate-to-user-action';
import { IssuerFilter } from '../../../shared/table/filters/issuer-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { Utils } from '../../../utils/Utils';
import { TagStatusFormatterComponent } from '../formatters/tag-status-formatter.component';
import { TagAssignDialogComponent } from '../tag-assign/tag-assign-dialog.component';
import { TagDialogComponent } from '../tag/tag-dialog.component';

@Injectable()
export class TagsListTableDataSource extends TableDataSource<Tag> {
  private deleteAction = new TableDeleteTagAction().getActionDef();
  private unassignAction = new TableUnassignTagAction().getActionDef();
  private activateAction = new TableActivateTagAction().getActionDef();
  private deactivateAction = new TableDeactivateTagAction().getActionDef();
  private editAction = new TableEditTagAction().getActionDef();
  private editByVisualIDAction = new TableEditTagByVisualIDAction().getActionDef();
  private navigateToUserAction = new TableNavigateToUserAction().getActionDef();
  private navigateToTransactionsAction = new TableNavigateToTransactionsAction().getActionDef();
  private deleteManyAction = new TableDeleteTagsAction().getActionDef();
  private unassignManyAction = new TableUnassignTagsAction().getActionDef();
  private createAction = new TableCreateTagAction().getActionDef();
  private assignAction = new TableAssignTagAction().getActionDef();
  private importAction = new TableImportTagsAction().getActionDef();
  private exportAction = new TableExportTagsAction().getActionDef();
  private viewAction = new TableViewTagAction().getActionDef();
  private projectFields: string[];
  private userFilter: TableFilterDef;
  private issuerFilter: TableFilterDef;
  private tagsAuthorizations: TagsAuthorizations;
  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private datePipe: AppDatePipe,
    private centralServerService: CentralServerService,
    private windowService: WindowService
  ) {
    super(spinnerService, translateService);
    this.setStaticFilters([{ WithUser: true }]);
    this.initDataSource();
    this.initFilters();
  }

  public initFilters() {
    const userID = this.windowService.getUrlParameterValue('UserID');
    if (userID) {
      const userTableFilter = this.tableFiltersDef.find((filter) => filter.id === 'user');
      if (userTableFilter) {
        userTableFilter.currentValue.push({
          key: userID,
          value: '',
        });
        this.filterChanged(userTableFilter);
      }
      this.loadUserFilterLabel(userID);
    }
    // Issuer
    const issuer = this.windowService.getUrlParameterValue('Issuer');
    if (issuer) {
      const issuerTableFilter = this.tableFiltersDef.find((filter) => filter.id === 'issuer');
      if (issuerTableFilter) {
        issuerTableFilter.currentValue = [
          organizations.find((organisation) => organisation.key === issuer),
        ];
        this.filterChanged(issuerTableFilter);
      }
    }
    // Tag
    const tagID = this.windowService.getUrlParameterValue('TagID');
    if (tagID) {
      this.setSearchValue(tagID);
      this.editAction.action(
        TagDialogComponent,
        this.dialog,
        {
          dialogData: { id: tagID, projectFields: this.projectFields } as Tag,
          authorizations: this.tagsAuthorizations,
        },
        this.refreshData.bind(this)
      );
    }
  }

  public loadUserFilterLabel(userID: string) {
    this.centralServerService.getUser(userID).subscribe({
      next: (user: User) => {
        const userTableFilter = this.tableFiltersDef.find((filter) => filter.id === 'user');
        if (userTableFilter) {
          userTableFilter.currentValue = [
            {
              key: userID,
              value: Utils.buildUserFullName(user),
            },
          ];
          this.filterChanged(userTableFilter);
        }
      },
      error: (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case StatusCodes.NOT_FOUND:
            this.messageService.showErrorMessage('users.user_do_not_exist');
            break;
          default:
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.unexpected_error_backend'
            );
        }
      },
    });
  }

  public loadDataImpl(): Observable<DataResult<Tag>> {
    return new Observable((observer) => {
      // Get the Tags
      this.centralServerService
        .getTags(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe(
          (tags) => {
            // Initialize authorizaiton object
            this.tagsAuthorizations = {
              // Authorization action
              canCreate: Utils.convertToBoolean(tags.canCreate),
              canAssign: Utils.convertToBoolean(tags.canAssign),
              canImport: Utils.convertToBoolean(tags.canImport),
              canExport: Utils.convertToBoolean(tags.canExport),
              canDelete: Utils.convertToBoolean(tags.canDelete),
              canUnassign: Utils.convertToBoolean(tags.canUnassign),
              canListUsers: Utils.convertToBoolean(tags.canListUsers),
              canListSources: Utils.convertToBoolean(tags.canListSources),
              // Metadata
              metadata: tags.metadata,
              // projected fields
              projectFields: tags.projectFields,
            };
            // Update filter visibility
            this.createAction.visible = this.tagsAuthorizations.canCreate;
            this.assignAction.visible = this.tagsAuthorizations.canAssign;
            this.importAction.visible = this.tagsAuthorizations.canImport;
            this.exportAction.visible = this.tagsAuthorizations.canExport;
            this.deleteManyAction.visible = this.tagsAuthorizations.canDelete;
            this.unassignManyAction.visible = this.tagsAuthorizations.canUnassign;
            this.projectFields = this.tagsAuthorizations.projectFields;
            this.userFilter.visible = this.tagsAuthorizations.canListUsers;
            this.issuerFilter.visible = this.tagsAuthorizations.canListSources;
            observer.next(tags);
            observer.complete();
          },
          (error) => {
            Utils.handleHttpError(
              error,
              this.router,
              this.messageService,
              this.centralServerService,
              'general.error_backend'
            );
            observer.error(error);
          }
        );
    });
  }

  public isSelectable(row: Tag) {
    return row.canUpdate || row.canUnassign;
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      rowSelection: {
        enabled: true,
        multiple: true,
      },
      hasDynamicRowAction: true,
    };
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
        headerClass: 'text-center col-15em',
        class: 'text-center col-15em',
        sortable: true,
      },
      {
        id: 'visualID',
        name: 'tags.visual_id',
        headerClass: 'text-center col-20p',
        class: 'text-center col-20p',
        formatter: (description: string) => (description ? description : '-'),
        sortable: true,
      },
      {
        id: 'description',
        name: 'general.description',
        headerClass: 'text-center col-20p',
        class: 'text-center col-20p',
        formatter: (description: string) => (description ? description : '-'),
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
        direction: 'desc',
      },
      {
        id: 'default',
        name: 'general.default',
        headerClass: 'text-center col-5em',
        class: 'text-center col-10em',
        sortable: true,
        formatter: (defaultTag) => Utils.displayYesNo(this.translateService, defaultTag),
      },
      {
        id: 'user.name',
        name: 'users.title',
        headerClass: 'col-20p',
        class: 'col-20p',
        formatter: (name: string, tag: Tag) => Utils.buildUserFullName(tag.user),
      },
      {
        id: 'user.email',
        name: 'users.email',
        headerClass: 'col-20em',
        class: 'col-20em',
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
        formatter: (issuer) =>
          issuer
            ? this.translateService.instant('issuer.local')
            : this.translateService.instant('issuer.foreign'),
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      this.createAction,
      this.assignAction,
      this.importAction,
      this.exportAction,
      this.deleteManyAction,
      this.unassignManyAction,
      ...tableActionsDef,
    ];
  }

  public buildTableDynamicRowActions(tag: Tag): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    const moreActions = new TableMoreAction([]);
    if (tag.canUpdate) {
      rowActions.push(this.editAction);
      if (tag.userID) {
        if (tag.active) {
          moreActions.addActionInMoreActions(this.deactivateAction);
        } else {
          moreActions.addActionInMoreActions(this.activateAction);
        }
      }
    } else {
      rowActions.push(this.viewAction);
    }
    if (tag.canUpdateByVisualID) {
      rowActions.push(this.editByVisualIDAction);
    }
    if (tag.canUnassign) {
      rowActions.push(this.unassignAction);
    }
    moreActions.addActionInMoreActions(this.navigateToTransactionsAction);
    if (tag.userID && tag.canListUsers) {
      moreActions.addActionInMoreActions(this.navigateToUserAction);
    }
    if (tag.canDelete) {
      moreActions.addActionInMoreActions(this.deleteAction);
    }
    if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
      rowActions.push(moreActions.getActionDef());
    }
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case TagButtonAction.CREATE_TAG:
        if (actionDef.action) {
          (actionDef as TableCreateTagActionDef).action(
            TagDialogComponent,
            this.dialog,
            { authorizations: this.tagsAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
      // Assign
      case TagButtonAction.ASSIGN_TAG:
        if (actionDef.action) {
          (actionDef as TableAssignTagActionDef).action(
            TagAssignDialogComponent,
            this.dialog,
            { authorizations: this.tagsAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
      // Delete
      case TagButtonAction.DELETE_TAGS:
        if (actionDef.action) {
          (actionDef as TableDeleteTagsActionDef).action(
            this.getSelectedRows(),
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.clearSelectedRows.bind(this),
            this.refreshData.bind(this)
          );
        }
        break;
      case TagButtonAction.IMPORT_TAGS:
        if (actionDef.action) {
          (actionDef as TableImportTagsActionDef).action(ImportDialogComponent, this.dialog);
        }
        break;
      case TagButtonAction.EXPORT_TAGS:
        if (actionDef.action) {
          const filterValues = this.buildFilterValues();
          filterValues['WithUser'] = 'true';
          (actionDef as TableExportTagsActionDef).action(
            filterValues,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.router,
            this.spinnerService
          );
        }
        break;
      // Unassign
      case TagButtonAction.UNASSIGN_TAGS:
        if (actionDef.action) {
          (actionDef as TableUnassignTagsActionDef).action(
            this.getSelectedRows(),
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.clearSelectedRows.bind(this),
            this.refreshData.bind(this)
          );
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, tag: Tag) {
    switch (actionDef.id) {
      case TagButtonAction.VIEW_TAG:
        if (actionDef.action) {
          (actionDef as TableViewTagActionDef).action(
            TagDialogComponent,
            this.dialog,
            { dialogData: tag, authorizations: this.tagsAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
      case TagButtonAction.ACTIVATE_TAG:
        if (actionDef.action) {
          (actionDef as TableActivateTagActionDef).action(
            tag,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case TagButtonAction.DEACTIVATE_TAG:
        if (actionDef.action) {
          (actionDef as TableDeactivateTagActionDef).action(
            tag,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case TagButtonAction.DELETE_TAG:
        if (actionDef.action) {
          (actionDef as TableDeleteTagActionDef).action(
            tag,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
      case TagButtonAction.EDIT_TAG:
        if (actionDef.action) {
          (actionDef as TableEditTagActionDef).action(
            TagDialogComponent,
            this.dialog,
            { dialogData: tag, authorizations: this.tagsAuthorizations },
            this.refreshData.bind(this)
          );
        }
        break;
      case UserButtonAction.NAVIGATE_TO_USER:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action(
            `users#all?VisualID=${tag.visualID}&Issuer=${tag.issuer}`,
            this.windowService
          );
        }
        break;
      case TransactionButtonAction.NAVIGATE_TO_TRANSACTIONS:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action(
            `transactions#history?VisualID=${tag.visualID}&Issuer=${tag.issuer}`,
            this.windowService
          );
        }
        break;
      case TagButtonAction.EDIT_TAG_BY_VISUAL_ID:
        if (actionDef.action) {
          (actionDef as TableEditTagByVisualIDActionDef).action(
            TagAssignDialogComponent,
            this.dialog,
            {
              dialogData: { visualID: tag.visualID } as Tag,
              authorizations: this.tagsAuthorizations,
            },
            this.refreshData.bind(this)
          );
        }
        break;
      case TagButtonAction.UNASSIGN_TAG:
        if (actionDef.action) {
          (actionDef as TableUnassignTagActionDef).action(
            tag,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [new TableAutoRefreshAction().getActionDef(), new TableRefreshAction().getActionDef()];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    this.issuerFilter = new IssuerFilter().getFilterDef();
    const statusFilter = new StatusFilter().getFilterDef();
    this.userFilter = new UserTableFilter([this.issuerFilter]).getFilterDef();
    this.userFilter.visible = false;
    const filters: TableFilterDef[] = [this.issuerFilter, statusFilter, this.userFilter];
    return filters;
  }
}
