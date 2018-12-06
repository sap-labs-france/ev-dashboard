import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appChargerStatusText]'
})
export class ChargerStatusTextDirective {
  @HostBinding('class.charger-connector-text') statusDefault = false;
  @HostBinding('class.charger-connector-active-text') statusActive = false;

  @Input() set appChargerStatusText(status) {
    this.statusActive = false;
    this.statusDefault = false;

    switch (status) {
      case 'Reserved':
      case 'Available': {
        this.statusDefault = true;
        break;
      }
      case 'Finishing':
      case 'Preparing':
      case 'SuspendedEVSE':
      case 'SuspendedEV':
      case 'Charging':
      case 'Occupied':
      case 'Unavailable':
      case 'Faulted':
      default: {
        this.statusActive = true;
      }
    }
  }
}
