import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { CellContentTemplateDirective } from './cellContentTemplate.directive';
import { CellContentTemplateComponent } from './cellContentTemplate.component';
import { TableColumnDef } from "../../../common.types";

@Component({
  selector: 'cell-component-container',
  template: `
              <div>
                <ng-template cell-content-template></ng-template>
              </div>
            `
})
export class CellContentComponentContainer implements OnInit, OnDestroy {
  @Input() row: any;
  @Input() columnDef: TableColumnDef;

  @ViewChild(CellContentTemplateDirective) angularCellContentDirective: CellContentTemplateDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnDestroy() {
  }

  loadComponent() {
    
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.columnDef.angularComponentName);

    let viewContainerRef = this.angularCellContentDirective.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<CellContentTemplateComponent>componentRef.instance).setData(this.row, this.columnDef);
  }

}