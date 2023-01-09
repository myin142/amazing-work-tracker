import { useEffect, useState } from 'react';
import Calendar from '../components/calendar/calendar';
import WorkDialog from './work-dialog/work-dialog';
import Button from '../components/button/button';
import Login from './login/login';
import { WorkDay, FullDayType, Project } from '@myin/models';
import { environment } from '../environments/environment';
import { IMSClient, UserInfo } from '@myin/client';
import { WorkCell } from './work-cell';
import {
  endOfMonth,
  Interval,
  isSameDay,
  isWithinInterval,
  startOfMonth,
} from 'date-fns';
import useKeyboardShortcut from './use-keyboard-shortcut';
import { Info } from './info/Info';

const LOGIN_TOKEN_KEY = 'myin-work-tracker-login-token';

export function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWorkDay, setCurrentWorkDay] = useState(null as WorkDay | null);
  const [fullDayType, setFullDayType] = useState(null as FullDayType | null);
  const [copyCell, setCopyCell] = useState(false);
  const [token, setToken] = useState(
    localStorage.getItem(LOGIN_TOKEN_KEY) || ''
  );
  const [error, setError] = useState('');

  const [calendarInterval, setCalendarInterval] = useState(
    null as Interval | null
  );
  const [workDays, setWorkDays] = useState({} as { [d: string]: WorkDay });
  const [projects, setProjects] = useState([] as Project[]);
  const [userInfo, setUserInfo] = useState(null as UserInfo | null);

  const hasWorkDays = Object.keys(workDays).length;
  const monthLocked = Object.values(workDays).some((day) => day.locked);

  useEffect(() => {
    getClient()
      .getProjects()
      .then((p) => setProjects(p))
      .catch((err) => {
        console.warn('Failed to get projects', err);
      });

    getClient()
      .userInfo()
      .then((i) => setUserInfo(i))
      .catch((err) => {
        console.warn('Failed to user info', err);
      });
  }, []);

  useKeyboardShortcut(['Shift', 'Enter'], () =>
    monthLocked ? withdrawMonth() : lockMonth()
  );
  useKeyboardShortcut(['Escape'], () => cancel());
  useKeyboardShortcut(['1'], () =>
    toggleFullDayType(Object.values(FullDayType)[0])
  );
  useKeyboardShortcut(['2'], () =>
    toggleFullDayType(Object.values(FullDayType)[1])
  );
  useKeyboardShortcut(['3'], () =>
    toggleFullDayType(Object.values(FullDayType)[2])
  );

  const getClient = () => new IMSClient(token, environment.baseUrl);

  const cancel = () => {
    setFullDayType(null);
    setCopyCell(false);
  };

  const onTokenLogin = (loginToken: string) => {
    localStorage.setItem(LOGIN_TOKEN_KEY, loginToken);
    setToken(loginToken);
  };

  const onTokenLogout = () => {
    localStorage.removeItem(LOGIN_TOKEN_KEY);
    setToken('');
  };

  const onDateClicked = (d: Date) => {
    setCurrentWorkDay(workDays[d.toDateString()] || {});
    setSelectedDate(d);
  };

  const onRangeSelected = async (i: Interval) => {
    if (fullDayType) {
      console.log(fullDayType, i);
      try {
        await getClient().saveFullDay(fullDayType, i);
      } catch (e) {
        console.log('Some full day request failed');
      }

      await loadWorkDays();
      setFullDayType(null);
    }
  };

  const onCellSelected = (date: Date) => {
    setCurrentWorkDay({
      ...(workDays[date.toDateString()] || {}),
      date,
    });
    setCopyCell(false);
  };

  const onCalendarChange = async (i: Interval | null) => {
    await loadWorkDays(i);
    if (i?.start && !isWithinInterval(selectedDate, i)) {
      onDateClicked(new Date(i.start));
    }
  };

  const loadWorkDays = async (i: Interval | null = calendarInterval) => {
    if (!i) {
      return;
    }

    const days = await getClient().getDays(i);

    const dayMap: { [d: string]: WorkDay } = {};
    days.forEach((day) => {
      dayMap[day.date.toDateString()] = day;

      if (currentWorkDay && isSameDay(day.date, currentWorkDay.date)) {
        setCurrentWorkDay(day);
      }
    });

    setWorkDays(dayMap);
    setCalendarInterval(i);
  };

  const saveDay = async (workDay: WorkDay) => {
    console.log(workDay);
    try {
      setError('');
      await getClient().saveDay(workDay);
      await loadWorkDays();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const toggleFullDayType = (type: FullDayType) => {
    if (fullDayType === type) {
      setFullDayType(null);
    } else {
      setFullDayType(type);
    }
  };

  const lockMonth = async () => {
    await getClient().lockDays({
      start: startOfMonth(selectedDate),
      end: endOfMonth(selectedDate),
    });
    await loadWorkDays();
  };

  const withdrawMonth = async () => {
    await getClient().lockDays(
      {
        start: startOfMonth(selectedDate),
        end: endOfMonth(selectedDate),
      },
      true
    );
    await loadWorkDays();
  };

  const fullDayTypeButtons = Object.values(FullDayType).map((type) => (
    <Button
      key={type}
      onClick={() => toggleFullDayType(type)}
      pressed={fullDayType === type}
    >
      {type}
    </Button>
  ));

  const lockButton = <Button onClick={() => lockMonth()}>Lock Month</Button>;
  const withDrawButton = (
    <Button onClick={() => withdrawMonth()}>Withdraw Month</Button>
  );
  const loginButton = <Login onLogin={(token) => onTokenLogin(token)} />;

  return (
    <div className="flex flex-row gap-4 p-4 h-full">
      {(token && (
        <>
          <Calendar
            currentDate={selectedDate}
            rangeSelect={!!fullDayType}
            cellSelect={copyCell}
            onRangeSelected={onRangeSelected}
            onCellSelected={onCellSelected}
            onDateClicked={onDateClicked}
            onCalendarChange={onCalendarChange}
            cell={(d: Date, isSelected: boolean) => (
              <WorkCell
                date={d}
                day={workDays[d.toDateString()]}
                isSelected={isSelected}
                isOpen={isSameDay(selectedDate, d)}
              />
            )}
            rightHeader={() => (
              // eslint-disable-next-line react/jsx-no-useless-fragment
              <div className="basis-10 flex items-center text-lg">
                <Info info={userInfo} onLogout={onTokenLogout} />
              </div>
            )}
            header={() => (
              <div className="flex gap-2 items-center">
                {fullDayTypeButtons}
              </div>
            )}
          />

          <div className="w-1/2 flex flex-col gap-2">
            <div className=" grow flex flex-col justify-between">
              <WorkDialog
                date={selectedDate}
                workDay={currentWorkDay}
                projects={projects}
                onSave={saveDay}
                onCopy={() => setCopyCell(!copyCell)}
                isCopying={copyCell}
                error={error}
              />

              {(hasWorkDays &&
                ((monthLocked && withDrawButton) || lockButton)) ||
                ''}
            </div>
          </div>
        </>
      )) ||
        loginButton}
    </div>
  );
}

export default App;
