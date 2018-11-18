import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';

import { CellContentTemplateDirective } from './cell-content-template.directive';
import { CellContentTemplateComponent } from './cell-content-template.component';
import { TableColumnDef } from '../../../common.types';

@Component({
  selector: 'app-cell-component-container',
  template: `
      <div>
        <ng-template appCellContentTemplate></ng-template>
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
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.columnDef.angularComponentName);
    const viewContainerRef = this.angularCellContentDirective.viewContainerRef;
    viewContainerRef.clear();
    const componentRef = viewContainerRef.createComponent(componentFactory);
    (<CellContentTemplateComponent>componentRef.instance).setData(this.row, this.columnDef);
  }
}
