import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';

import { CellContentTemplateDirective } from './cell-content-template.directive';
import { CellContentTemplateComponent } from './cell-content-template.component';
import { TableColumnDef } from '../../../common.types';

@Component({
  selector: 'app-cell-component-container',
  template: `
        <ng-template appCellContentTemplate></ng-template>
    `
})
export class CellContentComponentContainer implements OnInit, OnDestroy, OnChanges {
  @Input() row: any;
  @Input() columnDef: TableColumnDef;

  @ViewChild(CellContentTemplateDirective) angularCellContentDirective: CellContentTemplateDirective;

  componentRef: any;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {
  }

  loadComponent() {
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.columnDef.angularComponentName);
    const viewContainerRef = this.angularCellContentDirective.viewContainerRef;
    viewContainerRef.clear();
    this.componentRef = viewContainerRef.createComponent(componentFactory);
    (<CellContentTemplateComponent>this.componentRef.instance).row = this.row;
  }

  ngOnChanges(changes: SimpleChanges): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.loadComponent();
/*    if(<CellContentTemplateComponent>this.componentRef && <CellContentTemplateComponent>this.componentRef.instance){
      (<CellContentTemplateComponent>this.componentRef.instance).row = this.row;
    }*/
  }
}
