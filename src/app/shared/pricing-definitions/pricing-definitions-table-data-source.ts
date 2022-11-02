import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { TablePricingOverviewAction } from 'shared/table/actions/pricing/table-pricing-overview-action';
import { TableViewAction } from 'shared/table/actions/table-view-action';
import { TableViewPricingDefinitionsActionDef } from 'shared/table/actions/table-view-pricing-definitions-action';
import { DialogMode } from 'types/Authorization';
import { ButtonAction } from 'types/GlobalType';

import { CentralServerService } from '../../services/central-server.service';
import { DialogService } from '../../services/dialog.service';
import { MessageService } from '../../services/message.service';
import { SpinnerService } from '../../services/spinner.service';
import { DialogTableDataSource } from '../../shared/dialogs/dialog-table-data-source';
import { DataResult } from '../../types/DataResult';
import PricingDefinition, { PricingButtonAction, PricingEntity } from '../../types/Pricing';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../types/Table';
import { Utils } from '../../utils/Utils';
import { AppDatePipe } from '../formatters/app-date.pipe';
import { AppPricingDimensionsPrice } from '../formatters/app-pricing-dimensions.price.pipe';
import { TableEditPricingDefinitionAction, TableEditPricingDefinitionActionDef } from '../table/actions/charging-stations/table-edit-pricing-definition-action';
import { TableAutoRefreshAction } from '../table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../table/actions/table-refresh-action';
import { TableCreatePricingDefinitionAction, TableCreatePricingDefinitionActionDef } from '../table/actions/users/table-create-pricing-definition-action';
import { TableDeletePricingDefinitionAction, TableDeletePricingDefinitionActionDef } from '../table/actions/users/table-delete-pricing-definition';
import { PricingDefinitionDetailCellComponent } from './pricing-definition/cell-components/pricing-defintion-detail-cell-component.component';
import { PricingDefinitionDialogComponent } from './pricing-definition/pricing-definition.dialog.component';

@Injectable()
export class PricingDefinitionsTableDataSource extends DialogTableDataSource<PricingDefinition> {
  private viewingAllComponents = false;
  private viewAllAction = new TablePricingOverviewAction(this.viewingAllComponents).getActionDef();
  private createAction = new TableCreatePricingDefinitionAction().getActionDef();
  private editAction = new TableEditPricingDefinitionAction().getActionDef();
  private deleteAction = new TableDeletePricingDefinitionAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();
  private defaultContext = {
    entityID: null,
    entityType: null,
    entityName: null
  };
  private context = {
    entityID: null,
    entityType: null,
    entityName: null
  };

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe,
    private appPricingDimensionsPrice: AppPricingDimensionsPrice) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public setDefaultContext(entityID: string = null, entityType: string = null, entityName: string = null) {
    if(!entityID) {
      this.context.entityID = this.defaultContext.entityID = this.centralServerService.getLoggedUser().tenantID;
      this.context.entityType = this.defaultContext.entityType = PricingEntity.TENANT;
    } else {
      this.context.entityID = this.defaultContext.entityID = entityID;
      this.context.entityType = this.defaultContext.entityType = entityType;
    }
    this.context.entityName = this.defaultContext.entityName = entityName;
    // Rebuild the table as the number of columns changed
    this.initDataSource(true);
  }

  public isContextSet() {
    return !!(this.context.entityType);
  }

  public loadDataImpl(): Observable<DataResult<PricingDefinition>> {
    return new Observable((observer) => {
      // Get the PricingDefinitions
      this.centralServerService.getPricingDefinitions(this.buildFilterValues(), this.getPaging(), this.getSorting(), this.context).subscribe({
        next: (pricingDefinition) => {
          this.createAction.visible = pricingDefinition.canCreate;
          observer.next(pricingDefinition);
          observer.complete();
        },
        error: (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          observer.error(error);
        }
      });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: false,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableActions: TableColumnDef[] = [
      {
        id: 'name',
        name: 'chargers.name',
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true,
      }
    ];
    if (this.viewingAllComponents) {
      tableActions.push(...[
        {
          id: 'entityType',
          name: 'transactions.dialog.session.pricing-detail-entity-type',
          headerClass: 'col-15p',
          class: 'col-15p',
        },
        {
          id: 'entityName',
          name: 'transactions.dialog.session.pricing-detail-entity-name',
          headerClass: 'col-15p',
          class: 'col-15p',
        }
      ]);
    }
    tableActions.push(...[
      {
        id: 'id',
        name: 'settings.pricing.restrictions_title',
        headerClass: 'text-center',
        class: 'text-center table-cell-angular-big-component',
        isAngularComponent: true,
        angularComponent: PricingDefinitionDetailCellComponent,
      },
      {
        id: 'staticRestrictions.validFrom',
        name: 'settings.pricing.valid_from',
        formatter: (validFrom: Date) => this.datePipe.transform(validFrom),
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true,
      },
      {
        id: 'staticRestrictions.validTo',
        name: 'settings.pricing.valid_to',
        formatter: (validTo: Date) => this.datePipe.transform(validTo),
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true,
      },
      {
        id: 'dimensions.flatFee.price',
        name: 'settings.pricing.flat_fee',
        formatter: (price: number) => this.appPricingDimensionsPrice.transform('flat_fee_formatted_price', price),
        headerClass: 'col-15p',
        class: 'col-15p',
      },
      {
        id: 'dimensions.energy.price',
        name: 'settings.pricing.energy',
        formatter: (price: number) => this.appPricingDimensionsPrice.transform('energy_formatted_price', price),
        headerClass: 'col-15p',
        class: 'col-15p',
      },
      {
        id: 'dimensions.chargingTime.price',
        name: 'settings.pricing.charging_time',
        formatter: (price: number) => this.appPricingDimensionsPrice.transform('charging_time_formatted_price', price),
        headerClass: 'col-15p',
        class: 'col-15p',
      },
      {
        id: 'dimensions.parkingTime.price',
        name: 'settings.pricing.parking_time',
        formatter: (price: number) => this.appPricingDimensionsPrice.transform('parking_time_formatted_price', price),
        headerClass: 'col-15p',
        class: 'col-15p',
      }
    ]);
    return tableActions;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    const actions: TableActionDef[] = [
      this.createAction,
    ];
    if (this.defaultContext.entityType === PricingEntity.TENANT) {
      actions.push(this.viewAllAction);
    }
    actions.push(...tableActionsDef);
    return actions;
  }

  public buildTableDynamicRowActions(pricingDefinition: PricingDefinition): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    if (pricingDefinition.canUpdate && !this.viewingAllComponents) {
      rowActions.push(this.editAction);
    }
    if (pricingDefinition.canDelete && !this.viewingAllComponents) {
      rowActions.push(this.deleteAction);
    }
    if (this.viewingAllComponents) {
      rowActions.push(this.viewAction);
    }
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case PricingButtonAction.CREATE_PRICING_DEFINITION:
        if (actionDef.id) {
          (actionDef as TableCreatePricingDefinitionActionDef).action(PricingDefinitionDialogComponent,
            this.dialog,
            { dialogData: { id: null, context: this.context } }, this.refreshData.bind(this));
        }
        break;
      case ButtonAction.OVERVIEW:
        if (actionDef.id) {
          actionDef.currentValue = !actionDef.currentValue;
          this.viewingAllComponents = actionDef.currentValue;
          if(this.viewingAllComponents) {
            // Disable the create button
            this.createAction.disabled = true;
            // Make network request call to fetch all items
            this.setContext(null, null, null);
            this.refreshData().subscribe();
            // Set row action triggered only to view
          } else {
            // Enable the create button
            this.createAction.disabled = false;
            // Make current default tenant based network request
            this.setContext(this.defaultContext.entityID, this.defaultContext.entityType, this.defaultContext.entityName);
            this.refreshData().subscribe();
            // Set row action triggered to edit and delete
          }
        }
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, pricingDefinition: PricingDefinition) {
    switch (actionDef.id) {
      case PricingButtonAction.EDIT_PRICING_DEFINITION:
        if (actionDef.action) {
          (actionDef as TableEditPricingDefinitionActionDef).action(
            PricingDefinitionDialogComponent, this.dialog,
            { dialogData: { ...pricingDefinition, context: this.context } }, this.refreshData.bind(this));
        }
        break;
      case ButtonAction.VIEW:
        if (actionDef.action) {
          (actionDef as TableViewPricingDefinitionsActionDef).action(
            PricingDefinitionDialogComponent, this.dialog,
            { dialogData: { ...pricingDefinition, context: this.context }, dialogMode: DialogMode.VIEW }, this.refreshData.bind(this));
        }
        break;
      case PricingButtonAction.DELETE_PRICING_DEFINITION:
        if (actionDef.action) {
          (actionDef as TableDeletePricingDefinitionActionDef).action(
            pricingDefinition, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private setContext(entityID: string = null, entityType: string = null, entityName: string = null) {
    this.context.entityID = entityID;
    this.context.entityType = entityType;
    this.context.entityName = entityName;
    // Force a table refresh
    this.initDataSource(true);
  }
}
