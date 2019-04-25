import {Component, ComponentFactoryResolver, Input, OnInit, ViewContainerRef} from '@angular/core';
import {CellContentTemplateComponent} from './cell-content-template.component';
import {TableColumnDef} from '../../../common.types';

@Component({
  selector: 'app-cell-component-container',
  template: `<ng-template></ng-template>`
})

// tslint:disable-next-line:component-class-suffix
export class CellContentComponentContainer implements OnInit {
  @Input() row: any;
  @Input() columnDef: TableColumnDef;
  private cellComponent: CellContentTemplateComponent;
  private cellComponentRef: any;

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    public viewContainerRef: ViewContainerRef) {
  }

  ngOnInit() {
    this.viewContainerRef.clear();
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.columnDef.angularComponentName);
    this.cellComponentRef = this.viewContainerRef.createComponent(componentFactory);
    this.cellComponent = <CellContentTemplateComponent>this.cellComponentRef.instance;
    this.cellComponent.row = this.row;
  }
}
