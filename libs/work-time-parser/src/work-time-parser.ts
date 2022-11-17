import { formatTime, WorkTime } from '@myin/models';
import {
  addMinutes,
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

function createWorkTime(
  workTimeInput: string,
  startTime: Date
): Interval | null {
  if (isHourInput(workTimeInput)) {
    return parseHours(startTime, workTimeInput);
  }

  return parseInterval(workTimeInput, new Date());
}

function intervalInMinutes(interval: Interval) {
  return differenceInMinutes(interval.end, interval.start);
}

function createBreakTime(
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
      return parseHours(workTimeCenter, breakTimeInput);
    }
    const interval = parseInterval(breakTimeInput, new Date());
    if (interval && isIntervalWithin(interval, workTimeInterval)) {
      return interval;
    }
  } else if (isWorkTimeNeedsBreak(workTimeInterval)) {
    const breakTo = addMinutes(workTimeCenter, DEFAULT_HOURS_BREAK_MINUTES);
    return { start: workTimeCenter, end: breakTo };
  }

  return null;
}

export function parseWorkTimes(input: string): WorkTime[] {
  const result: WorkTime[] = [];
  let startTime = DEFAULT_HOURS_START_TIME;

  input.split(';').forEach((i) => {
    const workTime = parseSingleWorkTime(i, startTime);
    if (workTime) {
      result.push(workTime);
      startTime = parseTime(workTime.timeTo, startTime) || startTime;
    }
  });

  return result;
}

function parseSingleWorkTime(input: string, startTime: Date): WorkTime | null {
  const times = input.split('/');
  const workTimeInput = times[0];

  const workTimeInterval = createWorkTime(workTimeInput, startTime);
  if (!workTimeInterval) {
    return null;
  }

  const breakTimeInterval = createBreakTime(workTimeInterval, times[1]);

  if (breakTimeInterval && isHourInput(workTimeInput)) {
    workTimeInterval.end = addMinutes(
      workTimeInterval.end,
      intervalInMinutes(breakTimeInterval)
    );
  }

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
  return intervalInMinutes(workTime) > MAX_WORK_HOURS_WITHOUT_BREAK * 60;
}

function isHourInput(input: string): boolean {
  return /^\d+\.?\d?h$/.test(input);
}

function isIntervalWithin(interval: Interval, boundingInterval: Interval) {
  return (
    isWithinInterval(interval.start, boundingInterval) &&
    isWithinInterval(interval.end, boundingInterval)
  );
}
