import { TableFilter } from '../../../shared/table/filters/table-filter';
import { KeyValue } from '../../../types/GlobalType';
import { FilterType, TableFilterDef } from '../../../types/Table';

export class IssuerFilter extends TableFilter {
  public constructor(defaultValue = true) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'issuer',
      httpId: 'Issuer',
      type: FilterType.DROPDOWN,
      name: 'issuer.title',
      class: 'col-md-6 col-lg-2 col-xl-2',
      label: '',
      defaultValue: defaultValue ? organizations[0] : organizations[1],
      items: Object.assign([], organizations),
      multiple: true,
      exhaustive: true,
    };
    if (!defaultValue) {
      filterDef.defaultValue = organizations[1];
    }
    // Set
    this.setFilterDef(filterDef);
  }
}

export const organizations: KeyValue[] = [
  { key: 'true', value: 'issuer.local' },
  { key: 'false', value: 'issuer.foreign' },
];
