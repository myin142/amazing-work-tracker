import {
  Configuration,
  ProjectDateTimeSpans,
  TimeSpanWithoutID,
  TimeBookingApi,
  ProjectApi,
  ProjectTimeBookingApi,
  UserinfoApi,
} from '@myin/openapi';
import { formatDate, FullDayType, Project, WorkDay } from '@myin/models';
import {
  mapFullDayTypes,
  mapToNewTimespans,
  mapToWorkDay,
} from '@myin/work-time-mapper';
import { eachDayOfInterval, Interval } from 'date-fns';

export interface UserInfo {
  email: string;
}

export class IMSClient {
  private timeBookingApi: TimeBookingApi;
  private projectApi: ProjectApi;
  private projectTimebookingApi: ProjectTimeBookingApi;
  private userApi: UserinfoApi;

  constructor(token: string, baseUrl: string) {
    const config = new Configuration({ apiKey: token, basePath: baseUrl });

    this.timeBookingApi = new TimeBookingApi(config);
    this.projectApi = new ProjectApi(config);
    this.projectTimebookingApi = new ProjectTimeBookingApi(config);
    this.userApi = new UserinfoApi(config);
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
      existing.timeSpans?.map((timespan) =>
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

  async lockDays(range: Interval, withdraw = false): Promise<void> {
    const fromStr = formatDate(range.start);
    const toStr = formatDate(range.end);
    await this.timeBookingApi.timeBookingCommitPatch(
      fromStr,
      toStr,
      false,
      withdraw
    );
  }
}
