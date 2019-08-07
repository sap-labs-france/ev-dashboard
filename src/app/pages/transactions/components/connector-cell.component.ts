import { Component, Injectable, Input, Pipe, PipeTransform } from '@angular/core';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  selector: 'app-charging-stations-connector-cell',
  template: `
    <!-- Connector ID -->
    <div class="d-flex justify-content-center">
      <div class="row mx-0 px-0 align-items-center">
        <div appTooltip data-toogle="tooltip" data-offset="0px, 8px" data-placement="bottom"
            [title]="row.currentConsumption | appFormatConnector:'text' | translate"
            class="charger-connector-container">
          <div [class]="row.currentConsumption | appFormatConnector:'class'">
            {{row.connectorId | appConnectorId}}
          </div>
        </div>
      </div>
    </div>
  `
})
@Injectable()
export class ChargingStationsConnectorCellComponent extends CellContentTemplateComponent {
  @Input() row: any;
}

@Pipe({name: 'appFormatConnector'})
export class AppFormatConnector implements PipeTransform {
  transform(currentConsumption: number, type: string): string {
    if (type === 'class') {
      return this.buildConnectorClasses(currentConsumption);
    }
    if (type === 'text') {
      return this.buildConnectorText(currentConsumption);
    }
  }

  buildConnectorClasses(currentConsumption: number): string {
    let classNames = 'charger-connector-background charger-connector-text ';
    // Check if charging
    if (currentConsumption > 0) {
      classNames += 'charger-connector-charging-active charger-connector-background-spinner charger-connector-charging-active-text';
    } else {
      classNames += 'charger-connector-charging';
    }
    return classNames;
  }

  buildConnectorText(currentConsumption: number): string {
    if (currentConsumption > 0) {
      return `chargers.status_charging`;
    } else {
      return `chargers.status_suspendedev`;
    }
  }
}
