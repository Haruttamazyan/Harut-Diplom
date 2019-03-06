import {
  CampaignType,
  CampaignStrategy,
  CampaignStatus,
  MCIStrategy,
  QuestionType,
  ConnectedCallAction,
  DtmfKey,
  DtmfAction
} from '../types';
import { IPaginationQuery, IAuthTokenContent } from '../../../../interfaces';
import { DidEntity } from '../../../user/did.entity';

export interface IQuestion {
  type: QuestionType;
  label: string;
  label_default: string;
  choices?: string[];
}

export interface IAnswer {
  question_uuid: string;
  answer: string;
}

export interface IDid {
  did: number;
}

export interface ITimeSlotDay {
  isEnabled: boolean;
  startHour: string;
  endHour: string;
}

export interface ITimeSlot {
  start_date: string;
  end_date: string;  
  mon: boolean;
  tue: boolean;
  wed: boolean;
  thu: boolean;
  fri: boolean;
  sat: boolean;
  sun: boolean;
  start_time: string;
  end_time: string;  
}

export interface IAppointmentsConfig {
  isEnabled: boolean;
  assignedSalesPersonsIds: string[];
  timeSlot: ITimeSlot;
}

export interface IOrderTakenForm {
  canBeTakenByAgent: boolean;
  canBeTakenBySalesPerson: boolean;
  submitAsPostUrl: string;
  questions: IQuestion[];
}

export interface IDtmf {
  key: DtmfKey;
  action: DtmfAction;
  number?: string
}

export interface IConnectedCallsConfig {
  action: ConnectedCallAction;
  agentsIds?: string[];
  playbackAudioId?: string;
  //introAudioId?: string;
  message?:string;
  dtmf?: IDtmf[];
}

export interface IConnectedCallsAndAgentsConfig {
  agentId: string[];
  outboundCampaignConnectedCallsConfigId?: string;
}

export interface IJoinContactsListToOutboundCampaignPayload {
  contactsListId: string;
}

export interface IJoinQuestionToOutboundCampaignPayload {
  label: string;
  label_default: string;
  type: QuestionType;
  choices?: string[];
}

export interface IConnectedSalesConfig {
  salesId: string[];
  outboundCampaignId?: string;
}

export interface IOutboundCampaign {
  id?: string;
  type: CampaignType;
  name: string;
  status: CampaignStatus;
  strategy?: CampaignStrategy;
  callerIds?: string[];
  breakTimeBetweenCalls?: number;
  MCIStrategy?: MCIStrategy;
  callRatio?: number;
  abandonedMessageId?: string;
  contactsListsIds?: string[];
  script?: string;
  questions?: IQuestion[];
  appointmentsConfig?: IAppointmentsConfig;
  orderTakenForm?: IOrderTakenForm;
  connectedCallsConfig?: IConnectedCallsConfig;
  AutoExecutionControl:boolean;
  timeSlot?: ITimeSlot;
  assignAgents?:string[];
}

export interface ICreateOutboundCampaignPayload {
  user: IAuthTokenContent;
  campaign: IOutboundCampaign;
}

export interface IUpdateOutboundCampaignPayload extends ICreateOutboundCampaignPayload {
  campaignId: string;
}

export interface IDeleteOutboundCampaignPayload {
  user: IAuthTokenContent;
  campaignId: string;
}

export interface IGetOutboundCampaignsPayload extends IPaginationQuery {
  companyId: string;
  isActive?: boolean;
  status?:string
}
