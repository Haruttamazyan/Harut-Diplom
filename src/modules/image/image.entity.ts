import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { imageEntityName } from '../../constants';

@Entity(imageEntityName)
export class ImageEntity {
  

  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column()
  public url: string;
}
