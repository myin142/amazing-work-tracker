// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useState } from 'react';
import WorkDialog from './work-dialog/work-dialog';

export function App() {
  const [workDialogOpen, setWorkDialogOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setWorkDialogOpen(true)}>Open</button>
      <WorkDialog
        open={workDialogOpen}
        onClose={() => setWorkDialogOpen(false)}
      />
    </div>
  );
}

export default App;
