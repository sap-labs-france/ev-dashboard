import * as moment from 'moment';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { Constants } from '../../../utils/Constants';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from '../../../services/central-server.service';
import { TableFilterDef } from '../../../common.types';

export class LogDateTableFilter implements TableFilter  {
  // Default filter
  private filter: TableFilterDef = {
    id: 'timestamp',
    httpId: 'DateFrom',
    type: Constants.FILTER_TYPE_DATE,
    name: 'general.search_date_from',
    currentValue: moment().startOf('day').toDate(),
    class: 'col-150'
  }

  constructor(
      private translateService: TranslateService,
      private centralServerService: CentralServerService) {
    // translate the name
    this.filter.name = this.translateService.instant(this.filter.name);
  }

  // Return filter
  public getFilterDef(): TableFilterDef {
    return this.filter;
  }
}
