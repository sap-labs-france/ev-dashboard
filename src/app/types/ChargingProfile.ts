export interface ScheduleSlot {
  start: Date;
  end: Date;
  limit: number;
}

export interface ConnectorSchedule {
  connectorId: number;
  slots: ScheduleSlot[];
}

