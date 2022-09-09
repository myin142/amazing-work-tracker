import { FullDayType } from '@myin/models';
import { OffDutyReasonEnum, TimeSpanTypeEnum } from '@myin/openapi';
import { mapFullDayTypes, mapToNewTimespans } from './work-time-mapper';

describe('workTimeMapper', () => {
  it('should return work time without break', () => {
    const [timeSpans] = mapToNewTimespans({
      date: new Date('2020-01-01'),
      workTimes: [
        {
          timeFrom: '08:00',
          timeTo: '17:00',
          projectId: 0,
        },
      ],
    });

    expect(timeSpans).toEqual([
      {
        date: '2020-01-01',
        fromTime: '08:00',
        toTime: '17:00',
        type: TimeSpanTypeEnum.Work,
        homeoffice: false,
      },
    ]);
  });

  it('should split times by break', () => {
    const [timeSpans] = mapToNewTimespans({
      date: new Date('2020-01-01'),
      workTimes: [
        {
          timeFrom: '08:00',
          timeTo: '17:00',
          breakFrom: '12:00',
          breakTo: '13:00',
          projectId: 0,
        },
      ],
    });

    expect(timeSpans).toEqual(
      expect.arrayContaining([
        {
          date: '2020-01-01',
          fromTime: '08:00',
          toTime: '12:00',
          type: TimeSpanTypeEnum.Work,
          homeoffice: false,
        },
        {
          date: '2020-01-01',
          fromTime: '12:00',
          toTime: '13:00',
          type: TimeSpanTypeEnum.Break,
          homeoffice: false,
        },
        {
          date: '2020-01-01',
          fromTime: '13:00',
          toTime: '17:00',
          type: TimeSpanTypeEnum.Work,
          homeoffice: false,
        },
      ])
    );
  });

  it('should set homeoffice', () => {
    const [timeSpans] = mapToNewTimespans({
      date: new Date('2020-01-01'),
      homeoffice: true,
      workTimes: [
        {
          timeFrom: '08:00',
          timeTo: '17:00',
          projectId: 0,
        },
      ],
    });

    expect(timeSpans).toEqual([
      expect.objectContaining({
        homeoffice: true,
      }),
    ]);
  });

  it('should create project timespans', () => {
    const [_, projectTimes] = mapToNewTimespans({
      date: new Date('2020-01-01'),
      homeoffice: true,
      workTimes: [
        {
          timeFrom: '08:00',
          timeTo: '10:00',
          projectId: 1,
        },
        {
          timeFrom: '10:00',
          timeTo: '16:00',
          breakFrom: '12:00',
          breakTo: '13:00',
          projectId: 2,
        },
        {
          timeFrom: '16:00',
          timeTo: '17:00',
          projectId: 1,
        },
      ],
    });

    expect(projectTimes).toEqual(
      expect.arrayContaining([
        {
          date: '2020-01-01',
          project: 1,
          timeSpans: [
            { fromTime: '08:00', toTime: '10:00' },
            { fromTime: '16:00', toTime: '17:00' },
          ],
        },
        {
          date: '2020-01-01',
          project: 2,
          timeSpans: [
            { fromTime: '10:00', toTime: '12:00' },
            { fromTime: '13:00', toTime: '16:00' },
          ],
        },
      ])
    );
  });

  it('should create sick leave with existing time', () => {
    const [timeSpans] = mapToNewTimespans({
      date: new Date('2020-01-01'),
      homeoffice: true,
      sickLeave: true,
      workTimes: [
        {
          timeFrom: '08:00',
          timeTo: '10:00',
          projectId: 1,
        },
      ],
    });

    expect(timeSpans).toEqual(
      expect.arrayContaining([
        {
          date: '2020-01-01',
          type: TimeSpanTypeEnum.SickLeave,
          fromTime: '10:00',
          toTime: undefined,
        },
      ])
    );
  });

  it('should create sick leave without existing time', () => {
    const [timeSpans] = mapToNewTimespans({
      date: new Date('2020-01-01'),
      homeoffice: true,
      sickLeave: true,
      workTimes: [],
    });

    expect(timeSpans).toEqual(
      expect.arrayContaining([
        {
          date: '2020-01-01',
          type: TimeSpanTypeEnum.SickLeave,
          fromTime: undefined,
          toTime: undefined,
        },
      ])
    );
  });

  describe('FullDayType', () => {
    it('should create vacation times without weekend', () => {
      const times = mapFullDayTypes(
        FullDayType.VACATION,
        new Date('2020-01-01'),
        new Date('2020-01-05') // weekend 04 and 05
      );

      expect(times).toEqual(
        expect.arrayContaining([
          {
            date: '2020-01-01',
            type: TimeSpanTypeEnum.FullDayVacation,
            fromTime: undefined,
            toTime: undefined,
          },
          {
            date: '2020-01-02',
            type: TimeSpanTypeEnum.FullDayVacation,
            fromTime: undefined,
            toTime: undefined,
          },
          {
            date: '2020-01-03',
            type: TimeSpanTypeEnum.FullDayVacation,
            fromTime: undefined,
            toTime: undefined,
          },
        ])
      );
    });

    it('should create sick times without weekend', () => {
      const times = mapFullDayTypes(
        FullDayType.SICK,
        new Date('2020-01-01'),
        new Date('2020-01-05') // weekend 04 and 05
      );

      expect(times).toEqual(
        expect.arrayContaining([
          {
            date: '2020-01-01',
            type: TimeSpanTypeEnum.SickLeave,
            fromTime: undefined,
            toTime: undefined,
          },
          {
            date: '2020-01-02',
            type: TimeSpanTypeEnum.SickLeave,
            fromTime: undefined,
            toTime: undefined,
          },
          {
            date: '2020-01-03',
            type: TimeSpanTypeEnum.SickLeave,
            fromTime: undefined,
            toTime: undefined,
          },
        ])
      );
    });

    it('should create offduty times without weekend', () => {
      const times = mapFullDayTypes(
        FullDayType.OFF_DUTY,
        new Date('2020-01-01'),
        new Date('2020-01-05'), // weekend 04 and 05
        OffDutyReasonEnum.ChangeOfResidence
      );

      expect(times).toEqual(
        expect.arrayContaining([
          {
            date: '2020-01-01',
            type: TimeSpanTypeEnum.OffDuty,
            offDutyReason: OffDutyReasonEnum.ChangeOfResidence,
            fromTime: undefined,
            toTime: undefined,
          },
          {
            date: '2020-01-02',
            type: TimeSpanTypeEnum.OffDuty,
            offDutyReason: OffDutyReasonEnum.ChangeOfResidence,
            fromTime: undefined,
            toTime: undefined,
          },
          {
            date: '2020-01-03',
            type: TimeSpanTypeEnum.OffDuty,
            offDutyReason: OffDutyReasonEnum.ChangeOfResidence,
            fromTime: undefined,
            toTime: undefined,
          },
        ])
      );
    });
  });
});
