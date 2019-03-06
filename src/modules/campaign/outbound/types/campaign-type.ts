type BroadcastDialingCampaignType = 'broadcast-dialing';
type PredictiveDialerCampaignType = 'predictive-dialer';
type PowerDialerCampaignType = 'power-dialer';
type PreviewDialerCampaignType = 'preview-dialer';
// type RinglessVoicemailCampaignType = 'ringless-voicemail';

export const BROADCAST_DIALING_CAMPAIGN_TYPE: BroadcastDialingCampaignType =
  'broadcast-dialing';

export const PREDICTIVE_DIALER_CAMPAIGN_TYPE: PredictiveDialerCampaignType =
  'predictive-dialer';

export const POWER_DIALER_CAMPAIGN_TYPE: PowerDialerCampaignType =
  'power-dialer';

export const PREVIEW_DIALER_CAMPAIGN_TYPE: PreviewDialerCampaignType =
  'preview-dialer';

// export const RINGLESS_VOICEMAIL_CAMPAIGN_TYPE: RinglessVoicemailCampaignType =
//   'ringless-voicemail';

export enum CampaignTypeEnum {
  'broadcast-dialing' = "0",
  'predictive-dialer' = "1",
  'preview-dialer' = "2",
  'power-dialer' = "3"
}

export type CampaignType =
  BroadcastDialingCampaignType |
  PredictiveDialerCampaignType |
  PowerDialerCampaignType |
  PreviewDialerCampaignType;
  // RinglessVoicemailCampaignType;

export const CampaignTypeArr: CampaignType[] = [
  BROADCAST_DIALING_CAMPAIGN_TYPE,
  PREDICTIVE_DIALER_CAMPAIGN_TYPE,
  POWER_DIALER_CAMPAIGN_TYPE,
  PREVIEW_DIALER_CAMPAIGN_TYPE
  // RINGLESS_VOICEMAIL_CAMPAIGN_TYPE
];
