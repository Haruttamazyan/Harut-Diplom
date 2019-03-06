import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm';
import { textTTSName } from '../../constants';
import { CompanyEntity } from './company.entity';
import { textStatus } from './types'
@Entity(textTTSName)
export class textTTSEntity {
  
  @CreateDateColumn()
  public Created_On: Date;

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @ManyToOne(() => CompanyEntity, user => user.textTTS)
  @JoinColumn()
  public Created_By: CompanyEntity;

  @Column({nullable:true})
  public path: string;


  @Column({ type: 'varchar' })
  public status: textStatus;

}
