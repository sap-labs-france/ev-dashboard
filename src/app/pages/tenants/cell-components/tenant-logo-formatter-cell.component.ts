import { Component, Input } from '@angular/core';
import { Constants } from 'utils/Constants';

import { CellContentTemplateDirective } from '../../../shared/table/cell-content-template/cell-content-template.directive';
import { Tenant } from '../../../types/Tenant';

@Component({
  template: `
    <div class="logo-container">
      <img class="app-tenants-logo" [src]="row['logo'] ? row['logo'] : noImage" alt="">
    </div>
  `,
})

export class TenantLogoFormatterCellComponent extends CellContentTemplateDirective {
  @Input() public row!: Tenant;
  public noImage = Constants.NO_IMAGE;
}
