import { Component, ComponentFactoryResolver, Input, OnChanges, OnInit, SimpleChanges, ViewContainerRef, Output, EventEmitter } from '@angular/core';
import { Data, TableColumnDef, TableDef } from 'app/types/Table';
import { CellContentTemplateComponent } from './cell-content-template.component';

@Component({
  selector: 'app-cell-content-template-container',
  template: `
    <ng-template></ng-template>`,
})

// tslint:disable-next-line:component-class-suffix
export class CellContentTemplateContainerComponent implements OnInit, OnChanges {
  @Input() row!: Data;
  @Input() columnDef!: TableColumnDef;
  @Input() tableDef!: TableDef;
  @Output() componentChanged = new EventEmitter<any>();

  private cellComponent!: CellContentTemplateComponent;
  private cellComponentRef: any;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    public viewContainerRef: ViewContainerRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.cellComponent) {
        // Set the row
      this.cellComponent.row = this.row;
      // Propagate the changes
      this.cellComponent.ngOnChanges(changes);
    }
  }

  ngOnInit() {
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
      this.cellComponent = (this.cellComponentRef.instance as CellContentTemplateComponent);
      // Pass the data
      this.cellComponent.row = this.row;
      this.cellComponent.columnDef = this.columnDef;
      // Listen
      this.cellComponent.componentChanged.subscribe((data: any) => {
        this.componentChanged.emit(data);
      });
    }
  }
}
