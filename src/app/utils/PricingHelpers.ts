import { Utils } from './Utils';

export class PricingHelpers {
  public static toMinutes( value: number ): number {
    if ( Utils.isNullOrUndefined(value) ) {
      return value; // do not change the actual value
    }
    return value / 60;
  }

  public static  toSeconds( value: number ): number {
    if ( Utils.isNullOrUndefined(value) ) {
      return value; // do not change the actual value
    }
    return value * 60;
  }

  public static convertDurationToSeconds( enabled: boolean, value: number): number {
    return (enabled)? PricingHelpers.toSeconds(value): null;
  }
}
