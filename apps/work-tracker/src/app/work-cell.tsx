import { WorkDay, parseTime, formatTime } from '@myin/models';
import { add, intervalToDuration, startOfDay } from 'date-fns';
import { FaUmbrellaBeach } from 'react-icons/fa';
import { HiEmojiSad } from 'react-icons/hi';

interface WorkCellProps {
  day?: WorkDay;
}

export function WorkCell({ day }: WorkCellProps) {
  if (!day) {
    return <></>;
  }

  const start = startOfDay(new Date());
  const end = day.workTimes
    .map((time) => {
      if (time.breakFrom && time.breakTo) {
        return [
          {
            start: parseTime(time.timeFrom),
            end: parseTime(time.breakFrom),
          },
          {
            start: parseTime(time.breakTo),
            end: parseTime(time.timeTo),
          },
        ];
      }

      return [
        {
          start: parseTime(time.timeFrom),
          end: parseTime(time.timeTo),
        },
      ];
    })
    .reduce((prev, curr) => prev.concat(curr), [])
    .reduce((prev, curr) => add(prev, intervalToDuration(curr)), start);
  const duration = start !== end ? formatTime(end) : '';

  return (
    <div>
      {(day.vacation || day.offDuty) && <FaUmbrellaBeach />}
      {day.sickLeave && <HiEmojiSad />}
      {duration}
    </div>
  );
}
