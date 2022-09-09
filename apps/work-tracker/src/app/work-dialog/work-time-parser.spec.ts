import { WorkTime } from '@myin/models';
import { parseWorkTime } from './work-time-parser';

describe('Parse Work Time', () => {
  test('should parse work time', () => {
    expect(parseWorkTime('08:00-17:00')).toEqual(
      expect.objectContaining({
        timeFrom: '08:00',
        timeTo: '17:00',
      } as WorkTime)
    );
  });

  test('should parse work time hour shorthand', () => {
    expect(parseWorkTime('8-17')).toEqual(
      expect.objectContaining({
        timeFrom: '08:00',
        timeTo: '17:00',
      } as WorkTime)
    );
  });

  test('should parse work time hour shorthand with minutes', () => {
    expect(parseWorkTime('8:30-17')).toEqual(
      expect.objectContaining({
        timeFrom: '08:30',
        timeTo: '17:00',
      } as WorkTime)
    );
  });

  test('should parse with break time', () => {
    expect(parseWorkTime('8-17/12-13')).toEqual(
      expect.objectContaining({
        timeFrom: '08:00',
        timeTo: '17:00',
        breakFrom: '12:00',
        breakTo: '13:00',
      } as WorkTime)
    );
  });

  test('should parse only break within time', () => {
    expect(parseWorkTime('8-10/12-13')).toEqual(null);
  });

  test('should parse with large time', () => {
    expect(parseWorkTime('8-100')).toEqual(null);
  });

  test('should parse empty input', () => {
    expect(parseWorkTime('')).toEqual(null);
  });

  test('should parse invalid input', () => {
    expect(parseWorkTime('invalid')).toEqual(null);
  });
});
