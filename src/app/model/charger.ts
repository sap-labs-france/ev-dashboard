export class Connector {
  connectorId: Number;
  errorCode: String;
  currentConsumption: Number;
  totalConsumption: Number;
  power: Number;
  status: String;
  activeForUser: boolean;
  activeTransactionID: Number;
}

export class Charger {
  id: String;
  chargePointVendor: String;
  chargePointModel: String;
  chargePointSerialNumber: String;
  chargeBoxSerialNumber: String;
  firmwareVersion: String;
  iccid: String;
  imsi: String;
  lastReboot: Date;
  meterType: String;
  meterSerialNumber: String;
  endpoint: String;
  ocppVersion: String;
  lastHeartBeat: Date;
  lastHeartBeatChanged: boolean;
  inactive: boolean;
  chargingStationURL: string;
  numberOfConnectedPhase: Number;
  connectors: Connector[];
}
