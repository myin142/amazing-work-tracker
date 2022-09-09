import { Configuration, DefaultApi } from '@myin/openapi';
import { formatDate, FullDayType, WorkDay } from '@myin/models';
import { mapFullDayTypes, mapToNewTimespans } from '@myin/work-time-mapper';
import { eachDayOfInterval, Interval } from 'date-fns';

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
      timeSpans.map((timespan) => this.api.timeBookingPost(timespan))
    );

    await Promise.all(
      projectTimes.map((timespan) => this.api.projectTimeBookingPost(timespan))
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
    await Promise.all(timeSpans.map(timeSpan => this.api.timeBookingPost(timeSpan)));
  }

}

