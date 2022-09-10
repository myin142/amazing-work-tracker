import { Configuration, DefaultApi, ProjectDateTimeSpans, TimeSpanWithoutID } from '@myin/openapi';
import { formatDate, FullDayType, Project, WorkDay } from '@myin/models';
import { mapFullDayTypes, mapToNewTimespans, mapToWorkDay } from '@myin/work-time-mapper';
import { eachDayOfInterval, Interval } from 'date-fns';
import { RequiredError } from 'libs/openapi/src/lib/base';

export class IMSClient {

  private api: DefaultApi;

  constructor(token: string, baseUrl: string) {
    this.api = new DefaultApi(
      new Configuration({ apiKey: token, basePath: baseUrl })
    );
  }

  async saveDay(workDay: WorkDay) {
    const [timeSpans, projectTimes] = mapToNewTimespans(workDay);

    await this.deleteExistingTimes(workDay.date);

    await Promise.all(
      timeSpans.map((timespan) => this.saveTimeSpan(timespan))
    );

    await Promise.all(
      projectTimes.map((timespan) => this.saveProjectTime(timespan))
    );
  }

  private async deleteExistingTimes(from: Date | number, to: Date | number = from) {
    await Promise.all(eachDayOfInterval({ start: from, end: to }).map(d => this.api.projectTimeBookingDelete(formatDate(d))));

    const { data: existing } = await this.api.timeBookingGet(formatDate(from), formatDate(to));
    await Promise.all(existing.timeSpans?.map(timespan => this.api.timeBookingTimeSpanIdDelete(timespan.id)) || [])
  }

  async saveFullDay(type: FullDayType, interval: Interval) {
    const timeSpans = mapFullDayTypes(type, interval);
    await this.deleteExistingTimes(interval.start, interval.end);
    await Promise.all(timeSpans.map(timeSpan => this.saveTimeSpan(timeSpan)));
  }

  private async saveTimeSpan(timeSpan: TimeSpanWithoutID): Promise<void> {
    try {
      await this.api.timeBookingPost(timeSpan);
    } catch (e: any) {
      console.warn(`Failed to save timespan for ${timeSpan.date}`, (e as RequiredError));
    }
  }

  private async saveProjectTime(timeSpan: ProjectDateTimeSpans): Promise<void> {
    try {
      await this.api.projectTimeBookingPost(timeSpan);
    } catch (e: any) {
      console.warn(`Failed to save project time for ${timeSpan.date}`, (e as RequiredError));
    }
  }

  async getProjects(): Promise<Project[]> {
    return this.api.projectGet().then(x => x.data.projects || [])
      .then(projects => projects.map(p => ({ name: p.projectName || '', id: p.projectId || -1 })));
  }

  async getDays(interval: Interval): Promise<WorkDay[]> {
    const fromStr = formatDate(interval.start);
    const toStr = formatDate(interval.end);

    const { data: timeSpans } = await this.api.timeBookingGet(fromStr, toStr);
    const { data: projectTimes } = await this.api.projectTimeBookingGet(fromStr, toStr);

    return mapToWorkDay(timeSpans.timeSpans || [], projectTimes.projectTimeSpans || []);
  }
}

