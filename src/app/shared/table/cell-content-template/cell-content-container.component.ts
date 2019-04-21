import {Component, ComponentFactoryResolver, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';

import {CellContentTemplateDirective} from './cell-content-template.directive';
import {CellContentTemplateComponent} from './cell-content-template.component';
import {TableColumnDef} from '../../../common.types';

@Component({
  selector: 'app-cell-component-container',
  template: `
    <ng-template appCellContentTemplate></ng-template>
  `
})
// tslint:disable-next-line:component-class-suffix
export class CellContentComponentContainer implements OnInit, OnDestroy, OnChanges {
  @Input() row: any;
  @Input() columnDef: TableColumnDef;
  private cellComponent: CellContentTemplateComponent;

  @ViewChild(CellContentTemplateDirective) angularCellContentDirective: CellContentTemplateDirective;

  componentRef: any;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {
  }

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
    this.cellComponent = <CellContentTemplateComponent>this.componentRef.instance;
    this.cellComponent.row = this.row;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.row.isFirstChange()) {
      if (this.cellComponent && changes.row && changes.row.currentValue) {
        // console.log('REFRESH cell component ' + this.columnDef.angularComponentName.name);
        if (typeof this.cellComponent.refresh === 'function') {
          this.cellComponent.row = changes.row.currentValue;
          this.cellComponent.refresh();
        } else {
          console.error('missing refresh in component ' + this.columnDef.angularComponentName.name);
        }
      }
    }
  }
}
