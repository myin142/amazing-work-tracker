import { formatTime, WorkTime } from '@myin/models';
import {
  isValid,
  isWithinInterval,
  parse,
} from 'date-fns';

export function parseWorkTime(
  input: string,
  refDate = new Date()
): WorkTime | null {
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
