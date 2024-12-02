import {
  Configuration,
  ProjectDateTimeSpans,
  TimeSpanWithoutID,
  TimeBookingApi,
  ProjectApi,
  ProjectTimeBookingApi,
  UserinfoApi,
  TimeSpanTypeEnum,
  HolidaysApi,
} from '@myin/openapi';
import { formatDate, FullDayType, Project, WorkDay } from '@myin/models';
import {
  mapFullDayTypes,
  mapToNewTimespans,
  mapToWorkDay,
} from '@myin/work-time-mapper';
import {
  eachDayOfInterval,
  Interval,
  parse,
  endOfDay,
  startOfDay,
} from 'date-fns';

export interface UserInfo {
  email: string;
}

export class IMSClient {
  private timeBookingApi: TimeBookingApi;
  private projectApi: ProjectApi;
  private projectTimebookingApi: ProjectTimeBookingApi;
  private userApi: UserinfoApi;
  private holidayApi: HolidaysApi;

  constructor(token: string, baseUrl: string) {
    const config = new Configuration({ apiKey: token, basePath: baseUrl });

    this.timeBookingApi = new TimeBookingApi(config);
    this.projectApi = new ProjectApi(config);
    this.projectTimebookingApi = new ProjectTimeBookingApi(config);
    this.userApi = new UserinfoApi(config);
    this.holidayApi = new HolidaysApi(config);
  }

  async holidays(date: Date): Promise<Record<string, string>> {
    const { data } = await this.holidayApi.holidaysYearMonthGet(
      date.getFullYear(),
      date.getMonth() + 1
    );

    return data.holidays.reduce(
      (prev, curr) => ({ ...prev, [curr.date]: curr.name }),
      {}
    );
  }

  async userInfo(): Promise<UserInfo> {
    const { data } = await this.userApi.userinfoMeGet();
    return { email: data.email };
  }

  async saveDay(workDay: WorkDay) {
    const [timeSpans, projectTimes] = mapToNewTimespans(workDay);

    await this.deleteExistingTimes(workDay.date);

    await Promise.all(timeSpans.map((timespan) => this.saveTimeSpan(timespan)));

    await Promise.all(
      projectTimes.map((timespan) => this.saveProjectTime(timespan))
    );
  }

  private async deleteExistingTimes(
    from: Date | number,
    to: Date | number = from
  ) {
    await Promise.all(
      eachDayOfInterval({ start: from, end: to }).map((d) =>
        this.projectTimebookingApi.projectTimeBookingDelete(formatDate(d))
      )
    );

    const { data: existing } = await this.timeBookingApi.timeBookingGet(
      formatDate(from),
      formatDate(to)
    );
    await Promise.all(
      existing.timeSpans
        ?.sort((t1, t2) =>
          t1.type === TimeSpanTypeEnum.Break
            ? 1
            : t2.type === TimeSpanTypeEnum.Break
            ? -1
            : 0
        )
        .map((timespan) =>
          this.timeBookingApi.timeBookingTimeSpanIdDelete(timespan.id)
        ) || []
    );
  }

  async saveFullDay(type: FullDayType, interval: Interval) {
    const timeSpans = mapFullDayTypes(type, interval);
    await this.deleteExistingTimes(interval.start, interval.end);
    await Promise.all(timeSpans.map((timeSpan) => this.saveTimeSpan(timeSpan)));
  }

  private async saveTimeSpan(timeSpan: TimeSpanWithoutID): Promise<void> {
    try {
      await this.timeBookingApi.timeBookingPost(timeSpan);
    } catch (e: any) {
      console.warn(`Failed to save timespan for ${timeSpan.date}`, e as any);
      throw e;
    }
  }

  private async saveProjectTime(timeSpan: ProjectDateTimeSpans): Promise<void> {
    try {
      await this.projectTimebookingApi.projectTimeBookingPost(timeSpan);
    } catch (e: any) {
      console.warn(
        `Failed to save project time for ${timeSpan.date}`,
        e as any
      );
      throw e;
    }
  }

  async getProjects(): Promise<Project[]> {
    return this.projectApi
      .projectGet()
      .then((x) => x.data.projects || [])
      .then((projects) =>
        projects.map((p) => ({
          name: p.projectName || '',
          id: p.projectId || -1,
          activeFrom: parse(
            p.activeFrom ?? '',
            'yyyy-MM-dd',
            startOfDay(new Date())
          ),
          activeTo: p.activeTo
            ? endOfDay(parse(p.activeTo, 'yyyy-MM-dd', new Date()))
            : undefined,
        }))
      );
  }

  async getDays(interval: Interval): Promise<WorkDay[]> {
    const fromStr = formatDate(interval.start);
    const toStr = formatDate(interval.end);

    const { data: timeSpans } = await this.timeBookingApi.timeBookingGet(
      fromStr,
      toStr
    );
    const { data: projectTimes } =
      await this.projectTimebookingApi.projectTimeBookingGet(fromStr, toStr);

    return mapToWorkDay(
      timeSpans.timeSpans || [],
      projectTimes.projectTimeSpans || []
    );
  }

  async lockDays(month: Date, withdraw = false): Promise<void> {
    await this.timeBookingApi.timeBookingCommitPatch(
      month.getFullYear(),
      month.getMonth() + 1,
      false,
      withdraw
    );
  }
}
