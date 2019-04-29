import {Component, ComponentFactoryResolver, Input, OnInit, ViewContainerRef, SimpleChanges, OnChanges} from '@angular/core';
import {CellContentTemplateComponent} from './cell-content-template.component';
import {TableColumnDef, TableDef} from '../../../common.types';

@Component({
  selector: 'app-cell-component-container',
  template: `<ng-template></ng-template>`
})

// tslint:disable-next-line:component-class-suffix
export class CellContentComponentContainer implements OnInit, OnChanges {
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
      this.cellComponent.row = this.row;
    }
  }

  ngOnInit() {
    // Get the component name
    let component;
    // Table Details?
    if (this.tableDef && this.tableDef.rowDetails && this.tableDef.rowDetails.angularComponentName) {
      component = this.tableDef.rowDetails.angularComponentName;
    }
    // Table Column
    if (this.columnDef && this.columnDef.angularComponentName) {
      component = this.columnDef.angularComponentName;
    }
    console.log('CellContentComponentContainer');
    // Create the component
    if (component) {
      this.viewContainerRef.clear();
      const componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
      this.cellComponentRef = this.viewContainerRef.createComponent(componentFactory);
      this.cellComponent = <CellContentTemplateComponent>this.cellComponentRef.instance;
      // Pass the data
      this.cellComponent.row = this.row;
    }
  }
}
