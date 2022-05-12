// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from 'react';
import Calendar from '../components/calendar/calendar';
import WorkDialog from './work-dialog/work-dialog';

export function App() {
  const [workDialogOpen, setWorkDialogOpen] = useState(false);

  return (
    <div>
      <Calendar onDateClicked={() => setWorkDialogOpen(true)} />

      <WorkDialog
        open={workDialogOpen}
        onClose={() => setWorkDialogOpen(false)}
      />
    </div>
  );
}

export default App;
