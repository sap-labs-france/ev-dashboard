import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appChargerStatus]'
})
export class ChargerStatusDirective {
  @HostBinding('class.charger-connector-available') statusAvailable = false;
  @HostBinding('class.charger-connector-preparing') statusPreparing = false;
  @HostBinding('class.charger-connector-suspended-evse') statusSuspendedEVSE = false;
  @HostBinding('class.charger-connector-suspended-ev') statusSuspendedEV = false;
  @HostBinding('class.charger-connector-finishing') statusFinishing = false;
  @HostBinding('class.charger-connector-reserved') statusReserved = false;
  @HostBinding('class.charger-connector-charging') statusCharging = false;
  @HostBinding('class.charger-connector-unavailable') statusUnavailable = false;
  @HostBinding('class.charger-connector-faulted') statusFaulted = false;
  @HostBinding('class.charger-connector-active-text') statusUnknown = false;

  @Input() set appChargerStatus(status) {
    this.statusAvailable = false;
    this.statusPreparing = false;
    this.statusSuspendedEVSE = false;
    this.statusSuspendedEV = false;
    this.statusFinishing = false;
    this.statusReserved = false;
    this.statusCharging = false;
    this.statusUnavailable = false;
    this.statusFaulted = false;
    this.statusUnknown = false;

    switch (status) {
      // When a Connector becomes available for a new user (Operative)
      case 'Available':
        this.statusAvailable = true;
        break;

      // When a Connector becomes no longer available
      // for a new user but no charging session is active.
      // Typically a Connector is occupied when a user
      // presents a tag, inserts a cable or a vehicle
      // occupies the parking bay
      // (Operative)
      case 'Preparing':
        this.statusPreparing = true;
        break;

      // When the contactor of a Connector closes,
      // allowing the vehicle to charge
      // (Operative)
      case 'Occupied':
      case 'Charging':
        this.statusCharging = true;
        break;

      // When the contactor of a Connector opens upon
      // request of the EVSE, e.g. due to a smart charging
      // restriction or as the result of
      // StartTransaction.conf indicating that charging is
      // not allowed
      // (Operative)
      case 'SuspendedEVSE':
        this.statusSuspendedEVSE = true;
        break;

      // When the EVSE is ready to deliver energy but
      // contactor is open, e.g. the EV is not ready.
      case 'SuspendedEV':
        this.statusSuspendedEV = true;
        break;

      // When a charging session has stopped at a
      // Connector, but the Connector is not yet available
      // for a new user, e.g. the cable has not been
      // removed or the vehicle has not left the parking
      // bay (Operative)
      case 'Finishing':
        this.statusFinishing = true;
        break;

      // When a Connector becomes reserved as a result of
      // a Reserve Now command
      case 'Reserved':
        this.statusReserved = true;
        break;

      // When a Connector becomes unavailable as the
      // result of a Change Availability command or an
      // event upon which the Charge Point transitions to
      // unavailable at its discretion. Upon receipt of a
      // Change Availability command, the status MAY
      // change immediately or the change MAY be
      // scheduled. When scheduled, the Status
      // Notification shall be send when the availability
      // change becomes effective
      case 'Unavailable':
        this.statusUnavailable = true;
        break;

      // When a Charge Point or connector has reported
      // an error and is not available for energy delivery .
      case 'Faulted':
        this.statusFaulted = true;
        break;

      default:
        this.statusUnknown = true;
    }
  }
}
