export default interface CentralSystemServerConfiguration {
  protocol: string;
  host: string;
  port: number;
  pollEnable?: boolean;
  pollIntervalSecs?: number;
  socketIOEnabled: boolean;
}
