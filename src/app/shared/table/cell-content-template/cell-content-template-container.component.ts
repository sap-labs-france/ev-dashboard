import {
  Component,
  ComponentFactoryResolver,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewContainerRef,
} from '@angular/core';

import { TableColumnDef, TableData, TableDef } from '../../../types/Table';
import { CellContentTemplateDirective } from './cell-content-template.directive';

@Component({
  selector: 'app-cell-content-template-container',
  template: ` <ng-template></ng-template>`,
})
export class CellContentTemplateContainerComponent implements OnInit, OnChanges {
  @Input() public row!: TableData;
  @Input() public columnDef!: TableColumnDef;
  @Input() public tableDef!: TableDef;
  @Output() public componentChanged = new EventEmitter<any>();

  private cellComponent!: CellContentTemplateDirective;
  private cellComponentRef: any;

  // eslint-disable-next-line no-useless-constructor
  public constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    public viewContainerRef: ViewContainerRef
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.cellComponent) {
      // Set the row
      this.cellComponent.row = this.row;
      // Propagate the changes
      this.cellComponent.ngOnChanges(changes);
    }
  }

  public ngOnInit() {
    // Get the component name
    let component;
    // Table Details?
    if (this.tableDef && this.tableDef.rowDetails && this.tableDef.rowDetails.angularComponent) {
      component = this.tableDef.rowDetails.angularComponent;
    }
    // Table Column
    if (this.columnDef && this.columnDef.angularComponent) {
      component = this.columnDef.angularComponent;
    }
    // Create the component
    if (component) {
      this.viewContainerRef.clear();
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
      this.cellComponentRef = this.viewContainerRef.createComponent(componentFactory);
      this.cellComponent = this.cellComponentRef.instance as CellContentTemplateDirective;
      // Pass the data
      this.cellComponent.row = this.row;
      this.cellComponent.columnDef = this.columnDef;
      this.cellComponent.tableDef = this.tableDef;
      // Listen
      this.cellComponent.componentChanged.subscribe((data: any) => {
        this.componentChanged.emit(data);
      });
    }
  }
}
