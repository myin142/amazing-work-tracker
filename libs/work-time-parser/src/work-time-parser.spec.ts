import { WorkTime } from '@myin/models';
import { parseWorkTime } from './work-time-parser';

describe('Parse Work Time', () => {
  test('should parse work time', () => {
    expect(parseWorkTime('08:00-12:00')).toEqual(
      expect.objectContaining({
        timeFrom: '08:00',
        timeTo: '12:00',
      } as WorkTime)
    );
  });

  test('should parse work time hour shorthand', () => {
    expect(parseWorkTime('8-12')).toEqual(
      expect.objectContaining({
        timeFrom: '08:00',
        timeTo: '12:00',
      } as WorkTime)
    );
  });

  test('should parse work time hour shorthand with minutes', () => {
    expect(parseWorkTime('8:30-12')).toEqual(
      expect.objectContaining({
        timeFrom: '08:30',
        timeTo: '12:00',
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
    expect(parseWorkTime('8-10/12-13')).toEqual(
      expect.objectContaining({
        timeFrom: '08:00',
        timeTo: '10:00',
        breakFrom: undefined,
        breakTo: undefined,
      })
    );
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

  describe('Parse Work Hours', () => {
    test('should parse hours with break', () => {
      expect(parseWorkTime('8h')).toEqual(
        expect.objectContaining({
          timeFrom: '08:00',
          timeTo: '17:00',
          breakFrom: '12:00',
          breakTo: '13:00',
        })
      );
    });

    test('should parse uneven hours with break', () => {
      expect(parseWorkTime('7h')).toEqual(
        expect.objectContaining({
          timeFrom: '08:00',
          timeTo: '16:00',
          breakFrom: '11:30',
          breakTo: '12:30',
        })
      );
    });

    test('should parse hours without break', () => {
      expect(parseWorkTime('5h')).toEqual(
        expect.objectContaining({
          timeFrom: '08:00',
          timeTo: '13:00',
          breakFrom: undefined,
          breakTo: undefined,
        })
      );
    });

    test('should parse hours with decimal', () => {
      expect(parseWorkTime('4.5h')).toEqual(
        expect.objectContaining({
          timeFrom: '08:00',
          timeTo: '12:30',
          breakFrom: undefined,
          breakTo: undefined,
        })
      );
    });

    test('should parse uneven hours with decimal', () => {
      expect(parseWorkTime('7.5h')).toEqual(
        expect.objectContaining({
          timeFrom: '08:00',
          timeTo: '16:30',
          breakFrom: '11:45',
          breakTo: '12:45',
        })
      );
    });
  });
});
