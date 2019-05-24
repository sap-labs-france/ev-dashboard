import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Injectable, EventEmitter, Output } from '@angular/core';
import * as _ from 'lodash';

import { TableDataSource } from 'app/shared/table/table-data-source';
import { SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, DropdownItem, AnalyticsLink } from 'app/common.types';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Constants } from 'app/utils/Constants';

import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { DialogService } from 'app/services/dialog.service';
import { AnalyticsLinkDialogComponent } from './analytics-link.dialog.component';
import { SpinnerService } from 'app/services/spinner.service';

@Injectable()
export class AnalyticsLinksDataSource extends TableDataSource<AnalyticsLink> {
  @Output() changed = new EventEmitter<boolean>();
  private analyticsLinks: AnalyticsLink[];
  private editAction = new TableEditAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();

  constructor(
      public spinnerService: SpinnerService,
      private translateService: TranslateService,
      private dialogService: DialogService,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectAnalyticsLinks();
  }

  public setLinks(analyticsLinks: AnalyticsLink[]) {
    this.analyticsLinks = analyticsLinks ? analyticsLinks : [];
  }

  public getLinks(): AnalyticsLink[] {
    return this.analyticsLinks;
  }

  public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
      // Check
      if (this.analyticsLinks) {
        this.analyticsLinks = _.orderBy(this.analyticsLinks, 'name', 'asc');
        const links = [];
        for (let index = 0; index < this.analyticsLinks.length; index++) {
          const _link = this.analyticsLinks[index];
          _link.id = index;
          links.push(_link);
        }
        observer.next({
          count: links.length,
          result: links
        });
      } else {
        observer.next({
          count: 0,
          result: []
        });
      }
      observer.complete();
    });
  }

  public buildTableDef(): TableDef {
    return {
      class: 'analytics-links-table-list',
      search: {
        enabled: false
      },
      design: {
        flat: true
      },
      footer: {
        enabled: false
      },
      rowFieldNameIdentifier: 'url'
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
        sortable: false
      },
      {
        id: 'description',
        name: 'analytics.link.description',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: false
      },
      {
        id: 'url',
        name: 'analytics.link.url',
        headerClass: 'col-45p',
        class: 'col-45p',
        sortable: false
      }
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    // const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableCreateAction().getActionDef()
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [
      this.editAction,
      this.viewAction,
      this.deleteAction
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this.showLinksDialog();
        break;
    }
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case 'edit':
        this.showLinksDialog(rowItem);
        break;
      case 'delete':
        this.deleteLink(rowItem);
        break;
      case 'view':
        this.viewLink(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef()
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private showLinksDialog(analyticsLink?: any) {
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
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // find object
        const index = _.findIndex(this.analyticsLinks, { 'id': result.id });
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

  private deleteLink(analyticsLink) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('analytics.delete_title'),
      this.translateService.instant('analytics.delete_confirm', { 'linkName': analyticsLink.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        _.remove(this.analyticsLinks, function (o: AnalyticsLink) { return (o.id === analyticsLink.id) });
        this.refreshData().subscribe();
        this.changed.emit(true);
      }
    });
  }

  private viewLink(analyticsLink) {
    window.open(analyticsLink.url);
  }
}
