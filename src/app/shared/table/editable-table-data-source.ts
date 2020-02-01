import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { Data, DropdownItem, TableActionDef, TableColumnDef, TableDef, TableEditType } from 'app/types/Table';
import { of, Observable, Subject } from 'rxjs';
import { SpinnerService } from '../../services/spinner.service';
import { TableAddAction } from './actions/table-add-action';
import { TableInlineDeleteAction } from './actions/table-inline-delete-action';
import { TableDataSource } from './table-data-source';

export abstract class EditableTableDataSource<T extends Data> extends TableDataSource<T> {
  private editableRows: T[] = [];
  private tableChangedSubject: Subject<T[]> = new Subject<T[]>();

  private inlineRemoveAction = new TableInlineDeleteAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public additionalParameters?: any) {
    super(spinnerService, additionalParameters);
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

  public setContent(editableRows: T[]) {
    this.editableRows = editableRows;
    this.loadData(false).subscribe();
  }

  public getContent(): T[] {
    return this.editableRows;
  }

  getTableChangedSubject(): Subject<T[]> {
    return this.tableChangedSubject;
  }

  public setFormArray(formArray: FormArray) {
    this.formArray = formArray;
  }

  // tslint:disable-next-line:no-empty
  public rowActionTriggered(actionDef: TableActionDef, editableRow: T, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case ButtonAction.INLINE_DELETE:
        const index = this.editableRows.indexOf(editableRow);
        const deletedRows = this.editableRows.splice(index, 1);
        this.refreshData(false).subscribe();
        if (this.formArray) {
          this.formArray.markAsDirty();
        }
        // Notify
        this.tableChangedSubject.next(this.editableRows);
        break;
    }
  }

  public rowCellUpdated(cellValue: any, cellIndex: number, columnDef: TableColumnDef, postDataProcess?: () => void) {
    if (this.formArray) {
      if (columnDef.editType === TableEditType.RADIO_BUTTON) {
        for (const editableRow of this.editableRows) {
          // @ts-ignore
          editableRow[columnDef.id] = false;
        }
        for (const control of this.formArray.controls) {
          // @ts-ignore
          control.get(columnDef.id).setValue(false);
        }
      }
      const rowGroup: FormGroup = this.formArray.at(cellIndex) as FormGroup;
      // @ts-ignore
      rowGroup.get(columnDef.id).setValue(cellValue);
      // @ts-ignore
      this.editableRows[cellIndex][columnDef.id] = cellValue;
      this.formArray.markAsDirty();
    }
    // Call post process
    if (postDataProcess) {
      postDataProcess();
    }
    // Notify
    this.tableChangedSubject.next(this.editableRows);
  }

  public loadDataImpl(): Observable<DataResult<T>> {
    if (this.editableRows) {
      if (this.formArray) {
        this.formArray.clear();
        // @ts-ignore
        for (const editableRow of this.editableRows) {
          this.formArray.push(this.createFormGroupDefinition(editableRow));
        }
      }
      return of({ count: this.editableRows.length, result: this.editableRows });
    }
    return of({ count: 0, result: [] });
  }

  buildTableRowActions(): TableActionDef[] {
    return [this.inlineRemoveAction];
  }

  private addRow() {
    const data = this.createRow();
    this.editableRows.push(data);
    this.refreshData(false).subscribe();
    this.tableChangedSubject.next(this.editableRows);
  }

  protected abstract createRow(): T;

  private createFormGroupDefinition(editableRow: T): FormGroup {
    const controls = {};
    for (const tableColumnDef of this.tableColumnDefs) {
      let value;
      switch (tableColumnDef.editType) {
        case TableEditType.CHECK_BOX:
        case TableEditType.RADIO_BUTTON:
          // @ts-ignore
          value = editableRow[tableColumnDef.id] ? editableRow[tableColumnDef.id] : false;
          break;
        case TableEditType.INPUT:
        default:
          // @ts-ignore
          value = editableRow[tableColumnDef.id] ? editableRow[tableColumnDef.id] : '';
      }
      if (this.formArray && tableColumnDef.unique) {
        if (!tableColumnDef.validators) {
          tableColumnDef.validators = [];
        }
        tableColumnDef.validators.push(uniqValidator(this.formArray, tableColumnDef.id));
      }
      // @ts-ignore
      controls[tableColumnDef.id] = new FormControl(value, tableColumnDef.validators);
    }
    return new FormGroup(controls);
  }
}

export function uniqValidator(formArray: FormArray, controlId: string): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} | null => {
    const duplicate = formArray.value.find((row: any) => row[controlId] === control.value);
    return duplicate ? {duplicate: true} : null;
  };
}
