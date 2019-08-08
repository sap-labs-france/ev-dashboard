import { Component, ComponentFactoryResolver, Input, OnChanges, OnInit, SimpleChanges, ViewContainerRef } from '@angular/core';
import { TableColumnDef, TableDef } from '../../../common.types';
import { CellContentTemplateComponent } from './cell-content-template.component';

@Component({
  selector: 'app-cell-content-template-container',
  template: `
    <ng-template></ng-template>`
})

// tslint:disable-next-line:component-class-suffix
export class CellContentTemplateContainerComponent implements OnInit, OnChanges {
  @Input() row: any;
  @Input() columnDef: TableColumnDef;
  @Input() tableDef: TableDef;

  private cellComponent: CellContentTemplateComponent;
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
      this.cellComponent = <CellContentTemplateComponent>this.cellComponentRef.instance;
      // Pass the data
      this.cellComponent.row = this.row;
      this.cellComponent.columnDef = this.columnDef;
    }
  }
}
