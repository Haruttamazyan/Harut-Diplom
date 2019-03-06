import { Component, Inject, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AppointmentEntity } from './appointment.entity';
import { appointmentRepositoryToken } from '../../constants';
import { oCampaignRepositoryToken } from '../../constants'
import { OCampaignEntity } from '../campaign/outbound/entities/o-campaign.entity'
import { UnknownCampaignException } from '../campaign/outbound/exceptions';

@Component()
export class AppointmentService {
  constructor (
    @Inject(oCampaignRepositoryToken)
    private readonly oCampaignRepository: Repository<OCampaignEntity>,

    @Inject(appointmentRepositoryToken)
    private readonly appointmentRepository: Repository<AppointmentEntity>
  ) {}

  public async createAppointment(user: any, payload: any) {
    let response: any;
    //console.log(payload)

    if(payload && payload.hasOwnProperty('campaignId')) {
      const campaign = await this.oCampaignRepository.findOneById(payload.campaignId)
    
      if(!campaign)
        throw new UnknownCampaignException(payload.campaignId);

      await this.appointmentRepository.manager.connection.transaction(async manager => {
        const appointment = new AppointmentEntity();
        appointment.campaign = campaign
        appointment.call_uuid = payload.call_uuid ? payload.call_uuid : null
        appointment.contact_id = payload.contact_id ? payload.contact_id : null
        appointment.assignedAgents = payload.assignedAgentsIds ? payload.assignedAgentsIds : null
        appointment.assignedSalesPersons = payload.assignedSalesPersonsIds ? payload.assignedSalesPersonsIds : null
        appointment.created_by_uuid = user.id
        appointment.description = payload.description ? payload.description : null
        appointment.isEnabled = payload.isEnabled ? payload.isEnabled : null
        appointment.scheduled_on = payload.scheduled_on ? payload.scheduled_on : null
        appointment.timeSlot = payload.timeSlot ? payload.timeSlot : null
        appointment.title = payload.title ? payload.title : null
        //appointment.companyid = 
        response = await manager.save(appointment);
        //console.log('response1::', response)
        
      });
      response.campaign_uuid = response.campaign.id
      delete response.campaign
      delete response.assignedAgents
      delete response.assignedSalesPersons
      response.company_id = user.companyId;
      response.assigned_to_agent_uuid = payload.assignedAgentsIds ? payload.assignedAgentsIds : null;

      return response
    } else {
      await this.appointmentRepository.manager.connection.transaction(async manager => {
        const appointment = new AppointmentEntity();
        appointment.call_uuid = payload.call_uuid ? payload.call_uuid : null
        appointment.contact_id = payload.contact_id ? payload.contact_id : null
        appointment.assignedAgents = payload.assignedAgentsIds ? payload.assignedAgentsIds : null
        appointment.assignedSalesPersons = payload.assignedSalesPersonsIds ? payload.assignedSalesPersonsIds : null
        appointment.created_by_uuid = user.id
        appointment.description = payload.description ? payload.description : null
        appointment.isEnabled = payload.isEnabled ? payload.isEnabled : null
        appointment.scheduled_on = payload.scheduled_on ? payload.scheduled_on : null
        appointment.timeSlot = payload.timeSlot ? payload.timeSlot : null
        appointment.title = payload.title ? payload.title : null
        
        response = await manager.save(appointment);
       // console.log('response2::', response)
      });
      response.campaign_uuid = response.campaign.id
      delete response.campaign
      delete response.assignedAgents
      delete response.assignedSalesPersons
      response.company_id = user.companyId;
      response.assigned_to_agent_uuid = payload.assignedAgentsIds ? payload.assignedAgentsIds : null;


      return response
    }
  }

  public async getAppointments(): Promise<AppointmentEntity[]> {
    return this.appointmentRepository.find()
  }

  public async getAppointmentById(id: string): Promise<AppointmentEntity | undefined> {
    return this.appointmentRepository.findOneById(id)
  }

  public async removeAppointmentById(id: string): Promise<any> {
    await this.appointmentRepository.deleteById(id)

    return { "status": "success" }
  }
  

  public async getAppointmentsBetweenDate(date1: string, date2: string) 
  : Promise<AppointmentEntity[]> {
    if(!this.isValidDate(date1) || !this.isValidDate(date2)) {
      throw new BadRequestException(`Please insert correct start and end date. Date should be in format yyyy-mm-dd and should be valid date.`);
    }

    const all:any[] = await this.appointmentRepository.query(`SELECT
                                        *
                                      FROM
                                        "appointment"
                                      WHERE
                                            "scheduled_on" >= '${date1}'
                                        AND "scheduled_on" <=  '${date2}'`)

  
   // days.day = all[0].scheduled_on

  const days = await  all.map((item,index) =>{
      //days[index].day = item.scheduled_on
      return item.scheduled_on
    })
  var count = days.reduce(function(values, v) {
    if (!values[v]) {
      values[v] = 1;
    } else {
    values[v] = ++values[v];
    }
    return values;
    }, {  })
       

    return count
  }

  public async getAppointmentByDate(date: string,companyId:string) {
    if(!this.isValidDate(date)) {
      throw new BadRequestException(`Please insert correct date. Date should be in format yyyy-mm-dd and should be valid date.`);
    }

   /* const app:any[] = await this.appointmentRepository.query(`SELECT
                                        *
                                      FROM
                                        "appointment"
                                      WHERE
                                            "scheduled_on" = '${date}';`)*/

    const test:any = await this.appointmentRepository.find({
      where:{
        scheduled_on: date
      }
    })

     test.map((item:any)=>{

      item.company_id = companyId;
      item.assign_to_aggent_uuid = item.assignedAgents
      delete item.assignedAgents
      delete item.assignedSalesPersonsIds
      return item
     })
     return test
  }


  private isValidDate(dateString: string): boolean {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if(!dateString.match(regEx)) return false;  // Invalid format
    var d = new Date(dateString);
    if(!d.getTime() && d.getTime() !== 0) return false; // Invalid date
    return d.toISOString().slice(0,10) === dateString;
  }

}
