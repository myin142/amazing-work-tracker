import { WorkTime } from '@myin/models';
import { isValid, isWithinInterval, parse } from 'date-fns';

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
    timeFrom: timeInterval.start as Date,
    timeTo: timeInterval.end as Date,
  };

  if (times.length > 1) {
    const breakInterval = parseInterval(times[1], refDate);
    if (breakInterval) {
      if (
        isWithinInterval(breakInterval.start, timeInterval) &&
        isWithinInterval(breakInterval.end, timeInterval)
      ) {
        workTime.breakFrom = breakInterval.start as Date;
        workTime.breakTo = breakInterval.end as Date;
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
