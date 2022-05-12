import { render } from '@testing-library/react';

import WorkDialog from './work-dialog';

describe('WorkDialog', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WorkDialog />);
    expect(baseElement).toBeTruthy();
  });
});
