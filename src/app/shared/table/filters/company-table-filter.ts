import { FilterType, TableFilterDef } from '../../../types/Table';
import { CompaniesDialogComponent } from '../../dialogs/companies/companies-dialog.component';
import { TableFilter } from './table-filter';

export class CompanyTableFilter extends TableFilter {
  public constructor(dependentFilters?: TableFilterDef[]) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'companies',
      httpId: 'CompanyID',
      type: FilterType.DIALOG_TABLE,
      defaultValue: '',
      label: '',
      multiple: true,
      name: 'companies.titles',
      dialogComponent: CompaniesDialogComponent,
      cleared: true,
      dependentFilters
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
