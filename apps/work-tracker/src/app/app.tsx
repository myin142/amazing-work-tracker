// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from 'react';
import Calendar from '../components/calendar/calendar';
import WorkDialog from './work-dialog/work-dialog';
import Button from '../components/button/button';
import Login from './login/login';
import { WorkDay, FullDayType, Project } from '@myin/models';
import { environment } from '../environments/environment';
import { IMSClient } from '@myin/client';
import { WorkCell } from './work-cell';
import { Interval, isEqual } from 'date-fns';

const LOGIN_TOKEN_KEY = 'myin-work-tracker-login-token';

export function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWorkDay, setCurrentWorkDay] = useState(null as WorkDay | null);
  const [fullDayType, setFullDayType] = useState(null as FullDayType | null);
  const [token, setToken] = useState(
    localStorage.getItem(LOGIN_TOKEN_KEY) || ''
  );

  const [calendarInterval, setCalendarInterval] = useState(
    null as Interval | null
  );
  const [workDays, setWorkDays] = useState({} as { [d: string]: WorkDay });
  const [projects, setProjects] = useState([] as Project[]);

  const getClient = () => new IMSClient(token, environment.baseUrl);

  useEffect(() => {
    getClient()
      .getProjects()
      .then((p) => setProjects(p));
  }, []);

  const onTokenLogin = (loginToken: string) => {
    localStorage.setItem(LOGIN_TOKEN_KEY, loginToken);
    setToken(loginToken);
  };

  const onDateClicked = (d: Date) => {
    setCurrentWorkDay(workDays[d.toDateString()] || {});
    setSelectedDate(d);
  };

  const onRangeSelected = async (i: Interval) => {
    if (fullDayType) {
      console.log(fullDayType, i);
      await getClient().saveFullDay(fullDayType, i);
      await loadWorkDays();
      setFullDayType(null);
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
    });

    setWorkDays(dayMap);
    setCalendarInterval(i);
  };

  const saveDay = async (workDay: WorkDay) => {
    console.log(workDay);
    await getClient().saveDay(workDay);
    await loadWorkDays();
  };

  const toggleFullDayType = (type: FullDayType) => {
    if (fullDayType === type) {
      setFullDayType(null);
    } else {
      setFullDayType(type);
    }
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

  return (
    <div className="flex flex-row gap-4 p-4 h-full">
      {(token && (
        <>
          <Calendar
            rangeSelect={!!fullDayType}
            onRangeSelected={onRangeSelected}
            onDateClicked={onDateClicked}
            onCalendarChange={loadWorkDays}
            cell={(d: Date, isSelected: boolean) => (
              <WorkCell
                date={d}
                day={workDays[d.toDateString()]}
                isSelected={isSelected}
                isOpen={isEqual(selectedDate, d)}
              />
            )}
            header={() => (
              <div className="flex gap-2">{fullDayTypeButtons}</div>
            )}
          />

          <WorkDialog
            date={selectedDate}
            workDay={currentWorkDay}
            projects={projects}
            onSave={saveDay}
          />
        </>
      )) || <Login onLogin={(token) => onTokenLogin(token)} />}
    </div>
  );
}

export default App;
