import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { OCampaignEntity } from './o-campaign.entity';
import { QuestionType } from '../types';
import { OCampaignOrderTakenFormEntity } from './o-campaign-order-taken-form.entity';
import { oCampaignQuestionEntityName } from '../../../../constants';

@Entity(oCampaignQuestionEntityName)
export class OCampaignQuestionEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  // Entity can have as a parent a campaign or an order taken form
  // But not both at the same time, and not none of them.
  @ManyToOne(() => OCampaignEntity, campaign => campaign.questions, { nullable: false })
  public campaign: OCampaignEntity;

  @ManyToOne(() => OCampaignOrderTakenFormEntity, v => v.questions)
  public orderTakenForm: OCampaignOrderTakenFormEntity;

  @Column({ type: 'varchar' })
  public type: QuestionType;

  @Column()
  public label: string;

  @Column()
  public label_default: string;

  @Column({ type: 'jsonb', nullable: true })
  public choices: string[];
}
