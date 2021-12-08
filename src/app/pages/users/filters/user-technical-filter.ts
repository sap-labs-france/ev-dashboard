import { TableFilter } from '../../../shared/table/filters/table-filter';
import { KeyValue } from '../../../types/GlobalType';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class UserTechnicalFilter extends TableFilter {
  public constructor(defaultValue = false) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'technical',
      httpId: 'Technical',
      type: FilterType.DROPDOWN,
      multiple: true,
      exhaustive: true,
      name: 'users.technical_user',
      class: 'col-md-6 col-lg-3 col-xl-2',
      label: 'users.technical',
      cleared: true,
      currentValue: defaultValue,
      items: Object.assign([], technicalValues),
    };
    this.setFilterDef(filterDef);
  }
}

export const technicalValues: KeyValue[] = [
  { key: 'true', value: 'users.technical_user' },
  { key: 'false', value: 'users.non_technical_user' },
];
