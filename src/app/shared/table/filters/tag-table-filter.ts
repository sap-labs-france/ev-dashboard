import { TagsDialogComponent } from '../../../shared/dialogs/tags/tags-dialog.component';
import { FilterType, TableFilterDef } from '../../../types/Table';
import { TableFilter } from './table-filter';

export class TagTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'tag',
      httpId: 'TagID',
      type: FilterType.DIALOG_TABLE,
      defaultValue: '',
      label: '',
      name: 'users.tags',
      class: 'col-md-6 col-lg-4 col-xl-2',
      dialogComponent: TagsDialogComponent,
      multiple: true,
      cleared: true,
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
