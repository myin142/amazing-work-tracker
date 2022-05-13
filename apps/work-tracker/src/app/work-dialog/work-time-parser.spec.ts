import { WorkTime } from '@myin/models';
import { parseWorkTime } from './work-time-parser';

describe('Parse Work Time', () => {
  test('should parse work time', () => {
    expect(parseWorkTime('08:00-17:00', new Date('2020-01-01'))).toEqual(
      expect.objectContaining({
        timeFrom: new Date('2020-01-01T08:00:00'),
        timeTo: new Date('2020-01-01T17:00:00'),
      } as WorkTime)
    );
  });

  test('should parse work time hour shorthand', () => {
    expect(parseWorkTime('8-17', new Date('2020-01-01'))).toEqual(
      expect.objectContaining({
        timeFrom: new Date('2020-01-01T08:00:00'),
        timeTo: new Date('2020-01-01T17:00:00'),
      } as WorkTime)
    );
  });

  test('should parse work time hour shorthand with minutes', () => {
    expect(parseWorkTime('8:30-17', new Date('2020-01-01'))).toEqual(
      expect.objectContaining({
        timeFrom: new Date('2020-01-01T08:30:00'),
        timeTo: new Date('2020-01-01T17:00:00'),
      } as WorkTime)
    );
  });

  test('should parse with break time', () => {
    expect(parseWorkTime('8-17/12-13', new Date('2020-01-01'))).toEqual(
      expect.objectContaining({
        timeFrom: new Date('2020-01-01T08:00:00'),
        timeTo: new Date('2020-01-01T17:00:00'),
        breakFrom: new Date('2020-01-01T12:00:00'),
        breakTo: new Date('2020-01-01T13:00:00'),
      } as WorkTime)
    );
  });

  test('should parse with large time', () => {
    expect(parseWorkTime('8-100', new Date('2020-01-01'))).toEqual(null);
  });

  test('should parse empty input', () => {
    expect(parseWorkTime('', new Date('2020-01-01'))).toEqual(null);
  });

  test('should parse invalid input', () => {
    expect(parseWorkTime('invalid', new Date('2020-01-01'))).toEqual(null);
  });
});
