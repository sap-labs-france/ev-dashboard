import { Injectable } from '@angular/core';
import { TableColumnDef, Tag } from '../../../common.types';
import { SpinnerService } from '../../../services/spinner.service';
import { EditableTableDataSource } from '../../../shared/table/editable-table-data-source';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable()
export class UserTagsTableDataSource extends EditableTableDataSource<Tag> {
  constructor(public spinnerService: SpinnerService) {
    super(spinnerService, 'tags');
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'id',
        name: 'tags.id',
        editType: 'input',
        validators: [Validators.required],
        headerClass: 'text-left col-30p',
        class: 'text-left col-30p',
      },
      {
        id: 'description',
        name: 'general.description',
        editType: 'input',
        headerClass: 'text-left col-50p',
        class: 'text-left col-50p',
      },
      {
        id: 'issuer',
        name: 'tags.issuer',
        editType: 'radiobutton',
        headerClass: 'col-15p',
        class: 'text-center col-15p',
      },
    ];
  }

  public addData() {
    return{
      id: '',
      description: '',
      issuer: false,
    };
  }
}
