import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

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
import { PricingDefinitionDialogComponent } from './pricing-definition/pricing-definition.dialog.component';

@Injectable()
export class PricingDefinitionsTableDataSource extends DialogTableDataSource<PricingDefinition> {
  private createAction = new TableCreatePricingDefinitionAction().getActionDef();
  private editAction = new TableEditPricingDefinitionAction().getActionDef();
  private deleteAction = new TableDeletePricingDefinitionAction().getActionDef();
  private context = {
    entityID: '',
    entityType: '',
    entityName: ''
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

  public setContext(entityID: string, entityType: string, entityName: string = null) {
    if (!entityType) {
      this.context.entityID = this.centralServerService.getLoggedUser().tenantID;
      this.context.entityType = PricingEntity.TENANT;
    } else {
      this.context.entityID = entityID;
      this.context.entityType = entityType;
    }
    this.context.entityName = entityName;
  }

  public isContextSet() {
    return !!(this.context.entityType);
  }

  public loadDataImpl(): Observable<DataResult<PricingDefinition>> {
    return new Observable((observer) => {
      // Get the PricingDefinitions
      this.centralServerService.getPricingDefinitions(this.buildFilterValues(),
        this.getPaging(), this.getSorting(), this.context).subscribe((pricingDefinition) => {
        this.createAction.visible = pricingDefinition.canCreate;
        observer.next(pricingDefinition);
        observer.complete();
      }, (error) => {
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
        observer.error(error);
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
    const columns: TableColumnDef[] = [
      {
        id: 'name',
        name: 'chargers.name',
        headerClass: 'd-none d-xl-table-cell col-30p',
        class: 'd-none d-xl-table-cell col-30p',
        sortable: true,
      },
      {
        id: 'staticRestrictions.validFrom',
        name: 'settings.pricing.valid_from',
        formatter: (validFrom: Date) => this.datePipe.transform(validFrom, 'shortDate'),
        headerClass: 'd-none d-xl-table-cell col-30p',
        class: 'd-none d-xl-table-cell col-30p',
        sortable: true,
      },
      {
        id: 'staticRestrictions.validTo',
        name: 'settings.pricing.valid_to',
        formatter: (validTo: Date) => this.datePipe.transform(validTo, 'shortDate'),
        headerClass: 'col-15p',
        class: 'd-none d-xl-table-cell col-30p',
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
      },
    ];
    return columns;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      this.createAction,
      ...tableActionsDef,
    ];
  }

  public buildTableDynamicRowActions(pricingDefinition: PricingDefinition): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    if (pricingDefinition.canUpdate) {
      rowActions.push(this.editAction);
    }
    if (pricingDefinition.canDelete) {
      rowActions.push(this.deleteAction);
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
}
