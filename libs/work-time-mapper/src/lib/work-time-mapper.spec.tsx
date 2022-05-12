import { render } from '@testing-library/react';

import WorkTimeMapper from './work-time-mapper';

describe('WorkTimeMapper', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<WorkTimeMapper />);
    expect(baseElement).toBeTruthy();
  });
});
