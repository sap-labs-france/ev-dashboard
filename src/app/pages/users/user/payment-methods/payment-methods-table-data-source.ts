import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { BillingPaymentMethodsAuthorizationActions } from 'types/Authorization';
import { HTTPError } from 'types/HTTPError';

import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { SpinnerService } from '../../../../services/spinner.service';
import { WindowService } from '../../../../services/window.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { TableRefreshAction } from '../../../../shared/table/actions/table-refresh-action';
import {
  TableCreatePaymentMethodAction,
  TableCreatePaymentMethodActionDef,
} from '../../../../shared/table/actions/users/table-create-payment-method-action';
import {
  TableDeletePaymentMethodAction,
  TableDeletePaymentMethodActionDef,
} from '../../../../shared/table/actions/users/table-delete-payment-method';
import { TableDataSource } from '../../../../shared/table/table-data-source';
import { BillingButtonAction, BillingPaymentMethod } from '../../../../types/Billing';
import { BillingPaymentMethodDataResult } from '../../../../types/DataResult';
import { BillingSettings } from '../../../../types/Setting';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../../types/Table';
import { Utils } from '../../../../utils/Utils';
import { PaymentMethodStatusComponent } from './payment-method/payment-method-status.component';
import { PaymentMethodDialogComponent } from './payment-method/payment-method.dialog.component';

@Injectable()
export class PaymentMethodsTableDataSource extends TableDataSource<BillingPaymentMethod> {
  public currentUserID: string;
  public billingSettings: BillingSettings;
  private deleteAction = new TableDeletePaymentMethodAction().getActionDef();
  private createAction = new TableCreatePaymentMethodAction().getActionDef();
  private paymentsAuthorizations: BillingPaymentMethodsAuthorizationActions;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    public componentService: ComponentService,
    public windowService: WindowService,
    public activatedRoute: ActivatedRoute,
    public centralServerService: CentralServerService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private datePipe: AppDatePipe,
    private dialog: MatDialog
  ) {
    super(spinnerService, translateService);
    // Load billing settings
    this.spinnerService.show();
    this.componentService.getBillingSettings().subscribe(
      (settings) => {
        this.billingSettings = settings;
        this.spinnerService.hide();
      },
      (error) => {
        this.spinnerService.hide();
      }
    );
    this.initDataSource();
  }

  public setCurrentUserID(currentUserID: string) {
    this.currentUserID = currentUserID;
  }

  public loadDataImpl(): Observable<BillingPaymentMethodDataResult> {
    return new Observable((observer) => {
      // User provided?
      if (this.currentUserID) {
        // Yes: Get data
        this.centralServerService
          .getPaymentMethods(
            this.currentUserID,
            this.buildFilterValues(),
            this.getPaging(),
            this.getSorting()
          )
          .subscribe({
            next: (paymentMethods) => {
              // Init authorizations
              this.paymentsAuthorizations = {
                canCreate: Utils.convertToBoolean(paymentMethods.canCreate),
              };
              // Set action visibility
              this.createAction.visible = this.paymentsAuthorizations.canCreate;
              observer.next(paymentMethods);
              observer.complete();
            },
            error: (error) => {
              switch (error.status) {
                case HTTPError.MISSING_SETTINGS:
                  this.messageService.showErrorMessage('settings.billing.not_properly_set');
                  break;
                default:
                  Utils.handleHttpError(
                    error,
                    this.router,
                    this.messageService,
                    this.centralServerService,
                    'general.error_backend'
                  );
              }
              observer.error(error);
            },
          });
      } else {
        observer.next({
          count: 0,
          result: [],
        });
        observer.complete();
      }
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
    return [
      {
        id: 'status',
        name: 'general.status',
        isAngularComponent: true,
        angularComponent: PaymentMethodStatusComponent,
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
      },
      {
        id: 'default',
        name: 'general.default',
        headerClass: 'text-center col-10p',
        class: 'text-center col-10p',
        formatter: (defaultPaymentMethod: boolean, paymentMethod: BillingPaymentMethod) =>
          Utils.displayYesNo(this.translateService, paymentMethod.isDefault),
      },
      {
        id: 'type',
        name: 'settings.billing.payment_methods_type',
        headerClass: 'text-center col-10p',
        class: 'text-center col-10p capitalize',
      },
      {
        id: 'brand',
        name: 'settings.billing.payment_methods_brand',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p capitalize',
      },
      {
        id: 'last4',
        name: 'settings.billing.payment_methods_ending_with',
        headerClass: 'text-center col-10p',
        class: 'text-center col-10p',
      },
      {
        id: 'expiringOn',
        name: 'settings.billing.payment_methods_expiring_on',
        headerClass: 'text-center col-10p',
        class: 'text-center col-10p',
        formatter: (expiringOn: Date) => this.datePipe.transform(expiringOn, 'MM/YYYY'),
      },
      {
        id: 'createdOn',
        name: 'general.created_on',
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
        formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [this.createAction, ...tableActionsDef];
  }

  public buildTableDynamicRowActions(paymentMethod: BillingPaymentMethod): TableActionDef[] {
    const rowActions: TableActionDef[] = [];
    if (paymentMethod.canDelete) {
      rowActions.push(this.deleteAction);
    }
    return rowActions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case BillingButtonAction.CREATE_PAYMENT_METHOD:
        if (actionDef.id) {
          (actionDef as TableCreatePaymentMethodActionDef).action(
            // eslint-disable-next-line max-len
            PaymentMethodDialogComponent,
            this.dialog,
            {
              dialogData: {
                id: null,
                userId: this.currentUserID,
                setting: this.billingSettings,
              },
            },
            this.refreshData.bind(this)
          );
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, paymentMethod: BillingPaymentMethod) {
    switch (actionDef.id) {
      case BillingButtonAction.DELETE_PAYMENT_METHOD:
        if (actionDef.action) {
          (actionDef as TableDeletePaymentMethodActionDef).action(
            paymentMethod,
            this.currentUserID,
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
            this.refreshData.bind(this)
          );
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [new TableRefreshAction().getActionDef()];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }
}
