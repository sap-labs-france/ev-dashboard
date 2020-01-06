import { KeyValue } from 'app/types/GlobalType';
import { TableFilterDef } from 'app/types/Table';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { Constants } from '../../../utils/Constants';

export class ErrorTypeTableFilter extends TableFilter {
  constructor(types: KeyValue[]) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'errorType',
      httpId: 'ErrorType',
      type: Constants.FILTER_TYPE_DROPDOWN,
      name: 'errors.title',
      class: 'col-sm-4 col-md-4 col-lg-3 col-xl-2 ',
      label: '',
      currentValue: [],
      items: Object.assign([], types),
      multiple: true,
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
