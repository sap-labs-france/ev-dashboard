import {Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy, Output, EventEmitter} from '@angular/core';
import { MatDialog } from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {ConfigService} from '../../../services/config.service';
import {CentralServerService} from '../../../services/central-server.service';
import { DetailComponentDirective } from './detail-component.directive';
import { DetailComponent } from './detail-component.component';
import { TableDef } from '../../../common.types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detail-component-container',
  template: `<ng-template appDetailComponent></ng-template>`,
})
// tslint:disable-next-line:component-class-suffix
export class DetailComponentContainer implements OnInit, OnDestroy {
  @Input() tableDef: TableDef;
  @Input() parentRow: any;
  detailComponent: DetailComponent;

  @ViewChild(DetailComponentDirective) detailComponentDirective: DetailComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private configService: ConfigService,
              private centralServerService: CentralServerService,
              private translateService: TranslateService,
              private dialog: MatDialog
    ) {
     }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.destroy();
  }

  loadComponent() {

    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.tableDef.rowDetails.detailComponentName);

    const viewContainerRef = this.detailComponentDirective.viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(componentFactory);
    this.detailComponent = <DetailComponent>componentRef.instance;
    if (this.parentRow) {
      this.detailComponent.setData(this.parentRow, this.tableDef);
    }

  }

  refresh(row: any, autoRefresh: boolean) {
    if (this.detailComponent) {
      this.detailComponent.refresh(row, autoRefresh);
    } else {
      this.loadComponent();
    }
  }

  destroy() {
    if (this.detailComponent) {
      this.detailComponent.destroy();
    }
  }

}
