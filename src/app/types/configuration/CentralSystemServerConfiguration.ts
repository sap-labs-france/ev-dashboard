export default interface CentralSystemServerConfiguration {
  protocol: string;
  host: string;
  port: number;
  pollIntervalSecs?: number;
  logoutOnConnectionError?: boolean;
}
