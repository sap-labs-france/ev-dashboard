import * as moment from 'moment';
import {TableFilter} from '../../../shared/table/filters/table-filter';
import {Constants} from '../../../utils/Constants';
import {TableFilterDef} from '../../../common.types';

export class DateTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'timestamp',
      httpId: 'Date',
      type: Constants.FILTER_TYPE_DATE,
      name: 'general.search_date',
      currentValue: moment().startOf('day').toDate(),
      class: 'col-sm-6 col-md-4 col-lg-3 col-xl-2'
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
