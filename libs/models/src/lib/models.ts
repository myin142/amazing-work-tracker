export interface WorkTime {
  timeFrom: Date;
  timeTo: Date;
  breakFrom?: Date;
  breakTo?: Date;
  projectId?: number;
}

export interface WorkDay {
  workTimes: WorkTime[];
  sickLeave: boolean;
  homeoffice: boolean;
}

export enum FullDayType {
  VACATION = 'Vacation',
  SICK = 'Sick',
  OFF_DUTY = 'Off-Duty',
}
