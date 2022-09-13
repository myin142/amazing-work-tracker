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
  isSelected?: boolean;
  isOpen?: boolean;
  day?: WorkDay;
}

export function WorkCell({ day, date, isSelected, isOpen }: WorkCellProps) {
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

  const dateStyle = () => {
    let cls = '';

    if (isToday(date)) {
      cls += ' text-white bg-blue-700';
    }

    if (isOpen) {
      cls += ' underline font-bold';
    }

    return cls;
  };

  return (
    <div
      className={`flex flex-col items-start font-light grow p-2 gap-1 ${bgColor()}`}
    >
      <span
        className={`rounded-full w-6 h-6 flex justify-center items-center ${dateStyle()}`}
      >
        <span>{format(date, 'dd')}</span>
      </span>
      {day && (
        <div className="flex flex-row gap-2 items-center h-8">
          {day.vacation && <FaUmbrellaBeach />}
          {day.sickLeave && <HiEmojiSad />}
          {getDuration()}
        </div>
      )}
    </div>
  );
}
