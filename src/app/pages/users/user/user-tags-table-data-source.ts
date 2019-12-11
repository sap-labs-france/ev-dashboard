import { Injectable } from '@angular/core';
import { Validators } from '@angular/forms';
import { TableColumnDef, Tag } from '../../../common.types';
import { SpinnerService } from '../../../services/spinner.service';
import { EditableTableDataSource } from '../../../shared/table/editable-table-data-source';

@Injectable()
export class UserTagsTableDataSource extends EditableTableDataSource<Tag> {
  constructor(public spinnerService: SpinnerService) {
    super(spinnerService);
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'id',
        name: 'tags.id',
        editType: 'input',
        validators: [Validators.required,
          Validators.minLength(8),
          Validators.maxLength(16),
          Validators.pattern('^[a-zA-Z0-9]*$')],
        errorMessage: 'users.invalid_tag_id',
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
