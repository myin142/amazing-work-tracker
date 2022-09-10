import { format, parse } from 'date-fns';
import { OffDutyReasonEnum } from '@myin/openapi';

export interface WorkTime {
  timeFrom: string;
  timeTo: string;
  breakFrom?: string;
  breakTo?: string;
  projectId: number;
}

export interface WorkDay {
  date: Date;
  workTimes: WorkTime[];
  sickLeave?: boolean;
  homeoffice?: boolean;
  vacation?: boolean;
  offDuty?: OffDutyReasonEnum;
}

export enum FullDayType {
  VACATION = 'Vacation',
  SICK = 'Sick',
  OFF_DUTY = 'Off-Duty',
}

export interface Project {
  id: number;
  name: string;
}

export function formatTime(date: Date | number) {
  return format(date, 'HH:mm');
}

export function parseTime(timeStr?: string) {
  if (!timeStr) return new Date();
  return parse(timeStr, 'HH:mm', new Date());
}

export function formatDate(date: Date | number) {
  return format(date, 'yyyy-MM-dd');
}
