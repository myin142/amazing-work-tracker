import { WorkDay, parseTime, formatTime } from '@myin/models';
import { add, intervalToDuration, startOfDay } from 'date-fns';

interface WorkCellProps {
  day?: WorkDay;
}

export function WorkCell({ day }: WorkCellProps) {
  if (!day) {
    return <></>;
  }

  const start = startOfDay(new Date());
  const end = day.workTimes
    .map((time) => ({
      start: parseTime(time.timeFrom),
      end: parseTime(time.timeTo),
    }))
    .reduce((prev, curr) => add(prev, intervalToDuration(curr)), start);
  const duration = start !== end ? formatTime(end) : '';

  return (
    <div>
      {duration}
    </div>
  );
}
