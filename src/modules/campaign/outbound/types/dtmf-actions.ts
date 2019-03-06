type DirectToAgentDtmfAction = 'direct-to-agent';
type DirectToQueueDtmfAction = 'direct-to-queue';
type DirectToPlaybackDtmfAction = 'direct-to-playback';
type DirectToIvrDtmfAction = 'direct-to-ivr';
type AddToDncDtmfAction = 'add-to-DNC';
type DialaNumberDtmfAction = 'dial-a-number';

export const DIRECT_TO_AGENT_DTMF_ACTION: DirectToAgentDtmfAction = 'direct-to-agent';
//export const DIRECT_TO_QUEUE_DTMF_ACTION: DirectToQueueDtmfAction = 'direct-to-queue';
//export const DIRECT_TO_PLAYBACK_DTMF_ACTION: DirectToPlaybackDtmfAction = 'direct-to-playback';
//export const DIRECT_TO_IVR_DTMF_ACTION: DirectToIvrDtmfAction = 'direct-to-ivr';
export const ADD_TO_DNC_DTMF_ACTION: AddToDncDtmfAction = 'add-to-DNC';
export const DIAL_A_NUMBER_DTMF_ACTION: DialaNumberDtmfAction = 'dial-a-number';

export type DtmfAction =
  DirectToAgentDtmfAction |
  //DirectToQueueDtmfAction |
  //DirectToPlaybackDtmfAction |
 // DirectToIvrDtmfAction |
 AddToDncDtmfAction|
 DialaNumberDtmfAction;

export const DtmfActionArr = [
  DIRECT_TO_AGENT_DTMF_ACTION,
  //DIRECT_TO_QUEUE_DTMF_ACTION,
  //DIRECT_TO_PLAYBACK_DTMF_ACTION,
  //DIRECT_TO_IVR_DTMF_ACTION,
  ADD_TO_DNC_DTMF_ACTION,
  DIAL_A_NUMBER_DTMF_ACTION
];
