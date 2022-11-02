import { formatTime, WorkTime } from '@myin/models';
import { addMinutes, isValid, isWithinInterval, parse } from 'date-fns';

const DEFAULT_HOURS_START_TIME = '08:00';
const DEFAULT_HOURS_BREAK_MINUTES = 60;

const MAX_WORK_HOURS_WITHOUT_BREAK = 6;

function parseWorkHours(input: string) {
  const hours = parseFloat(input);
  const workMinutes = hours * 60;
  const start = parseTime(DEFAULT_HOURS_START_TIME);
  if (start) {
    let breakFrom = null;
    let breakTo = null;
    let end = addMinutes(start, workMinutes);
    if (hours > MAX_WORK_HOURS_WITHOUT_BREAK) {
      end = addMinutes(end, DEFAULT_HOURS_BREAK_MINUTES);
      breakFrom = addMinutes(start, Math.floor(workMinutes / 2));
      breakTo = addMinutes(breakFrom, DEFAULT_HOURS_BREAK_MINUTES);
    }

    return {
      timeFrom: DEFAULT_HOURS_START_TIME,
      timeTo: formatTime(end),
      breakFrom: breakFrom ? formatTime(breakFrom) : undefined,
      breakTo: breakTo ? formatTime(breakTo) : undefined,
      projectId: -1,
    };
  }

  return null;
}

export function parseWorkTime(
  input: string,
  refDate = new Date()
): WorkTime | null {
  if (input.match(/^\d+\.?\d?h$/)) {
    return parseWorkHours(input);
  }

  const times = input.split('/');
  const timeInterval = parseInterval(times[0], refDate);
  if (!timeInterval) {
    return null;
  }

  const workTime: WorkTime = {
    timeFrom: formatTime(timeInterval.start),
    timeTo: formatTime(timeInterval.end),
    projectId: -1,
  };

  if (times.length > 1) {
    const breakInterval = parseInterval(times[1], refDate);
    if (breakInterval) {
      if (
        isWithinInterval(breakInterval.start, timeInterval) &&
        isWithinInterval(breakInterval.end, timeInterval)
      ) {
        workTime.breakFrom = formatTime(breakInterval.start);
        workTime.breakTo = formatTime(breakInterval.end);
      } else {
        return null;
      }
    }
  }

  return workTime;
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
