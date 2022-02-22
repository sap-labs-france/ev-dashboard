import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import PricingDefinition, { ResolvedPricingModel } from 'types/Pricing';
import { Transaction } from 'types/Transaction';

@Component({
  selector: 'app-transaction-pricing',
  templateUrl: 'transaction-pricing.component.html'
})
export class TransactionPricingComponent implements OnInit, OnChanges {
  @Input() public transaction: Transaction;

  public pricingDefinitions: PricingDefinition[];

  // eslint-disable-next-line no-useless-constructor
  public constructor() {
  }

  public ngOnInit() {
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (this.transaction) {
      this.pricingDefinitions = this.shrinkPricingData(this.transaction.pricingModel);
    }
  }

  private shrinkPricingData(pricingModel: ResolvedPricingModel): PricingDefinition[] {
    const pricingDefinitions: PricingDefinition[] = pricingModel.pricingDefinitions.filter((pricingDefinition) => {
      if ( pricingDefinition.dimensions?.flatFee?.pricedData
        || pricingDefinition.dimensions?.energy?.pricedData
        || pricingDefinition.dimensions?.chargingTime?.pricedData
        || pricingDefinition.dimensions?.parkingTime?.pricedData) {
        return pricingDefinition;
      }
    });
    return pricingDefinitions;
  }
}
