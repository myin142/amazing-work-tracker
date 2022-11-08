import { formatTime, WorkTime } from '@myin/models';
import {
  addMinutes,
  differenceInHours,
  differenceInMinutes,
  isValid,
  isWithinInterval,
  parse,
  setHours,
  startOfToday,
} from 'date-fns';

const DEFAULT_HOURS_START_TIME = setHours(startOfToday(), 8);
const DEFAULT_HOURS_BREAK_MINUTES = 60;

const MAX_WORK_HOURS_WITHOUT_BREAK = 6;

function createWorkTime(workTimeInput: string): Interval | null {
  if (isHourInput(workTimeInput)) {
    return parseHours(DEFAULT_HOURS_START_TIME, workTimeInput);
  }

  return parseInterval(workTimeInput, new Date());
}

function intervalInMinutes(interval: Interval) {
  return differenceInMinutes(interval.end, interval.start);
}

function createBreakTimeAndAdaptWorkTime(
  workTimeInterval: Interval,
  breakTimeInput?: string
): Interval | null {
  const workMinutes = intervalInMinutes(workTimeInterval);
  const workTimeCenter = addMinutes(
    workTimeInterval.start,
    Math.floor(workMinutes / 2)
  );

  if (breakTimeInput) {
    if (isHourInput(breakTimeInput)) {
      const breakTime = parseHours(workTimeCenter, breakTimeInput);
      if (breakTime) {
        const addedBreak = intervalInMinutes(breakTime);
        workTimeInterval.end = addMinutes(workTimeInterval.end, addedBreak);
        return breakTime;
      }
    }
    const interval = parseInterval(breakTimeInput, new Date());
    if (interval && isIntervalWithin(interval, workTimeInterval)) {
      return interval;
    }
  } else if (isWorkTimeNeedsBreak(workTimeInterval)) {
    workTimeInterval.end = addMinutes(
      workTimeInterval.end,
      DEFAULT_HOURS_BREAK_MINUTES
    );
    const breakTo = addMinutes(workTimeCenter, DEFAULT_HOURS_BREAK_MINUTES);
    return { start: workTimeCenter, end: breakTo };
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

  const breakTimeInterval = createBreakTimeAndAdaptWorkTime(
    workTimeInterval,
    times[1]
  );

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

function parseHours(start: Date, input: string): Interval | null {
  const hours = parseFloat(input);
  const workMinutes = hours * 60;
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
