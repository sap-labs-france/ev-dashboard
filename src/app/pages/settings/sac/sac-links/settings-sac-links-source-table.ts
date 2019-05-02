import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { TableDataSource } from 'app/shared/table/table-data-source';
import { SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, DropdownItem, SacLink } from 'app/common.types';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { FormGroup } from '@angular/forms';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Constants } from 'app/utils/Constants';

import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { DialogService } from 'app/services/dialog.service';
import { SacLinkDialogComponent } from './sac-link.dialog.component';

@Injectable()
export class SacLinksDataSource extends TableDataSource<SacLink> {
  private sacLinks: SacLink[];
  private formGroup: FormGroup;

  constructor(
      private translateService: TranslateService,
      private dialogService: DialogService,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService) {
    super();
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectSacLinks();
  }

  public setSacLinks(sacLinks: SacLink[], formGroup: FormGroup) {
    this.sacLinks = sacLinks ? sacLinks : [];
    this.formGroup = formGroup;
  }

  public getSacLinks(): SacLink[] {
    return this.sacLinks;
  }

  public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
    // Set number of records
    this.setTotalNumberOfRecords(this.getData().length);
      // Check
      if (this.sacLinks) {
        this.sacLinks = _.orderBy(this.sacLinks, 'name', 'asc');
        const links = [];
        for (let index = 0; index < this.sacLinks.length; index++) {
          const _link = this.sacLinks[index];
          _link.id = index;
          links.push(_link);
        }
        // Update nbr records
        this.setTotalNumberOfRecords(links.length);
        observer.next(links);
        observer.complete();
      }
    });
  }

  public buildTableDef(): TableDef {
    return {
      class: 'sac-links-table-list',
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
        name: 'sac.link.name',
        headerClass: 'col-20p',
        class: 'text-left col-20p',
        sorted: true,
        direction: 'asc',
        sortable: false
      },
      {
        id: 'description',
        name: 'sac.link.description',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: false
      },
      {
        id: 'url',
        name: 'sac.link.url',
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
      new TableEditAction().getActionDef(),
      new TableViewAction().getActionDef(),
      new TableDeleteAction().getActionDef()
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this.showSacLinksDialog();
        break;
    }
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case 'edit':
        this.showSacLinksDialog(rowItem);
        break;
      case 'delete':
        this.deleteSacLink(rowItem);
        break;
      case 'view':
        this.viewSacLink(rowItem);
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

  private showSacLinksDialog(sacLink?: any) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (sacLink) {
      dialogConfig.data = sacLink;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(SacLinkDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // find object
        const index = _.findIndex(this.sacLinks, { 'id': result.id });
        if (index >= 0) {
          this.sacLinks.splice(index, 1, result);
        } else {
          this.sacLinks.push(result);
        }
        this.formGroup.markAsDirty();
        this.refreshData().subscribe();
      }
    });
  }

  private deleteSacLink(sacLink) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('sac.delete_title'),
      this.translateService.instant('sac.delete_confirm', { 'linkName': sacLink.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        _.remove(this.sacLinks, function (o: SacLink) { return (o.id === sacLink.id) });
        this.formGroup.markAsDirty();
        this.refreshData().subscribe();
      }
    });
  }

  private viewSacLink(sacLink) {
    window.open(sacLink.url);
  }
}
