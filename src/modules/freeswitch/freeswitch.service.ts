import { Component, Inject, BadRequestException, MethodNotAllowedException } from '@nestjs/common';
import { Repository } from 'typeorm'
import * as builder from 'xmlbuilder';
import { agentRepositoryToken, userRepositoryToken} from '../../constants';
import { Response } from 'express'
import { UserEntity } from '../user/user.entity'
import { DNL_HOST } from '../../config'

@Component()
export class FreeswitchService {
  constructor (
    
    @Inject(userRepositoryToken)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async getAuthXml (sipUsername: string, ip:string,res:Response) {
    if (ip === '::1' || ip === `::ffff:${DNL_HOST}` || ip === '::ffff:37.252.64.181') {
   
    const user:any = await this.userRepository.findOne({
      select: ['sipUsername', 'sipPassword'],
      where: {
        sipUsername
      }
    });
   // console.log(user)

    if( !user){
      throw new BadRequestException(`Agent or compan-admin with this SipUsername ${sipUsername} is not exist`)
    }
      let params = "<param name=\"dial-string\" value=\"{presence_id=${dialed_user}@${dialed_domain}}${sofia_contact(${dialed_user}@${dialed_domain})}\"/>";
    let stra =  `<document type="freeswitch/xml">
                <section name="directory">
                  <domain name="${DNL_HOST}">
                        <params>
                          ${params}
                        </params>
                            <groups>
                              <group name="default">
                               <users>
                                <user id="${user.sipUsername}">
                                  <params>
                                    <param name="password" value="${user.sipPassword}"/>
                                  </params>
                                </user>
                               </users>
                              </group>
                            </groups>
                  </domain>
                </section>
                </document>`;
                await res.contentType('application/xml');
             res.send(stra)
    }
    throw new BadRequestException(`You can not send requests from this ip = ${ip}`)
  }
  public async checkAuthXml(sipUsername: string){
    const agent = await this.userRepository.findOne({
      select: ['sipUsername', 'sipPassword'],
      where: {
        sipUsername
      }
    });
    if(!agent){
      throw new BadRequestException(`Agent with this SipUsername ${sipUsername} is not exist`)
    }

    if(agent && agent.sipUsername) {
      return builder
      .create('document', { type: 'freeswitch/xml' })
      .ele('section', { name: 'directory' })
      .ele('domain', { name: 'domain1.awesomevoipdomain.faketld' })
      .ele('params')
      .ele('param', {
        name: 'dial-string',
        value: '{presence_id=${dialed_user}@${dialed_domain}}${sofia_contact(${dialed_user}@${dialed_domain})}'
      }).up().up()
      .ele('groups')
      .ele('group', { name: 'default' })
      .ele('users')
      .ele('user', { id: agent.sipUsername })
      .ele('params')
      .ele('param', { name: 'password', value: agent.sipPassword })
      .end({ pretty: true });
    }

  }
}
