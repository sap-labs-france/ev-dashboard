import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { of, Observable } from 'rxjs';
import { Data, DataResult, DropdownItem, TableActionDef, TableColumnDef, TableDef } from '../../common.types';
import { SpinnerService } from '../../services/spinner.service';
import { TableAddAction } from './actions/table-add-action';
import { TableInlineDeleteAction } from './actions/table-inline-delete-action';
import { TableDataSource } from './table-data-source';

export abstract class EditableTableDataSource<T extends Data> extends TableDataSource<T> {
  private editableContent: T[] = [];
  public formArray: FormArray;

  private inlineRemoveAction = new TableInlineDeleteAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService) {
    super(spinnerService);
    this.initDataSource();
  }

  public buildTableDef(): TableDef {
    return {
      isEditable: true,
      rowFieldNameIdentifier: 'id',
    };
  }

  public buildTableActionsDef(): TableActionDef[] {
    return [
      new TableAddAction().getActionDef(),
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case 'add':
        this.addRow();
        break;
    }
  }

  public setContent(content: T[]) {
    this.editableContent = content;
    this.loadData(false).subscribe();
  }

  public setFormArray(formArray: FormArray) {
    this.formArray = formArray;
  }

  // tslint:disable-next-line:no-empty
  public rowActionTriggered(actionDef: TableActionDef, row: T, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case 'inline-delete':
        const index = this.editableContent.indexOf(row);
        this.editableContent.splice(index, 1);
        this.refreshData(false).subscribe();
        this.formArray.markAsDirty();
        break;
    }
  }

  public updateRow(value: any, index: number, columnDef: TableColumnDef) {
    if (this.formArray) {
      if (columnDef.editType === 'radiobutton') {
        this.editableContent.forEach((row) => {
          row[columnDef.id] = false;
        });
        this.formArray.controls.forEach((formRow) => {
          formRow.get(columnDef.id).setValue(false);
        });
      }

      const rowGroup: FormGroup = this.formArray.at(index) as FormGroup;
      rowGroup.get(columnDef.id).setValue(value);
      this.editableContent[index][columnDef.id] = value;
      this.formArray.markAsDirty();
    }
  }

  public loadDataImpl(): Observable<DataResult<T>> {
    if (this.editableContent) {
      if (this.formArray) {
        this.formArray.clear();
        this.editableContent.forEach((data) => this.formArray.push(this.getFormGroupDefinition(data)));
      }

      return of({ count: this.editableContent.length, result: this.editableContent });
    }
    return of({ count: 0, result: [] });
  }

  buildTableRowActions(): TableActionDef[] {
    return [this.inlineRemoveAction];
  }

  protected addRow() {
    const data = this.addData();
    this.editableContent.unshift(data);
    this.refreshData(false).subscribe();
  }

  protected abstract addData(): T;

  protected getFormGroupDefinition(data: T): FormGroup {
    const controls = {};
    this.tableColumnDefs.forEach((tableColumnDef) => {
      let value;
      switch (tableColumnDef.editType) {
        case 'checkbox':
        case 'radiobutton':
          value = data[tableColumnDef.id] ? data[tableColumnDef.id] : false;
          break;
        case 'input':
        default:
          value = data[tableColumnDef.id] ? data[tableColumnDef.id] : '';
      }
      controls[tableColumnDef.id] = new FormControl(value, tableColumnDef.validators);
    });
    return new FormGroup(controls);
  }
}
