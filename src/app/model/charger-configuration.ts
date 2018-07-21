export class ChargerConfiguration {
  chargeBoxID: String;
  timestamp: Date;
  configuration: [
    {
      value: String;
      readonly: Boolean;
      key: String;
    }
  ];
}
