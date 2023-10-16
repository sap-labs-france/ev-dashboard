import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConnectorTypePipe } from 'shared/formatters/app-connector-type.pipe';
import { AppDayPipe } from 'shared/formatters/app-day.pipe';
import { CellContentTemplateDirective } from 'shared/table/cell-content-template/cell-content-template.directive';
import PricingDefinition from 'types/Pricing';

@Component({
  selector: 'app-pricing-definition-detail-cell',
  templateUrl: './pricing-definition-detail-cell.template.html',
})
export class PricingDefinitionDetailCellComponent extends CellContentTemplateDirective {
  @Input() public row!: PricingDefinition;

  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(
    private translateService: TranslateService,
    private appDayPipe: AppDayPipe,
    private appConnectorPipe: AppConnectorTypePipe
  ) {
    super();
  }

  public getConnectorText(): string {
    let connectorText;
    const connectorPowerkW = this.row?.staticRestrictions?.connectorPowerkW;
    if (this.row?.staticRestrictions?.connectorType) {
      connectorText = this.translateService.instant(
        this.appConnectorPipe.transform(this.row.staticRestrictions.connectorType, 'text')
      );
    }
    if (connectorPowerkW) {
      connectorText += ` - ${this.translateService.instant(
        'settings.pricing.connector_power'
      )}: ${connectorPowerkW} ${this.translateService.instant(
        'settings.pricing.connector_power_unit'
      )}`;
    }
    return connectorText;
  }

  public getDaysOfWeek(): string {
    const days = [];
    for (const day of this.row?.restrictions?.daysOfWeek) {
      days.push(this.appDayPipe.transform(day));
    }
    return days.join(', ');
  }

  public getTimeRestrictions(): string {
    return `${this.row.restrictions.timeFrom} - ${this.row.restrictions.timeTo}`;
  }

  public getDurationRestrictions(): string {
    let minDurationText;
    let maxDurationText;
    const minDurationValue = this.row?.restrictions?.minDurationSecs;
    const maxDurationValue = this.row?.restrictions?.maxDurationSecs;
    if (minDurationValue) {
      minDurationText = `${this.translateService.instant(
        'settings.pricing.restriction_min_duration'
      )}: ${minDurationValue / 60} ${this.translateService.instant(
        'settings.pricing.restriction_min_duration_unit'
      )}`;
    }
    if (maxDurationValue) {
      maxDurationText = `${this.translateService.instant(
        'settings.pricing.restriction_max_duration'
      )}: ${maxDurationValue / 60} ${this.translateService.instant(
        'settings.pricing.restriction_max_duration_unit'
      )}`;
    }
    if (minDurationValue && maxDurationValue) {
      return `${minDurationText} - ${maxDurationText}`;
    } else if (minDurationValue) {
      return `${minDurationText}`;
    } else {
      return `${maxDurationText}`;
    }
  }

  public getEnergyRestrictions(): string {
    let minEnergyText;
    let maxEnergyText;
    const minEnergyValue = this.row?.restrictions?.minEnergyKWh;
    const maxEnergyValue = this.row?.restrictions?.maxEnergyKWh;
    if (minEnergyValue) {
      minEnergyText = `${this.translateService.instant(
        'settings.pricing.restriction_min_energy'
      )}: ${minEnergyValue} ${this.translateService.instant(
        'settings.pricing.restriction_min_energy_unit'
      )}`;
    }
    if (maxEnergyValue) {
      maxEnergyText = `${this.translateService.instant(
        'settings.pricing.restriction_max_energy'
      )}: ${maxEnergyValue} ${this.translateService.instant(
        'settings.pricing.restriction_max_energy_unit'
      )}`;
    }
    if (minEnergyValue && maxEnergyValue) {
      return `${minEnergyText} - ${maxEnergyText}`;
    } else if (minEnergyValue) {
      return `${minEnergyText}`;
    } else {
      return `${maxEnergyText}`;
    }
  }
}
