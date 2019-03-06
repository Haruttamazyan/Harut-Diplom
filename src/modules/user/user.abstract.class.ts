import { PrimaryGeneratedColumn, Column, ManyToOne} from 'typeorm';
import { userFirstName, userLastName, userPassword, userAvatar } from './user.boundaries';

import { UserRole } from './types';

export abstract class User {
    constructor (payload?: { id?: string }) {
        if (payload && payload.id) {
          this.id = payload.id;
        }
      }
    
      @PrimaryGeneratedColumn('uuid')
      public id: string;
    
      /*// Only for users with role "sales"
      @ManyToMany(() => OCampaignAppointmentConfigEntity, v => v.assignedSalesPersons)
      public outboundCampaignAppointments: OCampaignAppointmentConfigEntity[];*/

      @Column({ type: 'varchar' })
      public role: UserRole;

      @Column({ length: userFirstName.maxLength })
      public first_name: string;
    
      @Column({ length: userLastName.maxLength, nullable: true })
      public last_name: string;
    
      @Column({ unique: true })
      public email: string;
    
      @Column({ length: userPassword.maxLength, select: false })
      public password: string;
      
      @Column({ nullable: true })
      public phone: string;

      @Column({ nullable: true, length: userAvatar.maxLength })
      public avatar: string;

      @Column({ nullable: true })
      public belongsTo: string;

      @Column({ nullable: true })
      public forget_password_token: string;
}