type StatusNew = 'new';
type StatusStarted = 'running';
type StatusPaused = 'paused';
type StatusStoped = 'stoped';
type StatusDone = 'done';

export const STATUS_NEW: StatusNew = 'new';
export const STATUS_STARTED: StatusStarted = 'running';
export const STATUS_PAUSED: StatusPaused = 'paused';
export const STATUS_DONE: StatusDone = 'done';
export const STATUS_STOPED:StatusStoped = 'stoped';

export type CampaignStatus = StatusNew | StatusStarted | StatusPaused | StatusDone | StatusStoped;

export const CampaignStatusArray: CampaignStatus[] = [STATUS_NEW, STATUS_STARTED, STATUS_PAUSED, STATUS_DONE,STATUS_STOPED];
