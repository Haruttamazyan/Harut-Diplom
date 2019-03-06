import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { oCampaignAnswerEntityName } from '../../../../constants';

@Entity(oCampaignAnswerEntityName)
export class OCampaignAnswerEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ type: 'uuid' })
  public question_uuid: string;

  @Column({ type: 'varchar' })
  public answer: string; 
}
