import {TableFilter} from './table-filter';
import {Constants} from '../../../utils/Constants';
import {TableFilterDef} from '../../../common.types';
import {CompaniesFilterDialogComponent} from '../../dialogs/companies/companies-filter-dialog-component';

export class CompaniesTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'companies',
      httpId: 'CompanyID',
      type: Constants.FILTER_TYPE_DIALOG_TABLE,
      defaultValue: 'general.all',
      name: 'companies.title',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: CompaniesFilterDialogComponent
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
