import { formatDate, WorkDay, WorkTime } from '@myin/models';
import {
  ProjectDateTimeSpans,
  ProjectTimeSpan,
  TimeSpanTypeEnum,
  TimeSpanWithoutID,
} from '@myin/openapi';

const projectTimeType: TimeSpanTypeEnum[] = [
  TimeSpanTypeEnum.OnCallDuty,
  TimeSpanTypeEnum.Work,
  TimeSpanTypeEnum.SpecialWork,
];

export function mapToNewTimespans(
  workDay: WorkDay
): [TimeSpanWithoutID[], ProjectDateTimeSpans[]] {
  const times: TimeSpanWithoutID[] = [];
  const projectTimes: ProjectDateTimeSpans[] = [];

  workDay.workTimes
    .map((workTime) => {
      const timeSpans = mapWorkTimeToTimespan(workDay, workTime);
      const projectTimes = mapTimespansToProjectTimes(timeSpans, workTime);

      return [timeSpans, projectTimes] as [
        TimeSpanWithoutID[],
        ProjectDateTimeSpans | null
      ];
    })
    .forEach(([timeSpans, projectTime]) => {
      times.push(...timeSpans);
      if (projectTime != null) {
        const existing = projectTimes.find(
          (p) => p.project === projectTime.project
        );
        if (existing) {
          existing.timeSpans.push(...projectTime.timeSpans);
        } else {
          projectTimes.push(projectTime);
        }
      }
    });

  if (workDay.sickLeave) {
    const sorted = times.map((t) => t.toTime).sort();
    const maxTime = sorted[sorted.length - 1];

    times.push({
      date: formatDate(workDay.date),
      type: TimeSpanTypeEnum.SickLeave,
      fromTime: maxTime,
    });
  }

  return [times, projectTimes];
}

function mapTimespansToProjectTimes(
  timeSpans: TimeSpanWithoutID[],
  workTime: WorkTime
): ProjectDateTimeSpans | null {
  if (timeSpans.length === 0) {
    return null;
  }

  const projectTime: ProjectTimeSpan[] = timeSpans
    .filter(
      (time) =>
        time.fromTime && time.toTime && projectTimeType.includes(time.type)
    )
    .map((time) => ({
      fromTime: time.fromTime as string,
      toTime: time.toTime as string,
    }));

  return {
    date: timeSpans[0].date,
    project: workTime.projectId,
    timeSpans: projectTime,
  };
}

function mapWorkTimeToTimespan(
  day: WorkDay,
  workTime: WorkTime
): TimeSpanWithoutID[] {
  if (workTime.breakFrom && workTime.breakTo) {
    return [
      toTimespan(day, workTime.timeFrom, workTime.breakFrom),
      toTimespan(
        day,
        workTime.breakFrom,
        workTime.breakTo,
        TimeSpanTypeEnum.Break
      ),
      toTimespan(day, workTime.breakTo, workTime.timeTo),
    ];
  } else {
    return [toTimespan(day, workTime.timeFrom, workTime.timeTo)];
  }
}

function toTimespan(
  day: WorkDay,
  from: string,
  to: string,
  type: TimeSpanTypeEnum = TimeSpanTypeEnum.Work
): TimeSpanWithoutID {
  return {
    date: formatDate(day.date),
    type,
    fromTime: from,
    toTime: to,
    homeoffice: day.homeoffice || false,
  };
}
