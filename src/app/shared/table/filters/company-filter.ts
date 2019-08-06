import { TableFilterDef } from '../../../common.types';
import { Constants } from '../../../utils/Constants';
import { CompaniesFilterDialogComponent } from '../../dialogs/companies/companies-filter-dialog-component';
import { TableFilter } from './table-filter';

export class CompaniesTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'companies',
      httpId: 'CompanyID',
      type: Constants.FILTER_TYPE_DIALOG_TABLE,
      defaultValue: '',
      label:'',
      multiple: true,
      name: 'companies.titles',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: CompaniesFilterDialogComponent
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
