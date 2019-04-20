import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { TableDataSource } from 'app/shared/table/table-data-source';
import { SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, DropdownItem, SacLink } from 'app/common.types';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { FormGroup } from '@angular/forms';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { CentralServerService } from 'app/services/central-server.service';
import { LocaleService } from 'app/services/locale.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { Constants } from 'app/utils/Constants';

import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { DialogService } from 'app/services/dialog.service';
import { SacLinkDialogComponent } from './sac-link.dialog.component';


const POLL_INTERVAL = 15000;
@Injectable()
export class SacLinksDataSource extends TableDataSource<SacLink> {
  private readonly tableActionsRow: TableActionDef[];
  private sacLinks: SacLink[];
  private formGroup: FormGroup;

  constructor(
      private localeService: LocaleService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private spinnerService: SpinnerService,
      private dialogService: DialogService,
      private router: Router,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService,
      private datePipe: AppDatePipe) {
    super();
    // Init
    this.initDataSource();
    this.setPollingInterval(POLL_INTERVAL);
    this.tableActionsRow = [
      new TableEditAction().getActionDef(),
      new TableViewAction().getActionDef(),
      new TableDeleteAction().getActionDef()
    ];
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectSacLinks();
  }

  public initSacLinks(sacLinks: SacLink[], formGroup: FormGroup) {
    this.sacLinks = sacLinks ? sacLinks : [];
    this.formGroup = formGroup;
  }

  public getSacLinks(): SacLink[] {
    return this.sacLinks;
  }

  public getPaginatorPageSizes() {
    return [];
  }

  public loadData(refreshAction = false): Observable<any> {
    return new Observable((observer) => {
      setTimeout(() => {
        // Set number of records
        this.setNumberOfRecords(this.getData().length);
          // setTimeout(() => {
          if (this.sacLinks) {
            this.sacLinks = _.orderBy(this.sacLinks, 'name', 'asc');
            const links = [];
            for (let index = 0; index < this.sacLinks.length; index++) {
              const _link = this.sacLinks[index];
              _link.id = index;
              links.push(_link);
            }
            // Update nbr records
            this.setNumberOfRecords(links.length);
            // Ok
            observer.next(links);
            observer.complete();
          }
      }, 1);
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
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const locale = this.localeService.getCurrentFullLocaleForJS();
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
      // ...tableActionsDef
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    return this.tableActionsRow;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this._showSacLinksDialog();
        break;
    }
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case 'edit':
        this._showSacLinksDialog(rowItem);
        break;
      case 'delete':
        this._deleteSacLink(rowItem);
        break;
      case 'view':
        this._viewSacLink(rowItem);
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

  private _showSacLinksDialog(sacLink?: any) {
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
        this.loadData();
      }
    });
  }

  private _deleteSacLink(sacLink) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('sac.delete_title'),
      this.translateService.instant('sac.delete_confirm', { 'linkName': sacLink.name })
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        _.remove(this.sacLinks, function (o: SacLink) { return (o.id === sacLink.id) });
        this.formGroup.markAsDirty();
        this.loadData();
      }
    });
  }

  private _viewSacLink(sacLink) {
    window.open(sacLink.url);
  }
}
