import {
  Directive,
  HostBinding,
  Input,
  ElementRef
} from '@angular/core';

const CLASS_STATUS_MAPS = [
  {
    status: 'Available',
    classes: {
      background: 'charger-connector-available',
      text: 'charger-connector-charging-available-text',
      'background-image': 'charger-connector-available-type-background'
    }
  },
  {
    status: 'Preparing',
    classes: {
      background: 'charger-connector-preparing',
      text: '',
      'background-image': 'charger-connector-preparing-type-background'
    }
  },
  {
    status: 'Occupied',
    classes: {
      background: 'charger-connector-charging',
      text: '',
      'background-image': 'charger-connector-charging-type-background'
    }
  },
  {
    status: 'Charging',
    classes: {
      background: 'charger-connector-charging',
      text: '',
      'background-image': 'charger-connector-charging-type-background'
    }
  },
  {
    status: 'Charging-inactive',
    classes: {
      background: 'charger-connector-charging-inactive',
      text: '',
      'background-image': 'charger-connector-charging-type-background'
    }
  },
  {
    status: 'Occupied-inactive',
    classes: {
      background: 'charger-connector-charging-inactive',
      text: '',
      'background-image': 'charger-connector-charging-type-background'
    }
  },
  {
    status: 'Charging-active',
    classes: {
      background: 'charger-connector-charging-active charger-connector-background-spinner',
      text: 'charger-connector-charging-active-text',
      'background-image': 'charger-connector-charging-type-background'
    }
  },
  {
    status: 'Occupied-active',
    classes: {
      background: 'charger-connector-charging-active charger-connector-background-spinner',
      text: 'charger-connector-charging-active-text',
      'background-image': 'charger-connector-charging-type-background'
    }
  },
  {
    status: 'SuspendedEVSE',
    classes: {
      background: 'charger-connector-suspended-evse',
      text: '',
      'background-image': 'charger-connector-suspended-evse-type-background'
    }
  },
  {
    status: 'SuspendedEV',
    classes: {
      background: 'charger-connector-suspended-ev',
      text: '',
      'background-image': 'charger-connector-suspended-ev-type-background'
    }
  },
  {
    status: 'Finishing',
    classes: {
      background: 'charger-connector-finishing',
      text: '',
      'background-image': 'charger-connector-finishing-type-background'
    }
  },
  {
    status: 'Reserved',
    classes: {
      background: 'charger-connector-reserved',
      text: '',
      'background-image': 'charger-connector-reserved-type-background'
    }
  },
  {
    status: 'Unavailable',
    classes: {
      background: 'charger-connector-unavailable',
      text: '',
      'background-image': 'charger-connector-unavailable-type-background'
    }
  },
  {
    status: 'Faulted',
    classes: {
      background: 'charger-connector-faulted',
      text: '',
      'background-image': 'charger-connector-faulted-type-background'
    }
  },
  {
    status: 'Unknown',
    classes: {
      background: 'charger-connector-unknown',
      text: '',
      'background-image': 'charger-connector-unknown-type-background'
    }
  }
]
@Directive({
  selector: '[appChargerStatus]'
})
export class ChargerStatusDirective {

  @Input() set appChargerStatus(input) {
    let classes = CLASS_STATUS_MAPS.find((statusClass) => input.status === statusClass.status);
    if (!classes) {
      classes = CLASS_STATUS_MAPS.find((statusClass) => 'Unknown' === statusClass.status);
    }
    this._el.nativeElement.className += ' ' + classes.classes[input.target];
  }

  constructor(private _el: ElementRef) {
  }

}
