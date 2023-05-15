import { Pipe, PipeTransform } from '@angular/core';

import { CONNECTOR_ALL_TYPES_MAP } from '../../shared/model/charging-stations.model';

export const CONNECTOR_TYPE_SELECTION_MAP = [...CONNECTOR_ALL_TYPES_MAP.values()].filter(
  (item: any) => item.key !== 'U'
);

@Pipe({ name: 'appConnectorTypeSelection' })
export class AppConnectorTypeSelectionPipe implements PipeTransform {
  public transform(type: string, target: string = 'icon'): any {
    // Return the found key
    const foundConnectorType = CONNECTOR_TYPE_SELECTION_MAP.find(
      (connectorType) => connectorType.key === type
    );
    if (target === 'icon') {
      return foundConnectorType.svgIconName;
    }
    if (target === 'text') {
      return foundConnectorType.description;
    }
  }
}
