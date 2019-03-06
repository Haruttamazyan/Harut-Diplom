import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn } from 'typeorm';
import { OCampaignEntity } from './o-campaign.entity';
import { OCampaignQuestionEntity } from './o-campaign-question.entity';
import { oCampaignOrderTakenFormEntityName } from '../../../../constants';

@Entity(oCampaignOrderTakenFormEntityName)
export class OCampaignOrderTakenFormEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToOne(() => OCampaignEntity, c => c.orderTakenForm, { nullable: false })
  @JoinColumn()
  public campaign: OCampaignEntity;

  @OneToMany(() => OCampaignQuestionEntity, v => v.orderTakenForm)
  public questions: OCampaignQuestionEntity[];

  @Column()
  public canBeTakenByAgent: boolean;

  @Column()
  public canBeTakenBySalesPerson: boolean;

  @Column()
  public submitAsPostUrl: string;
}
