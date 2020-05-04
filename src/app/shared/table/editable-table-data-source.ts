import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { Data, DropdownItem, TableActionDef, TableColumnDef, TableDef, TableEditType } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable, Subject, of } from 'rxjs';
import { SpinnerService } from '../../services/spinner.service';
import { TableAddAction } from './actions/table-add-action';
import { TableInlineDeleteAction } from './actions/table-inline-delete-action';
import { TableDataSource } from './table-data-source';

export abstract class EditableTableDataSource<T extends Data> extends TableDataSource<T> {
  protected editableRows: T[] = [];
  protected tableChangedSubject: Subject<T[]> = new Subject<T[]>();

  protected inlineRemoveAction = new TableInlineDeleteAction().getActionDef();

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
    // Filter?
    if (this.editableRows && this.getSearchValue() && this.tableDef.rowFieldNameIdentifier) {
      return this.editableRows.filter((editableRow) => {
        // @ts-ignore
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

  // tslint:disable-next-line:no-empty
  public rowActionTriggered(actionDef: TableActionDef, editableRow: T, dropdownItem?: DropdownItem, postDataProcessing?: () => void, actionAlreadyProcessed: boolean = false) {
    let actionDone = actionAlreadyProcessed;
    if (!actionAlreadyProcessed) {
      switch (actionDef.id) {
        case ButtonAction.INLINE_DELETE:
          const index = this.editableRows.indexOf(editableRow);
          this.editableRows.splice(index, 1);
          actionDone = true;
          break;
      }
    }
    // Call post process
    if (actionDone) {
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

  public rowCellUpdated(cellValue: any, cellIndex: number, columnDef: TableColumnDef, postDataProcessing?: () => void) {
    // Use get content to get the filtered fields
    const contentRows = this.getContent();
    if (this.formArray) {
      if (columnDef.editType === TableEditType.RADIO_BUTTON) {
        for (const contentRow of contentRows) {
          // @ts-ignore
          contentRow[columnDef.id] = false;
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
      contentRows[cellIndex][columnDef.id] = cellValue;
      this.formArray.markAsDirty();
    }
    // Call post data processing
    if (postDataProcessing) {
      postDataProcessing();
    }
    // Notify all non filtered
    this.tableChangedSubject.next(this.editableRows);
  }

  public loadDataImpl(): Observable<DataResult<T>> {
    // Use the method to take into account the filtering
    const contentRows = this.getContent();
    if (contentRows) {
      if (this.formArray) {
        this.formArray.clear();
        // @ts-ignore
        for (const contentRow of contentRows) {
          this.formArray.push(this.createFormGroupDefinition(contentRow));
        }
      }
      return of({ count: contentRows.length, result: contentRows });
    }
    return of({ count: 0, result: [] });
  }

  public buildTableRowActions(): TableActionDef[] {
    return [this.inlineRemoveAction];
  }

  protected abstract createRow(): T;

  protected isCellDisabled(columnDef: TableColumnDef, editableRow: T): boolean {
    return false;
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
      // @ts-ignore
      setTimeout(() => {
        // Get the table
        const table = $(`#${this.tableDef.id}`);
        if (table) {
          // Get the first element
          const firstRowID = this.tableDef && this.tableDef.rowFieldNameIdentifier ?
            // @ts-ignore
            this.editableRows[0][this.tableDef.rowFieldNameIdentifier] : 0;
          const firstElement = $(`#${this.tableDef.id} #${firstRowID}`);
          // @ts-ignore
          const firstElementTop: number = firstElement && firstElement.offset() ? Utils.convertToInteger(firstElement.offset().top) : 0;
          // Get the current element
          const rowID = this.tableDef && this.tableDef.rowFieldNameIdentifier ?
            // @ts-ignore
            data[this.tableDef.rowFieldNameIdentifier] : this.editableRows.length - 1;
          const element = $(`#${this.tableDef.id} #${rowID}`);
          // @ts-ignore
          const elementTop: number = element && element.offset() ? Utils.convertToInteger(element.offset().top) : 0;
          if (element) {
            table.scrollTop(elementTop - firstElementTop);
          }
        }
      }, 1);
    }
  }

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
      const formControl = new FormControl(value, tableColumnDef.validators);
      if (tableColumnDef.canBeDisabled && this.isCellDisabled(tableColumnDef, editableRow)) {
        formControl.disable({ onlySelf: true });
      }
      // @ts-ignore
      controls[tableColumnDef.id] = formControl;
    }
    return new FormGroup(controls);
  }
}

export function uniqValidator(formArray: FormArray, controlId: string): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const duplicate = formArray.value.find((row: any) => row[controlId] === control.value);
    return duplicate ? { duplicate: true } : null;
  };
}
