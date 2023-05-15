import { Component, Input } from '@angular/core';
import { Asset, AssetType } from 'types/Asset';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';

@Component({
  template: `
    <span>
      <ng-container>
        <span class="ms-1">
          {{
            row.currentInstantWatts || row.currentInstantWatts === 0
              ? ((row.assetType === assetTypeProduction
                  ? row.currentInstantWatts * -1
                  : row.currentInstantWatts
                ) | appUnit : 'W' : 'kW')
              : '-'
          }}
        </span>
      </ng-container>
    </span>
  `,
})
export class AssetConsumptionCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Asset;
  public assetTypeProduction = AssetType.PRODUCTION;
}
