type DirectToAgentAction = 'direct-to-agent';
type PlaybackAction = 'playback';
type IVRAction = 'ivr';

export const DIRECT_TO_AGENT_ACTION: DirectToAgentAction = 'direct-to-agent';
export const PLAYBACK_ACTION: PlaybackAction = 'playback';
export const IVR_ACTION: IVRAction = 'ivr';

export type ConnectedCallAction =
  PlaybackAction |  
  DirectToAgentAction |
  IVRAction;

export const ConnectedCallActionArr: ConnectedCallAction[] = [
  PLAYBACK_ACTION,
  DIRECT_TO_AGENT_ACTION,
  IVR_ACTION
];
