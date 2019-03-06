// type LongestWaitingTimeFirstStrategy = 'longest-waiting-time-first';
type EarliestIdleTimeFirstStrategy = 'earliest-idle-time-first';
type LeastCallsFirstStrategy = 'least-calls-first';
type LeastCallTimeFirstStrategy = 'least-call-time-first';

// export const LONGEST_WAITING_TIME_FIRST_STRATEGY: LongestWaitingTimeFirstStrategy =
//   'longest-waiting-time-first';

export const EARLIEST_IDLE_TIME_FIRST_STRATEGY: EarliestIdleTimeFirstStrategy =
  'earliest-idle-time-first';

export const LEAST_CALLS_FIRST_STRATEGY: LeastCallsFirstStrategy =
  'least-calls-first';

export const LEAST_CALL_TIME_FIRST_STRATEGY: LeastCallTimeFirstStrategy =
  'least-call-time-first';

export enum CampaignStrategyEnum {
  'earliest-idle-time-first' = 0,
  'least-calls-first' = 1,
  'least-call-time-first' = 2
}

export type CampaignStrategy =
  // LongestWaitingTimeFirstStrategy |
  EarliestIdleTimeFirstStrategy |
  LeastCallsFirstStrategy |
  LeastCallTimeFirstStrategy;

export const CampaignStrategyArr: CampaignStrategy[] = [
  // LONGEST_WAITING_TIME_FIRST_STRATEGY,
  EARLIEST_IDLE_TIME_FIRST_STRATEGY,
  LEAST_CALLS_FIRST_STRATEGY,
  LEAST_CALL_TIME_FIRST_STRATEGY
];
