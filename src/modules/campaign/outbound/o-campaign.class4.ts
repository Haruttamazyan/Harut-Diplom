import { Component } from '@nestjs/common';
import * as request from 'request';

import { DNL_BASE_URL, DNL_HOST, DNL_RATE_TABLE_ID,DNL_ROUTING_PLAN_ID } from '../../../config';
//import { resolve } from 'url';
//import { reject } from 'bluebird';

@Component()
export class CampaignClass4Service {
  public async campaignClass4 (campaign: any,  company: any) {
    return new Promise(async (resolve, reject) => {
        let techPrefix:number ;
       /*
        for(let i = 0; i < 6; i++) {
            techPrefix += Math.floor(Math.random() * 10).toString();
        }*/
       
techPrefix = await Math.floor(100000 + Math.random() * 900000);
        console.log('DNL_host----->', DNL_HOST);

        var options = {
            uri: 'http://88.99.175.131/api_dnl/v1/auth',
            method: 'POST',
            json: { 
                "password": "yoo5Iche", 
                "email_or_name": "admin"
            }
        };
            let id = campaign.id
            let objectId = company.object_id
 // console.log('company aystex:::', campaign, id,objectId)

        request(options, function (error: any, response: any, body: any) {
            console.log('dataCalss4:::>', {
                "name": id, 
                "authorization_type": "Authorized by Host Only",
                "carrier_name": "company",
                "media_type": "Bypass Media",
                "host_routing_strategy": "top-down",
                "is_active": true,
                "ip": [ {"port": 5060, "ip": `${DNL_HOST}`} ], 
                "prefixes": [ 
                    { "rate_table_id": `${DNL_RATE_TABLE_ID}`,
                     "tech_prefix": `${techPrefix}`,
                      "routing_plan_id": `${DNL_ROUTING_PLAN_ID}`
                    }
                ]
            })

                   
            if (!error && response.statusCode == 200) {
                let optionsIngress = {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Auth-Token': response.body.payload.token
                    },
                    uri: `${DNL_BASE_URL}/carrier/${objectId}/ingress_trunk`,
                    method: 'POST',
                    json: {
                        "name": id, 
                        "authorization_type": "Authorized by Host Only",
                        "carrier_name": "company",
                        "media_type": "Bypass Media",
                        "host_routing_strategy": "top-down",
                        "is_active": true,
                        "ip": [ {"port": 5060, "ip": `${DNL_HOST}`} ], 
                        "prefixes": [ 
                            { "rate_table_id": `${DNL_RATE_TABLE_ID}`,
                             "tech_prefix": `${techPrefix}`,
                              "routing_plan_id": `${DNL_ROUTING_PLAN_ID}`
                            }
                        ]
                    }
                };

                request(optionsIngress, function (error: any, response: any, body: any) {
                    if(error)
                        reject(error);
                                   // console.log('error------>',error,'body------>',response.body)
                    resolve({class4: body, prefix: techPrefix});
                });
            }
        });
      
         
    });
  }
  public async getCampaignRecords(start:any,end:any){
      return new Promise(async (resolve,reject)=>{

        var options = {
            uri: 'http://localhost:8887',
            method: 'POST'
        };

        request(options, function (error: any, response: any, body: any) {
           
            
           // console.log('token99999:::',JSON.parse(response.body).token)
            const token = JSON.parse(response.body).token
           // console.log('token-->',token)
                const url = 'http://localhost:8888';
            if (!error && response.statusCode == 200) {
                let optionsIngress = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`
                    },
                    uri: `${url}?start_time=${start}&end_time=${end}&format=csv`,
                    method: 'GET'
                };

                request(optionsIngress, function (error: any, response: any, body: any) {
                    if(error)
                        reject(error);
                                  //  console.log('error------>',error,'body------>',response.body)
                    resolve({object: body});
                });
            }
        })

      })
  }

  public async uploadMessage(text:string){
    return new Promise(async (resolve,reject)=>{
        let me = this
      var options = {
          uri: 'http://localhost:8880/v1/tts',
          method: 'POST',
          form:{
              text:text
          }
      };

      request(options, async function (error: any, response: any, body: any) {
        console.log('request11111',body)
     const state_path = JSON.parse(body).state_path
     console.log('state_path--->',state_path)
          const url = `http://localhost:8880${state_path}`
         // console.log('uri--->',url)
          
              let optionsIngress = {
                  uri: url,
                  method: 'GET',
    
              };
              await me.waiting()

            await  request(optionsIngress, async function (error: any, response: any, body: any) {
                console.log('request2222') 
                if(error)
                      reject(error);
                                 // console.log('error------>',error,'body------>',body)
                  resolve( JSON.parse(body).result);
              });
          
      })

    })
}

private async waiting() {

    await new Promise((rsl, rjc) => {
      console.log('Waiting 3sec..');
      setTimeout(() => {
        rsl();
      }, 3000);
    });
        return
       
     }
}
