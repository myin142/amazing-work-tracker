import { WorkDay, parseTime, formatTime } from '@myin/models';
import {
  add,
  format,
  intervalToDuration,
  isToday,
  isWeekend,
  startOfDay,
} from 'date-fns';
import { FaUmbrellaBeach } from 'react-icons/fa';
import { HiEmojiSad } from 'react-icons/hi';

interface WorkCellProps {
  date: Date;
  isSelected: boolean;
  day?: WorkDay;
}

export function WorkCell({ day, date, isSelected }: WorkCellProps) {
  const getDuration = () => {
    if (!day) {
      return '';
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
    return start !== end ? formatTime(end) : '';
  };

  const bgColor = () => {
    if (isSelected) {
      return 'bg-blue-200';
    }

    if (isWeekend(date)) {
      return 'bg-red-50';
    }

    return '';
  };

  return (
    <div className={`flex flex-col items-start grow p-2 ${bgColor()}`}>
      <span
        className={`rounded-full w-6 h-6 flex justify-center items-center font-bold ${
          isToday(date) ? 'text-white bg-blue-700' : ''
        }`}
      >
        <span>{format(date, 'dd')}</span>
      </span>
      {day && (
        <div>
          {(day.vacation || day.offDuty) && <FaUmbrellaBeach />}
          {day.sickLeave && <HiEmojiSad />}
          {getDuration()}
        </div>
      )}
    </div>
  );
}
