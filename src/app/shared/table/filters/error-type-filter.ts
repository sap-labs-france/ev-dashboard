import {Constants} from '../../../utils/Constants';
import {TableFilter} from '../../../shared/table/filters/table-filter';
import {TableFilterDef} from '../../../common.types';


export class ErrorTypeTableFilter extends TableFilter {
  constructor(types) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'errorType',
      httpId: 'ErrorType',
      type: Constants.FILTER_TYPE_DROPDOWN,
      name: 'errors.title',
      class: 'col-sm-4 col-md-4 col-lg-3 col-xl-2 ',
      currentValue: Constants.FILTER_ALL_KEY,
      items: Object.assign([], types)
    };
    filterDef.items.unshift({key: Constants.FILTER_ALL_KEY, value: 'general.all'});
    // Set
    this.setFilterDef(filterDef);
  }
}
