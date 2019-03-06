type RoundRobinMCIStrategy = 'round-robin';
type RandomMCIStrategy = 'random';
type SameStateMCIStrategy = 'same-state';

export const ROUND_ROBIN_MCI_STRATEGY: RoundRobinMCIStrategy =
  'round-robin';

export const RANDOM_MCI_STRATEGY: RandomMCIStrategy =
  'random';

export const SAME_STATE_MCI_STRATEGY: SameStateMCIStrategy =
  'same-state';

export enum MCIStrategyEnum {
  'round-robin' = 0,
  'random' = 1,
  'same-state' = 2
}

export type MCIStrategy =
  RoundRobinMCIStrategy |
  RandomMCIStrategy |
  SameStateMCIStrategy;

export const MCIStrategyArr: MCIStrategy[] = [
  ROUND_ROBIN_MCI_STRATEGY,
  RANDOM_MCI_STRATEGY,
  SAME_STATE_MCI_STRATEGY
];
