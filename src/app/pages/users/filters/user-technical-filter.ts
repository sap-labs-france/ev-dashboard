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
      name: 'users.technical',
      class: 'col-md-6 col-lg-3 col-xl-2',
      label: 'users.technical',
      cleared: true,
      currentValue: true,
      items: Object.assign([], technicalValues),
      defaultValue: defaultValue ? technicalValues[1] : technicalValues[0],
    };
    this.setFilterDef(filterDef);
  }
}

export const technicalValues: KeyValue[] = [
  { key: 'false', value: 'general.no' },
  { key: 'true', value: 'general.yes' },
];
