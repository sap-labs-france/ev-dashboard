import { Pipe, PipeTransform } from '@angular/core';

import { CONNECTOR_ALL_TYPES_MAP } from '../../shared/model/charging-stations.model';
import { Constants } from '../../utils/Constants';

export const CONNECTOR_TYPE_MAP = [...CONNECTOR_ALL_TYPES_MAP.values()].filter(
  (type: any) => type.key !== Constants.SELECT_ALL
);

@Pipe({ name: 'appConnectorType' })
export class AppConnectorTypePipe implements PipeTransform {
  public transform(type: string, target: string = 'icon'): any {
    // Return the found key
    const foundConnectorType = CONNECTOR_TYPE_MAP.find(
      (connectorType) => connectorType.key === type
    );
    if (target === 'icon') {
      return foundConnectorType ? foundConnectorType.svgIconName : 'U';
    }
    if (target === 'text') {
      return foundConnectorType
        ? foundConnectorType.description
        : 'chargers.connector_type_unknown';
    }
  }
}
