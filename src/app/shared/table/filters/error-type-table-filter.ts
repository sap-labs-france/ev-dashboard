import { FilterType, TableFilterDef } from '../../../types/Table';

import { KeyValue } from '../../../types/GlobalType';
import { TableFilter } from '../../../shared/table/filters/table-filter';

export class ErrorTypeTableFilter extends TableFilter {
  constructor(types: KeyValue[]) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'errorType',
      httpId: 'ErrorType',
      type: FilterType.DROPDOWN,
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
