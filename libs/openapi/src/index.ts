import { TimeSpanWithIDOffDutyReasonEnum, TimeSpanWithIDTypeEnum } from './lib';

export * from './lib';

export const TimeSpanTypeEnum = { ...TimeSpanWithIDTypeEnum };
export type TimeSpanTypeEnum = TimeSpanWithIDTypeEnum;

export const OffDutyReasonEnum = { ...TimeSpanWithIDOffDutyReasonEnum };
export type OffDutyReasonEnum = TimeSpanWithIDOffDutyReasonEnum;
