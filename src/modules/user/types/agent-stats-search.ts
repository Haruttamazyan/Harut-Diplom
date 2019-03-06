type SearchCampaign = 'campaign';
type SearchHourly = 'hourly';
type SearchDaily = 'daily';


export const SEARCH_CAMPAIGN: SearchCampaign = 'campaign';
export const SEARCH_HOURLY: SearchHourly = 'hourly';
export const SEARCH_DAILY: SearchDaily = 'daily';


export type AgentSearch = SearchCampaign | SearchHourly | SearchDaily ;

export const AgentSearchArray: AgentSearch[] = [SEARCH_CAMPAIGN, SEARCH_HOURLY, SEARCH_DAILY];
