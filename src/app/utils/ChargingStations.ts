import * as moment from 'moment';
import { Charger, KeyValue } from 'app/common.types';

export class ChargingStations {
  // Compute
  public static computeSiteConsumption(chargingStations) {
    // Init
    const siteConsumption = {
      siteCurrentConsumptionKW: 0,
      siteMaxConsumptionKW: 0,
      siteCurrentConsumptionPercent: 0
    };
    // Check
    if (chargingStations) {
      // Loop over retrieved chargers
      chargingStations.forEach(chargingStation => {
        // Loop over the connectors
        chargingStation.connectors.forEach((connector) => {
          // Connector Exists
          if (connector) {
            // Power provider?
            if (connector.power) {
              // Init
              siteConsumption.siteCurrentConsumptionKW += connector.currentConsumption / 1000;
              siteConsumption.siteMaxConsumptionKW += connector.power / 1000;
              siteConsumption.siteCurrentConsumptionPercent =
                (siteConsumption.siteCurrentConsumptionKW * 100) / siteConsumption.siteMaxConsumptionKW;
            }
          }
        });
      });
    }
    return siteConsumption;
  }

  public static computeSiteConsumptionFromTransactions(transactions) {
    // Build chargers from transactions
    const chargers = [];
    // Check
    if (transactions) {
      // Build Chargers
      transactions.forEach((transaction) => {
        // Check
        if (transaction.chargeBox) {
          // Add?
          const foundChargers = chargers.filter((charger) => {
            // Check
            if (charger.id === transaction.chargeBox.id) {
              return true;
            }
            return false;
          });
          // Found
          if (foundChargers.length === 0) {
            // Add chargers
            chargers.push(transaction.chargeBox);
          }
        }
      });
    }
    // Compute
    return ChargingStations.computeSiteConsumption(chargers);
  }

  // Format
  public static formatDateTimeDurationString(transaction, i18nHourShort) {
    // Build date
    let dateTimeString = moment(transaction.timestamp).format('MMM, D - H:mm:ss') + ' > ';
    let timeDiffDuration;

    // Format Duration
    if (transaction.stop) {
      // Check if > 1 day
      if (moment(transaction.stop.timestamp).dayOfYear().valueOf() !==
        moment(transaction.timestamp).dayOfYear().valueOf()) {
        // Display full date/time in stop
        dateTimeString += moment(transaction.stop.timestamp).format('MMM, D - H:mm:ss');
      } else {
        // Display only end time
        dateTimeString += moment(transaction.stop.timestamp).format('H:mm:ss');
      }
      // Compute duration from stop transaction
      timeDiffDuration = moment.duration(
        moment(transaction.stop.timestamp).diff(
          moment(transaction.timestamp)
        )
      );
    } else {
      dateTimeString += '...';
      // Compute duration from now
      timeDiffDuration = moment.duration(
        moment().diff(
          moment(transaction.timestamp)
        )
      );
    }
    // Set duration
    dateTimeString += ' (';
    const mins = Math.floor(timeDiffDuration.minutes());
    const secs = Math.floor(timeDiffDuration.seconds());
    // Set duration
    dateTimeString +=
      Math.floor(timeDiffDuration.asHours()).toString() + i18nHourShort +
      (mins < 10 ? '0' + mins : mins.toString()) + ':' +
      (secs < 10 ? '0' + secs : secs.toString());
    // End
    dateTimeString += ')';
    return dateTimeString;
  }

  // Format
  public static formatCurrentTotalConsumptionString(transaction, i18nKW, i18nKWH) {
    const connector = transaction.chargeBox.connectors[transaction.connectorId - 1];
    // Current Consumption
    let consumptionString = '';
    // Get consumtion
    let totalConsumption;
    if (transaction.stop) {
      totalConsumption = transaction.stop.totalConsumption;
      // Show Total Consumption
      consumptionString += (totalConsumption / 1000).toLocaleString(
        navigator.language, {minimumIntegerDigits: 1, minimumFractionDigits: 0, maximumFractionDigits: 2}) +
        ' ' + i18nKWH;
    } else if (connector) {
      totalConsumption = connector.totalConsumption;
      // Show Current Consumption
      consumptionString = (connector.currentConsumption / 1000).toLocaleString(
        navigator.language, {minimumIntegerDigits: 1, minimumFractionDigits: 0, maximumFractionDigits: 2}) +
        ' ' + i18nKW;
      // Set
      consumptionString += ' (' + (totalConsumption / 1000).toLocaleString(
        navigator.language, {minimumIntegerDigits: 1, minimumFractionDigits: 0, maximumFractionDigits: 2}) +
        ' ' + i18nKWH + ')';
    }
    return consumptionString;
  }

  public static getConnectorLetterFromID(connectorID) {
    // Max 4 letters
    switch (parseInt(connectorID, 10)) {
      case 1:
        return 'A';
      case 2:
        return 'B';
      case 3:
        return 'C';
      case 4:
        return 'D';
      default:
        return connectorID;
    }
  }

  public static convertAmpToW(numberOfConnectedPhase, maxIntensityInAmper) {
    // Compute it
    if (numberOfConnectedPhase === 0 ) {
      return Math.floor(400 * maxIntensityInAmper * Math.sqrt(3));
    } else if (numberOfConnectedPhase === 3 ) {
      return Math.floor(400 * maxIntensityInAmper * Math.sqrt(3));
    } else {
      return Math.floor(230 * maxIntensityInAmper);
    }
  }

  public static convertWToAmp(numberOfConnectedPhase, maxIntensityInW) {
    // Compute it
    if (numberOfConnectedPhase === 0) {
      return Math.round(maxIntensityInW / (400 * Math.sqrt(3)));
    } else if ( numberOfConnectedPhase === 3) {
      return Math.round(maxIntensityInW / (400 * Math.sqrt(3)));
    } else {
      return Math.round(maxIntensityInW / 230);
    }
  }

  public static provideLimit(charger: Charger, value: number) {
    // Test purpose as it seems that schneider needs to have the power value for each connector
    if (charger.chargePointVendor === 'Schneider Electric' && charger.chargePointModel === 'MONOBLOCK') {
      return Math.round(value / 2);
    } else {
      return value;
    }
  }

  public static getListOfMissingSettings(charger: Charger) {
    return MANDATORY_SETTINGS_LIST.filter((mandatorySetting) => {
      if (mandatorySetting.key.startsWith('connectors.')) {
        for (const connector of charger.connectors) {
          return !mandatorySetting.isOK(connector[mandatorySetting.key.replace('connectors.', '')]);
        }
      } else {
        return (!mandatorySetting.isOK(charger[mandatorySetting.key]));
      }
    });
  }
}

export const MANDATORY_SETTINGS_LIST = [
  {key: 'maximumPower', value: 'chargers.maximum_energy', isOK: (value) => {
    return value && value > 0;
  } },
  {key: 'chargePointModel', value: 'chargers.model', isOK: (value) => {
    return value && value.length > 0;
  }},
  {key: 'chargePointVendor', value: 'chargers.vendor', isOK: (value) => {
    return value && value.length > 0;
  }},
  {key: 'numberOfConnectedPhase', value: 'chargers.nb_connected_phase', isOK: (value) => {
    return value && value > 0;
  }},
  {key: 'powerLimitUnit', value: 'chargers.power_limit_unit', isOK: (value) => {
    return value && (value === 'A' || value === 'W');
  }},
  {key: 'chargingStationURL', value: 'chargers.charger_url', isOK: (value) => {
    return value && value.length > 0;
  }},
  {key: 'cannotChargeInParallel', value: 'chargers.cant_charge_in_parallel', isOK: (value) => {
    return true;
  }},
  {key: 'connectors.type', value: 'chargers.connector_type', isOK: (value) => {
    return value && value.length > 0;
  }},
  {key: 'connectors.power', value: 'chargers.connector_max_power', isOK: (value) => {
    return value && value > 0;
  }}
];
