import { mapToNewTimespans } from './work-time-mapper';

describe('workTimeMapper', () => {
  it('should map work times', () => {
    mapToNewTimespans({
      date: new Date('2020-01-01'),
      workTimes: [
        {
          timeFrom: '08:00',
          timeTo: '17:00',
          breakFrom: '12:00',
          breakTo: '13:00',
        },
      ],
    });
  });
});
