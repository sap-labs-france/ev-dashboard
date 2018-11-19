import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, OnDestroy } from '@angular/core';
import { MatDialog } from "@angular/material";
import {TranslateService} from '@ngx-translate/core';
import {ConfigService} from '../../../services/config.service';
import {CentralServerService} from '../../../services/central-server.service';
import { DetailComponentDirective } from './detail-component.directive';
import { DetailComponent } from './detail-component.component';
import { TableDef } from "../../../common.types";

@Component({
  selector: 'detail-component-container',
  template: `
              <div>
                <ng-template detail-component></ng-template>
              </div>
            `,
          
})
export class DetailComponentContainer implements OnInit, OnDestroy {
  @Input() containerId: number;
  @Input() tableDef: TableDef;
  parentRow: any;

  @ViewChild(DetailComponentDirective) detailComponentDirective: DetailComponentDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private configService: ConfigService,
              private centralServerService: CentralServerService,
              private translateService: TranslateService,
              private dialog: MatDialog
    ) {
     }

  ngOnInit() {
    this.loadComponent();
  }

  setReferenceRow(row, refTableComponent) {
    this.parentRow = row;
    this.loadComponent();
  }

  ngOnDestroy() {
  }

  loadComponent() {
    
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.tableDef.rowDetails.detailComponentName);

    let viewContainerRef = this.detailComponentDirective.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    if (this.parentRow)
      (<DetailComponent>componentRef.instance).setData(this.parentRow, this.tableDef);
    
  }

}