import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { SpinnerService } from 'services/spinner.service';
import { AppDatePipe } from 'shared/formatters/app-date.pipe';
import { TableRefreshAction } from 'shared/table/actions/table-refresh-action';
import { TableDataSource } from 'shared/table/table-data-source';
import { DataResult } from 'types/DataResult';
import { TableActionDef, TableColumnDef, TableDef } from 'types/Table';
import { Tag, TagChangeHistory } from 'types/Tag';
import { User } from 'types/User';
import { Utils } from 'utils/Utils';

@Injectable()
export class TagLimitsHistoryTableDataSource extends TableDataSource<TagChangeHistory> {
  private tag!: Tag;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private datePipe: AppDatePipe) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public loadData(showSpinner: boolean = false): Observable<void> {
    return super.loadData(showSpinner);
  }

  public loadDataImpl(): Observable<DataResult<TagChangeHistory>> {
    return new Observable((observer) => {
      // Return connector
      if (this.tag && !Utils.isEmptyArray(this.tag.limit.changeHistory)) {
        observer.next({
          count: this.tag.limit.changeHistory.length,
          result: this.tag.limit.changeHistory,
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

  public setTag(tag: Tag) {
    this.tag = tag;
  }

  public buildTableDef(): TableDef {
    return {
      class: 'table-detailed-list',
      rowSelection: {
        enabled: false,
      },
      isSimpleTable: true,
      design: {
        flat: true,
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'lastChangedOn',
        name: 'users.changed_on',
        formatter: (lastChangedOn: Date) => this.datePipe.transform(lastChangedOn),
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true,
      },
      {
        id: 'lastChangedBy',
        name: 'users.changed_by',
        headerClass: 'col-15p',
        class: 'col-15p',
        formatter: (user: User) => Utils.buildUserFullName(user),
      },
      {
        id: 'newLimitKwhEnabled',
        name: 'tags.limits_enabled',
        headerClass: 'col-15p',
        class: 'col-15p',
        formatter: (newLimitKwhEnabled: number, tagChangeHistory: TagChangeHistory) =>
          this.buildLimitChanges(tagChangeHistory.oldLimitKwhEnabled, newLimitKwhEnabled),
      },
      {
        id: 'newLimitKwh',
        name: 'tags.limits_kwh',
        headerClass: 'col-15p',
        class: 'col-15p',
        formatter: (newLimitKwh: number, tagChangeHistory: TagChangeHistory) =>
          this.buildLimitChanges(tagChangeHistory.oldLimitKwh, newLimitKwh),
      },
      {
        id: 'newLimitKwhConsumed',
        name: 'tags.limits_consumed_kwh',
        headerClass: 'col-15p',
        class: 'col-15p',
        formatter: (newLimitKwhConsumed: number, tagChangeHistory: TagChangeHistory) =>
          this.buildLimitChanges(tagChangeHistory.oldLimitKwhConsumed, newLimitKwhConsumed),
      },
    ];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
    ];
  }

  private buildLimitChanges(oldValue: number|boolean, newValue: number|boolean): string {
    return oldValue !== newValue ? `${oldValue} > ${newValue}` : '-';
  }
}
