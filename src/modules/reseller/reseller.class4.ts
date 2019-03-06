import { Component, BadRequestException } from '@nestjs/common'
import * as request from 'request'
import { DNL_BASE_URL } from '../../config'

@Component()
export class ResellerClass4Service {
  public async resellerClass4 (reseller_id:string) {
    return new Promise(async (resolve, reject) => {
        var options = {
            uri: 'http://88.99.175.131/api_dnl/v1/auth',
            method: 'POST',
            json: { 
                'password': 'yoo5Iche',
                'email_or_name': 'admin'
            }
        };
          var token:string
          let me = this
        request(options, async function (error: any, response: any, body: any) {
            if (!error && response.statusCode == 200) {
                token = response.body.payload.token
                // An object of options to indicate where to post to
               // console.log('carriere name:', companyId, 'token:', response.body.payload.token);
                let optionsCarier = {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Auth-Token': response.body.payload.token
                    },
                    uri: `${DNL_BASE_URL}/carrier/full/create`,
                    method: 'POST',
                    json: {
                        'unlimited_credit': true, 
                        'is_prepay': true, 
                        'carrier_name': `${reseller_id}`, 
                        'mode': 'Postpay'
                    }
                };

              await  request(optionsCarier,async function (error: any, response: any, body: any) {
                   // console.log('hereeeeeeeeeeeeeeeeee-->',token)
                    const RateTable:any = await me.RateTable(token,reseller_id)
                    const RoutePLan:any = await me.RoutePLan(token,reseller_id)
                    const DynamicRouting:any = await me.DynamicRouting(token,reseller_id)
                    const addRoute:any = await me.Step4(token,DynamicRouting.object_id,RoutePLan.object_id)
                    const CreateTrunk:any = await me.CreateTrunk(token,response.body.object_id,RateTable.object_id,reseller_id)
                    const addPrefix = await me.addPrefix(token,CreateTrunk.object_id)
                    
                    if(error)
                        reject(error)
                    
                    
                        resolve({
                            createCarier:response.body,
                            RateTable:RateTable,
                            RoutePlan:RoutePLan,
                            DynamicRouting:DynamicRouting,
                            addRoute:addRoute,
                            CreateTrunk:CreateTrunk,
                            addPrefix:addPrefix
                        });
                   
                });
              
            }
        });
    });
  }

  private async RateTable(token:string,reseller_id:string){
    return new Promise(async (resolve, reject) => {
    
                        
        let optionsCarier = {
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token
            },
            uri: `${DNL_BASE_URL}/switch/rate_table/create`,
            method: 'POST',
            json: {
                'billing_method': 'DNIS', 
                'name': `${reseller_id}`, 
                'rate_type_name': 'A-Z',
            }
        };
       
        request(optionsCarier, function (error: any, response: any, body: any) {
          //  console.log('Rate Table',response.body)
            if(error)
                throw new BadRequestException(error)
            
            
                resolve(response.body);
            
        });
        
    })
      
    }

    private async RoutePLan(token:string,reseller_id:string){

        return new Promise(async (resolve, reject) => {
                        
        let optionsCarier = {
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token
            },
            uri: `${DNL_BASE_URL}/route/plan`,
            method: 'POST',
            json: {
                'name': `${reseller_id}`, 
                'is_virtual': true,
            }
        };
        
        request(optionsCarier, function (error: any, response: any, body: any) {
          //  console.log('Route PLan',response.body)
            if(error)
                throw new BadRequestException(error)
            
            
                resolve(response.body);
           
        });
      
    })
    }

    private async DynamicRouting(token:string,reseller_id:string){

        return new Promise(async (resolve, reject) => {
                        
        let optionsCarier = {
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token
            },
            uri: `${DNL_BASE_URL}/route/dynamic`,
            method: 'POST',
            json: {
                'qos_cycle':'not set',
                'name': `${reseller_id}`, 
                'route_rule_name': 'LCR',
            }
        };
       
        request(optionsCarier, function (error: any, response: any, body: any) {
           // console.log('Dynamic Routing',response.body)
            if(error)
                throw new BadRequestException(error)
            
            
                resolve(response.body);
           
        });
     
    })
    }

    private async Step4(token:string,Dynamic_id:string,plan_id:string){

        return new Promise(async (resolve, reject) => {
                        
        let optionsCarier = {
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token
            },
            uri: `${DNL_BASE_URL}/route/plan/${plan_id}/add_route`,
            method: 'POST',
            json: {
                'route_type_flg':'Dynamic Routing',
                'dynamic_route_id': `${Dynamic_id}`,
                
            }
        };
       
        request(optionsCarier, function (error: any, response: any, body: any) {
          //  console.log('Strep4',response.body)
            if(error)
                throw new BadRequestException(error)
            
            
                resolve(response.body);
           
        });
     
    })
    }

    private async CreateTrunk(token:string,carrier_id:string,rate_table_id:string,reseller_id:string){

        return new Promise(async (resolve, reject) => {
                        
        let optionsCarier = {
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token
            },
            uri: `${DNL_BASE_URL}/carrier/${carrier_id}/egress_trunk`,
            method: 'POST',
            json: {
                'auth_type':'Authorized by Host Only',
                'is_active':true,
                'pdd':6000,
                'rate_table_id': `${rate_table_id}`,
                'media_timeout':3600,
                "cps_limit":0,
                'enable_global_404_blocking':true,
                'ring_timeout':60,
                'media_type': 'Proxy Media',
                'name':`${reseller_id}`,
                'ip':[{'port':4587,'ip':'1.3.5.4'}]
                
            }
        };
       
        request(optionsCarier, function (error: any, response: any, body: any) {
           // console.log('CreateTrunk',response.body)
            if(error)
                throw new BadRequestException(error)
            
            
                resolve(response.body);
           
        });
     
    })
    }

    private async addPrefix(token:string,trunk_id:string){

        return new Promise(async (resolve, reject) => {
                        
        let optionsCarier = {
            headers: {
                'Content-Type': 'application/json',
                'X-Auth-Token': token
            },
            uri: `${DNL_BASE_URL}/egress_trunk/${trunk_id}/actions`,
            method: 'PATCH',
            json: {
                "actions": [ { "dnis":{
                     "match_prefix": "123",
                     "max_length": 32, 
                      "min_length": 0,
                      "new_digits": "458",
                      "action": "Add Prefix" 
                    }, 
                    "ani":{ 
                        "match_prefix": "745",
                        "max_length": 32,
                        "min_length": 0,
                        "new_digits": "658",
                        "action": "Add Prefix"
                 } 
                } 
            ]
                
            }
        };
       
        request(optionsCarier, function (error: any, response: any, body: any) {
          //  console.log('addPrefix',response.body)
            if(error)
                throw new BadRequestException(error)
            
            
                resolve(response.body);
           
        });
     
    })
    }

    public async addFee(rate_table_id:number){

        return new Promise(async (resolve, reject) => {
            var options = {
                uri: 'http://88.99.175.131/api_dnl/v1/auth',
                method: 'POST',
                json: { 
                    'password': 'yoo5Iche',
                    'email_or_name': 'admin'
                }
            };
              
            request(options, async function (error: any, response: any, body: any) {
                if (!error && response.statusCode == 200) {
                    let optionsCarier = {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Auth-Token': response.body.payload.token
                        },
                        uri: `${DNL_BASE_URL}/switch/rate_table/${rate_table_id}/rates`,
                        method: 'POST',
                        json: {
                            'rates': [
                                 { 
                                     "effective_date": "2018-12-27 00:00:00+00:00", 
                                     "rate": 1,
                                     "code": "1"
                                 }
                                ]
                            
                        }
                    };
    
                  await  request(optionsCarier,async function (error: any, response: any, body: any) {
                        
                        if(error)
                            reject(error)
                        
                        
                            resolve(response.body);
                       
                    });
                  
                }
            });
        });

    }



  
}
