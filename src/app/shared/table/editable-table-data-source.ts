import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject, of } from 'rxjs';

import { SpinnerService } from '../../services/spinner.service';
import { DataResult } from '../../types/DataResult';
import { ButtonAction } from '../../types/GlobalType';
import { Data, DropdownItem, TableActionDef, TableColumnDef, TableDef, TableEditType } from '../../types/Table';
import { Utils } from '../../utils/Utils';
import { TableAddAction } from './actions/table-add-action';
import { TableDeleteAction } from './actions/table-delete-action';
import { TableDataSource } from './table-data-source';

export abstract class EditableTableDataSource<T extends Data> extends TableDataSource<T> {
  protected editableRows: T[] = [];
  protected tableChangedSubject: Subject<T[]> = new Subject<T[]>();

  protected deleteAction = new TableDeleteAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    public additionalParameters?: any) {
    super(spinnerService, translateService, additionalParameters);
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
      case ButtonAction.ADD:
        this.addRow();
        break;
    }
  }

  public setContent(editableRows: T[]) {
    this.editableRows = editableRows;
    this.loadData(false).subscribe();
  }

  public getContent(): T[] {
    // Filter?
    if (this.editableRows && this.getSearchValue() && this.tableDef.rowFieldNameIdentifier) {
      return this.editableRows.filter((editableRow) => {
        return editableRow[this.tableDef.rowFieldNameIdentifier].toLowerCase().includes(
          this.getSearchValue().toLowerCase());
      });
    }
    return this.editableRows;
  }

  public getTableChangedSubject(): Subject<T[]> {
    return this.tableChangedSubject;
  }

  public setFormArray(formArray: FormArray) {
    this.formArray = formArray;
  }

  public rowActionTriggered(actionDef: TableActionDef, editableRow: T, dropdownItem?: DropdownItem, postDataProcessing?: () => void, actionAlreadyProcessed: boolean = false) {
    const index = this.editableRows.indexOf(editableRow);
    if (!actionAlreadyProcessed) {
      switch (actionDef.id) {
        case ButtonAction.DELETE:
          this.editableRows.splice(index, 1);
          if (this.formArray) {
            this.formArray.removeAt(index);
            this.formArray.markAsDirty();
          }
          actionAlreadyProcessed = true;
          break;
      }
    }
    // Call post process
    if (actionAlreadyProcessed) {
      this.refreshData(false).subscribe();
      if (this.formArray) {
        this.formArray.markAsDirty();
      }
      // Call post data processing
      if (postDataProcessing) {
        postDataProcessing();
      }
      // Notify
      this.tableChangedSubject.next(this.editableRows);
    }
  }

  public setPropertyValue(row: T, propertyName: string, propertyValue: string | boolean | number) {
    row[propertyName] = propertyValue;
    (row[`${propertyName}FormControl`] as FormControl).setValue(propertyValue);
  }

  public rowCellUpdated(cellValue: any, rowIndex: number, columnDef: TableColumnDef, postDataProcessing?: () => void) {
    // Use get content to get the filtered fields
    const contentRows = this.getContent();
    if (this.formArray) {
      const row = contentRows[rowIndex];
      const formControl = row[`${columnDef.id}FormControl`] as FormControl;
      // Clear previous selection
      if (columnDef.editType === TableEditType.RADIO_BUTTON) {
        for (const contentRow of contentRows) {
          // Set value + form value
          contentRow[columnDef.id] = false;
          (row[`${columnDef.id}FormControl`] as FormControl).setValue(false);
        }
      }
      // Set value + form value
      formControl.setValue(cellValue);
      this.formArray.markAsDirty();
      if (!formControl.errors) {
        contentRows[rowIndex][columnDef.id] = cellValue;
      }
      // Check form button
      const formGroup = row['formGroup'] as FormGroup;
      const tableFormRowAction = this.getTableFormRowAction(row);
      if (tableFormRowAction) {
        tableFormRowAction.disabled = !formGroup.valid;
      }
    }
    // Call post data processing
    if (postDataProcessing) {
      postDataProcessing();
    }
    // Notify all non filtered
    this.tableChangedSubject.next(this.editableRows);
  }

  private getTableFormRowAction(row: T): TableActionDef {
    // Check on static button row (should not happen)
    for (const tableRowActionDef of this.tableRowActionsDef) {
      if (tableRowActionDef.formRowAction) {
        return tableRowActionDef;
      }
    }
    // Check on dynamic button row
    const dynamicRowActions = row['dynamicRowActions'] as TableActionDef[];
    if (!Utils.isEmptyArray(dynamicRowActions)) {
      for (const tableRowActionDef of dynamicRowActions) {
        if (tableRowActionDef.formRowAction) {
          return tableRowActionDef;
        }
      }
    }
  }

  public loadDataImpl(): Observable<DataResult<T>> {
    // Use the method to take into account the filtering
    const contentRows = this.getContent();
    if (contentRows) {
      // Create form controls
      this.createFormControls();
      return of({ count: contentRows.length, result: contentRows });
    }
    return of({ count: 0, result: [] });
  }

  public buildTableRowActions(): TableActionDef[] {
    return [this.deleteAction];
  }

  protected createFormControls() {
    if (this.formArray) {
      for (let rowIndex = 0; rowIndex < this.editableRows.length; rowIndex++) {
        const editableRow = this.editableRows[rowIndex];
        if (!editableRow['hasFormControl']) {
          // Add controls in form array
          const formGroup = this.createFormGroup(editableRow);
          this.formArray.push(formGroup);
          // Link row properties to form controls
          this.addFormControlsToRow(rowIndex);
        }
      }
    }
  }

  protected abstract createRow(): T;

  protected isCellDisabled(columnDef: TableColumnDef, editableRow: T): boolean {
    return false;
  }

  private addFormControlsToRow(rowIndex: number) {
    if (this.formArray && this.editableRows) {
      const editableRow = this.editableRows[rowIndex];
      // There is one form group per line containing the form controls (one per props in table column def)
      const formGroup = this.formArray.controls[rowIndex] as FormGroup;
      if (formGroup) {
        for (const tableColumnDef of this.tableColumnsDef) {
          // Assign the form control to the data
          editableRow[`${tableColumnDef.id}FormControl`] = formGroup.get(tableColumnDef.id);
        }
        // Flag
        editableRow['hasFormControl'] = true;
      }
    }
  }

  private addRow() {
    const data = this.createRow();
    this.editableRows.push(data);
    this.refreshData(false).subscribe();
    this.tableChangedSubject.next(this.editableRows);
    if (this.formArray) {
      this.formArray.markAsDirty();
    }
    // Scroll to the inserted element
    if (this.tableDef.id) {
      setTimeout(() => {
        // Get the table
        const table = $(`#${this.tableDef.id}`);
        if (table) {
          // Get the first element
          const firstRowID = this.tableDef && this.tableDef.rowFieldNameIdentifier ?
            this.editableRows[0][this.tableDef.rowFieldNameIdentifier] : 0;
          const firstElement = $(`#${this.tableDef.id} #${firstRowID}`);
          const firstElementTop: number = firstElement && firstElement.offset() ? Utils.convertToInteger(firstElement.offset().top) : 0;
          // Get the current element
          const rowID = this.tableDef && this.tableDef.rowFieldNameIdentifier ?
            data[this.tableDef.rowFieldNameIdentifier] : this.editableRows.length - 1;
          const element = $(`#${this.tableDef.id} #${rowID}`);
          const elementTop: number = element && element.offset() ? Utils.convertToInteger(element.offset().top) : 0;
          if (element) {
            table.scrollTop(elementTop - firstElementTop);
          }
        }
      }, 1);
    }
  }

  protected createFormGroup(editableRow: T): FormGroup {
    const controls = {};
    for (const tableColumnDef of this.tableColumnsDef) {
      let value;
      switch (tableColumnDef.editType) {
        case TableEditType.DISPLAY_ONLY:
          if (!tableColumnDef.isAngularComponent) {
            continue;
          }
          value = editableRow[tableColumnDef.id] ? editableRow[tableColumnDef.id] : '';
          break;
        case TableEditType.CHECK_BOX:
        case TableEditType.RADIO_BUTTON:
          value = editableRow[tableColumnDef.id] ? editableRow[tableColumnDef.id] : false;
          break;
        case TableEditType.INPUT:
        default:
          value = editableRow[tableColumnDef.id] ? editableRow[tableColumnDef.id] : '';
      }
      if (this.formArray && tableColumnDef.unique) {
        if (!tableColumnDef.validators) {
          tableColumnDef.validators = [];
        }
        tableColumnDef.validators.push(uniqValidator(this.formArray, tableColumnDef.id));
      }
      const formControl = new FormControl(value, tableColumnDef.validators);
      if (tableColumnDef.canBeDisabled && this.isCellDisabled(tableColumnDef, editableRow)) {
        formControl.disable({ onlySelf: true });
      }
      controls[tableColumnDef.id] = formControl;
    }
    // Keep the ref
    editableRow['formGroup'] = new FormGroup(controls);
    return editableRow['formGroup'] as FormGroup;
  }
}

export function uniqValidator(formArray: FormArray, controlId: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const duplicate = formArray.value.find((row: any) => row[controlId] === control.value);
    return duplicate ? { duplicate: true } : null;
  };
}
