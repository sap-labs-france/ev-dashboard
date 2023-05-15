import { EventEmitter, Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { WindowService } from 'services/window.service';
import { SettingAuthorizationActions } from 'types/Authorization';

import { DialogService } from '../../../../services/dialog.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { AppUserMultipleRolesPipe } from '../../../../shared/formatters/app-user-multiple-roles.pipe';
import { TableCreateAction } from '../../../../shared/table/actions/table-create-action';
import { TableDeleteAction } from '../../../../shared/table/actions/table-delete-action';
import { TableEditAction } from '../../../../shared/table/actions/table-edit-action';
import {
  TableOpenURLAction,
  TableOpenURLActionDef,
} from '../../../../shared/table/actions/table-open-url-action';
import { TableRefreshAction } from '../../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../../shared/table/table-data-source';
import { DataResult } from '../../../../types/DataResult';
import { ButtonAction } from '../../../../types/GlobalType';
import { SettingLink } from '../../../../types/Setting';
import {
  DropdownItem,
  TableActionDef,
  TableColumnDef,
  TableDef,
  TableFilterDef,
} from '../../../../types/Table';
import { AnalyticsLinkDialogComponent } from './analytics-link-dialog.component';

@Injectable()
export class AnalyticsLinksTableDataSource extends TableDataSource<SettingLink> {
  public changed = new EventEmitter<boolean>();
  private authorizations: SettingAuthorizationActions;
  private analyticsLinks!: SettingLink[];
  private editAction = new TableEditAction().getActionDef();
  private openURLAction = new TableOpenURLAction().getActionDef();
  private createAction = new TableCreateAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private windowService: WindowService,
    private appUserMultipleRolesPipe: AppUserMultipleRolesPipe,
    private dialogService: DialogService,
    private dialog: MatDialog
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public setLinks(analyticsLinks: SettingLink[]) {
    this.analyticsLinks = analyticsLinks ? analyticsLinks : [];
  }

  public getLinks(): SettingLink[] {
    return this.analyticsLinks;
  }

  public setAuthorizations(authorizations: SettingAuthorizationActions) {
    this.authorizations = authorizations;
  }

  public loadDataImpl(): Observable<DataResult<SettingLink>> {
    return new Observable((observer) => {
      this.createAction.visible = this.authorizations.canUpdate;
      if (this.analyticsLinks) {
        this.analyticsLinks.sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));
        const links = [];
        for (let index = 0; index < this.analyticsLinks.length; index++) {
          const link = this.analyticsLinks[index];
          link.id = index.toString();
          links.push(link);
        }
        observer.next({
          count: links.length,
          result: links,
        });
      } else {
        observer.next({
          count: 0,
          result: [],
        });
      }
      observer.complete();
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: false,
      },
      design: {
        flat: true,
      },
      footer: {
        enabled: false,
      },
      rowFieldNameIdentifier: 'url',
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'analytics.link.name',
        headerClass: 'col-20p',
        class: 'text-left col-20p',
        sorted: true,
        direction: 'asc',
        sortable: false,
      },
      {
        id: 'description',
        name: 'analytics.link.description',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: false,
      },
      {
        id: 'role',
        name: 'analytics.link.role',
        formatter: (role: string) =>
          this.translateService.instant(this.appUserMultipleRolesPipe.transform(role)),
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: false,
      },
      {
        id: 'url',
        name: 'analytics.link.url',
        headerClass: 'col-45p',
        class: 'col-45p',
        sortable: false,
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    return [this.createAction];
  }

  public buildTableDynamicRowActions(row: SettingLink): TableActionDef[] {
    // We are using global settings authorizations
    const tableActionDef: TableActionDef[] = [];
    if (this.authorizations.canUpdate) {
      tableActionDef.push(this.editAction);
    }
    tableActionDef.push(this.openURLAction);
    // We are using the UPDATE for the delete setting link action
    if (this.authorizations.canUpdate) {
      tableActionDef.push(this.deleteAction);
    }
    return tableActionDef;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.CREATE:
        this.showLinksDialog();
        break;
    }
  }

  public rowActionTriggered(
    actionDef: TableActionDef,
    link: SettingLink,
    dropdownItem?: DropdownItem
  ) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
        this.showLinksDialog(link);
        break;
      case ButtonAction.DELETE:
        this.deleteLink(link);
        break;
      case ButtonAction.OPEN_URL:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action(link.url, this.windowService);
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [new TableRefreshAction().getActionDef()];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private showLinksDialog(analyticsLink?: SettingLink) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (analyticsLink) {
      dialogConfig.data = analyticsLink;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(AnalyticsLinkDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // find object
        const index = this.analyticsLinks.findIndex((link) => link.id === result.id);
        if (index >= 0) {
          this.analyticsLinks.splice(index, 1, result);
        } else {
          this.analyticsLinks.push(result);
        }
        this.refreshData().subscribe();
        this.changed.emit(true);
      }
    });
  }

  private deleteLink(analyticsLink: SettingLink) {
    this.dialogService
      .createAndShowYesNoDialog(
        this.translateService.instant('analytics.delete_title'),
        this.translateService.instant('analytics.delete_confirm', { linkName: analyticsLink.name })
      )
      .subscribe((result) => {
        if (result === ButtonAction.YES) {
          const index = this.analyticsLinks.findIndex((link) => link.id === analyticsLink.id);
          if (index > -1) {
            this.analyticsLinks.splice(index, 1);
          }
          this.refreshData().subscribe();
          this.changed.emit(true);
        }
      });
  }
}
