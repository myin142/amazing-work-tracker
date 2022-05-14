import {
  eachWeekOfInterval,
  addDays,
  startOfMonth,
  endOfMonth,
  format,
  isSameMonth,
  isSunday,
  isSaturday,
  sub,
  add,
  isSameDay,
  isWithinInterval,
  isBefore,
} from 'date-fns';
import { useEffect, useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

export interface CalendarProps {
  onDateClicked: (d: Date) => void;
  onRangeSelected: (i: Interval) => void;
  cell?: (d: Date) => JSX.Element;
  rangeSelect: boolean;
}

const createIntervalBetween = (date1: Date, date2: Date): Interval => {
  if (isBefore(date1, date2)) {
    return { start: date1, end: date2 };
  } else {
    return { start: date2, end: date1 };
  }
};

export function Calendar({
  onDateClicked,
  onRangeSelected,
  cell,
  rangeSelect,
}: CalendarProps) {
  const date = new Date();

  const [rangeStart, setRangeStart] = useState(null as Date | null);
  const [hoverDate, setHoverDate] = useState(null as Date | null);

  useEffect(() => setRangeStart(null), [rangeSelect]);

  let start = startOfMonth(date);
  if (isSunday(start)) {
    start = sub(start, { days: 1 });
  }

  let end = endOfMonth(date);
  if (isSaturday(end)) {
    end = add(end, { days: 1 });
  }

  const onCellClick = (date: Date) => {
    if (rangeSelect) {
      if (!rangeStart) {
        setRangeStart(date);
      } else {
        onRangeSelected({ start: rangeStart, end: date });
      }
    } else {
      onDateClicked(date);
    }
  };

  const isInsideRange = (date: Date) => {
    if (rangeSelect) {
      const isHoverDate = hoverDate && isSameDay(hoverDate, date);
      const isRangeStartDate = rangeStart && isSameDay(rangeStart, date);
      const isBetweenStartAndHover =
        hoverDate &&
        rangeStart &&
        isWithinInterval(date, createIntervalBetween(hoverDate, rangeStart));

      return isHoverDate || isRangeStartDate || isBetweenStartAndHover;
    }

    return false;
  };

  const weeks = eachWeekOfInterval({ start, end }).map((day) => {
    const weekDays = [day];
    for (let i = 1; i <= 6; i++) {
      weekDays.push(addDays(day, i));
    }

    return (
      <tr key={day.toISOString()}>
        {weekDays.map((d) => {
          return (
            <td
              className={`rounded-lg ring-1 border-separate space-4 gap-4 p-4 text-sm cursor-pointer ${
                !isSameMonth(date, d) ? 'opacity-50' : ''
              } ${isInsideRange(d) ? 'bg-blue-200' : ''}`}
              key={d.toISOString()}
              onClick={() => onCellClick(d)}
              onMouseEnter={() => setHoverDate(d)}
              onMouseLeave={() => setHoverDate(null)}
            >
              <div className="flex flex-col">
                <span className="font-bold">{format(d, 'dd')}</span>
                {cell && cell(d)}
              </div>
            </td>
          );
        })}
      </tr>
    );
  });

  const title = format(date, 'MMMM yyyy');
  const weekDayLetters = ['Son', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white text-gray-800">
      <div className="text-4xl font-bold flex items-center">
        <button>
          <HiChevronLeft />
        </button>
        <span>{title}</span>
        <button>
          <HiChevronRight />
        </button>
      </div>
      <table className="border-collapse mt-4">
        <tr>
          {weekDayLetters.map((l) => (
            <th className="text-sm text800 uppercase">{l}</th>
          ))}
        </tr>
        {weeks}
      </table>
    </div>
  );
}

export default Calendar;
