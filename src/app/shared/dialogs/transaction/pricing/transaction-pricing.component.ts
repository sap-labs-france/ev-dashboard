import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { WindowService } from '../../../../services/window.service';
import { AbstractTabComponent } from '../../../../shared/component/abstract-tab/abstract-tab.component';
import PricingDefinition, { ResolvedPricingModel } from '../../../../types/Pricing';
import { Transaction } from '../../../../types/Transaction';

@Component({
  selector: 'app-transaction-pricing',
  templateUrl: 'transaction-pricing.component.html',
  styleUrls: ['transaction-pricing.component.scss'],
})
export class TransactionPricingComponent extends AbstractTabComponent implements OnChanges {
  @Input() public transaction: Transaction;

  public pricingDefinitions: PricingDefinition[];

  public constructor(
    protected activatedRoute: ActivatedRoute,
    protected windowService: WindowService
  ) {
    super(activatedRoute, windowService, ['main', 'pricing'], false);
  }

  public ngOnChanges(): void {
    if (this.transaction) {
      this.pricingDefinitions = this.shrinkPricingData(this.transaction.pricingModel);
    }
  }

  private shrinkPricingData(pricingModel: ResolvedPricingModel): PricingDefinition[] {
    const pricingDefinitions: PricingDefinition[] = pricingModel.pricingDefinitions.filter(
      (pricingDefinition) => {
        if (
          pricingDefinition.dimensions?.flatFee?.pricedData ||
          pricingDefinition.dimensions?.energy?.pricedData ||
          pricingDefinition.dimensions?.chargingTime?.pricedData ||
          pricingDefinition.dimensions?.parkingTime?.pricedData
        ) {
          return pricingDefinition;
        }
      }
    );
    return pricingDefinitions;
  }
}
