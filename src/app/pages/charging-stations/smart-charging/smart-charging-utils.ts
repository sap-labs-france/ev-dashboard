import {ChargingStations} from 'app/utils/ChargingStations';

export class SmartChargingUtils {
    /**
    *
    * Return the value in th eexpected display format
    * All values are displayed in kW
    * @param {*} value : value to convert
    * @param {*} valueUnit : unit (W, kW, A) of the value
    */
   // tslint:disable-next-line:max-line-length
   static getDisplayedFormatValue(value, valueUnit, displayUnit, powerDigitPrecision, powerFloatingPrecision, numberOfConnectedPhase, appUnitFormatter) {
     switch (valueUnit) {
       case 'W':
         return appUnitFormatter.transform(value, valueUnit, displayUnit, false, powerDigitPrecision, powerFloatingPrecision);
         break;
       case 'kW':
         return appUnitFormatter.transform(value, valueUnit, displayUnit, false, powerDigitPrecision, powerFloatingPrecision);
         break;
       case 'A':
         // tslint:disable-next-line:max-line-length
         return appUnitFormatter.transform(ChargingStations.convertAmpToW(numberOfConnectedPhase, value), 'W', displayUnit, false, powerDigitPrecision, powerFloatingPrecision);
         break;
     }
   }

   /**
    * Return a value formatted to internal format which is W
    *
    * @param {*} value
    * @param {*} valueUnit
    * @returns
    */
   static getInternalFormatValue(value, valueUnit, numberOfConnectedPhase) {
     switch (valueUnit) {
       case 'W':
         return value;
         break;
       case 'kW':
         return value * 1000;
         break;
       case 'A':
         return ChargingStations.convertAmpToW(numberOfConnectedPhase, value);
         break;
     }
   }
}
