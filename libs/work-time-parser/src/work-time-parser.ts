import { formatTime, WorkTime } from '@myin/models';
import {
  addMinutes,
  differenceInHours,
  differenceInMinutes,
  isValid,
  isWithinInterval,
  parse,
} from 'date-fns';

const DEFAULT_HOURS_START_TIME = '08:00';
const DEFAULT_HOURS_BREAK_MINUTES = 60;

const MAX_WORK_HOURS_WITHOUT_BREAK = 6;

function createWorkTime(workTimeInput: string): Interval | null {
  if (isHourInput(workTimeInput)) {
    return parseWorkHours(DEFAULT_HOURS_START_TIME, workTimeInput);
  }

  return parseInterval(workTimeInput, new Date());
}

function createBreakTime(
  workTimeInterval: Interval,
  breakTimeInput?: string
): Interval | null {
  if (breakTimeInput) {
    const interval = parseInterval(breakTimeInput, new Date());
    if (interval && isIntervalWithin(interval, workTimeInterval)) {
      return interval;
    }
  } else if (isWorkTimeNeedsBreak(workTimeInterval)) {
    const workMinutes = differenceInMinutes(
      workTimeInterval.end,
      workTimeInterval.start
    );
    workTimeInterval.end = addMinutes(
      workTimeInterval.end,
      DEFAULT_HOURS_BREAK_MINUTES
    );
    const breakFrom = addMinutes(
      workTimeInterval.start,
      Math.floor(workMinutes / 2)
    );
    const breakTo = addMinutes(breakFrom, DEFAULT_HOURS_BREAK_MINUTES);
    return { start: breakFrom, end: breakTo };
  }

  return null;
}

export function parseWorkTime(input: string): WorkTime | null {
  const times = input.split('/');
  const workTimeInput = times[0];

  const workTimeInterval = createWorkTime(workTimeInput);
  if (!workTimeInterval) {
    return null;
  }

  const breakTimeInterval = createBreakTime(workTimeInterval, times[1]);

  return {
    timeFrom: formatTime(workTimeInterval.start),
    timeTo: formatTime(workTimeInterval.end),
    breakFrom: breakTimeInterval
      ? formatTime(breakTimeInterval.start)
      : undefined,
    breakTo: breakTimeInterval ? formatTime(breakTimeInterval.end) : undefined,
    projectId: -1,
  };
}

function parseInterval(time: string, refDate: Date): Interval | null {
  const ranges = time.split('-');
  const start = parseTime(ranges[0], refDate) as Date;
  const end = parseTime(ranges[1], refDate) as Date;

  if (!isValid(start) || !isValid(end)) {
    return null;
  }

  return { start, end };
}

function parseTime(time?: string, date = new Date()): Date | null {
  if (!time) return null;

  const f = time.includes(':') ? 'HH:mm' : 'HH';
  return parse(time, f, date);
}

function parseWorkHours(startTime: string, input: string): Interval | null {
  const hours = parseFloat(input);
  const workMinutes = hours * 60;
  const start = parseTime(startTime);
  if (start) {
    return { start, end: addMinutes(start, workMinutes) };
  }

  return null;
}

function isWorkTimeNeedsBreak(workTime: Interval) {
  return (
    differenceInHours(workTime.end, workTime.start) >
    MAX_WORK_HOURS_WITHOUT_BREAK
  );
}

function isHourInput(input: string) {
  return input.match(/^\d+\.?\d?h$/);
}

function isIntervalWithin(interval: Interval, boundingInterval: Interval) {
  return (
    isWithinInterval(interval.start, boundingInterval) &&
    isWithinInterval(interval.end, boundingInterval)
  );
}
