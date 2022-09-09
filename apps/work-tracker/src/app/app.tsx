// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from 'react';
import Calendar from '../components/calendar/calendar';
import WorkDialog from './work-dialog/work-dialog';
import Button from '../components/button/button';
import Login from './login/login';
import { WorkDay, FullDayType } from '@myin/models';
import { isWeekend } from 'date-fns';
import { environment } from '../environments/environment';
import { IMSClient } from '@myin/client';
import { ProjectNameIDMap } from '@myin/openapi';

const LOGIN_TOKEN_KEY = 'myin-work-tracker-login-token';

export function App() {
  const [workDialogOpen, setWorkDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWorkDay, setCurrentWorkDay] = useState(null as WorkDay | null);
  const [fullDayType, setFullDayType] = useState(null as FullDayType | null);
  const [token, setToken] = useState(
    localStorage.getItem(LOGIN_TOKEN_KEY) || ''
  );

  const [projects, setProjects] = useState([] as ProjectNameIDMap[]);

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
    setCurrentWorkDay({} as WorkDay);
    setSelectedDate(d);
    setWorkDialogOpen(true);
  };

  const onRangeSelected = (i: Interval) => {
    if (fullDayType) {
      getClient().saveFullDay(fullDayType, i);
      setFullDayType(null);
    }
  };

  const closeDialog = () => setWorkDialogOpen(false);

  const saveDay = async (workDay: WorkDay) => {
    getClient().saveDay(workDay);
    closeDialog();
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
    <div className="flex flex-col gap-4 items-center p-4 h-full">
      {(token && (
        <>
          <Calendar
            rangeSelect={!!fullDayType}
            onRangeSelected={onRangeSelected}
            onDateClicked={onDateClicked}
            cell={(d: Date) => <div>{!isWeekend(d) ? '8h / 1h' : ''}</div>}
          />

          <div className="flex gap-2">{fullDayTypeButtons}</div>

          <WorkDialog
            date={selectedDate}
            workDay={currentWorkDay}
            open={workDialogOpen}
            projects={projects}
            onClose={closeDialog}
            onSave={saveDay}
          />
        </>
      )) || <Login onLogin={(token) => onTokenLogin(token)} />}
    </div>
  );
}

export default App;
