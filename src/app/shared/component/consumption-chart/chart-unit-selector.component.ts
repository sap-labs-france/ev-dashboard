import { Component, EventEmitter, Output } from '@angular/core';

import { ConsumptionUnit } from '../../../types/Transaction';

export interface UnitButtonGroup {
  key: string;
  description: string;
  inactive: boolean;
}

@Component({
  selector: 'app-chart-unit-selector',
  templateUrl: 'chart-unit-selector.component.html',
})
export class ChartUnitSelectorComponent {
  @Output() public unitChanged = new EventEmitter();

  public unitMap: UnitButtonGroup[] = [
    {
      key: ConsumptionUnit.KILOWATT,
      description: 'transactions.graph.unit_kilowatts',
      inactive: false,
    },
    {
      key: ConsumptionUnit.AMPERE,
      description: 'transactions.graph.unit_amperage',
      inactive: false,
    },
  ];

  public activeUnitButtonGroup: UnitButtonGroup = this.unitMap[0];

  public buttonUnitChanged(key: ConsumptionUnit) {
    const index = this.unitMap.findIndex((element) => element.key === key);
    if (
      index >= 0 &&
      this.activeUnitButtonGroup.key !== key &&
      this.unitMap[index].inactive === false
    ) {
      this.activeUnitButtonGroup = this.unitMap[index];
    }
    this.unitChanged.emit(key);
  }
}
