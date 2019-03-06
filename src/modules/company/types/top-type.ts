type agent = 'agent';
type campaign = 'campaign';


export const TOP_AGENT: agent = 'agent';
export const TOP_CAMPAIGN: campaign = 'campaign';

export type ConnectedTop =
agent |
campaign;

export const ConnectedTopArr: ConnectedTop[] = [
    TOP_AGENT,
    TOP_CAMPAIGN
];
