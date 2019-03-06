import { Component, BadRequestException } from '@nestjs/common'
import * as request from 'request'
import { DNL_BASE_URL } from '../../config'

@Component()
export class CompanyClass4Service {
  public async companyClass4 (companyId: string, user:any) {
      //console.log(user)
      //console.log('asdfasf',user.reseller_uuid != ''? `${user.reseller_uuid}`: `${companyId}`)
    return new Promise(async (resolve, reject) => {
        var options = {
            uri: 'http://88.99.175.131/api_dnl/v1/auth',
            method: 'POST',
            json: { 
                'password': 'yoo5Iche',
                'email_or_name': 'admin'
            }
        };
          
        request(options, function (error: any, response: any, body: any) {
            if (!error && response.statusCode == 200) {
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
                        'carrier_name': user.reseller_uuid != ''? `${user.reseller_uuid}-${companyId}`: `${companyId}`, 
                        'mode': 'Postpay'
                    }
                };

                request(optionsCarier, function (error: any, response: any, body: any) {
                    //console.log('hereeeeeeeeeeeeeeeeee')
                    if(error)
                        reject(error)
                    
                    if(response)
                        resolve(response.body);
                    else
                        resolve('no response');
                });
              
            }
        });
    });
  }


  public async endpointRecord (start_time: string, end_time: string, ingress_id: any) {
        //console.log(user)
        //console.log('asdfasf',user.reseller_uuid != ''? `${user.reseller_uuid}`: `${companyId}`)
    return new Promise(async (resolve, reject) => {
        var options = {
            uri: 'http://88.99.175.131/api_dnl/v1/auth',
            method: 'GET',
            json: { 
                'password': 'yoo5Iche',
                'email_or_name': 'admin'
            }
        };
            
        request(options, function (error: any, response: any, body: any) {
            if (!error && response.statusCode == 200) {
                // An object of options to indicate where to post to
                // console.log('carriere name:', companyId, 'token:', response.body.payload.token);
                let optionsCarier = {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Auth-Token': response.body.payload.token
                    },
                    uri: `${DNL_BASE_URL}?start_time=${start_time}&end_time=${end_time}
                    &step=all&method=total&field=calls,non_zero_calls,ingress_billed_time,ingress_cost,ingress_busy_calls&ingress_id=${ingress_id}`,
                    method: 'GET'
                };

                request(optionsCarier, function (error: any, response: any, body: any) {
                    //console.log('hereeeeeeeeeeeeeeeeee')
                    if(error)
                        reject(error)
                    
                    if(response)
                        resolve(response.body);
                    else
                        resolve('no response');
                });
                
            }
        });
    });
    }

    public async addPaymentClass4 (comapny: any, data:any) {
        //console.log(user)
        //console.log('asdfasf',user.reseller_uuid != ''? `${user.reseller_uuid}`: `${companyId}`)
      return new Promise(async (resolve, reject) => {
          var options = {
              uri: 'http://88.99.175.131/api_dnl/v1/auth',
              method: 'POST',
              json: { 
                  'password': 'yoo5Iche',
                  'email_or_name': 'admin'
              }
          };
            
          request(options, function (error: any, response: any, body: any) {
              
              if (!error && response.statusCode == 200) {
                  //console.log('token--->',response.body.payload.token   )
                  // An object of options to indicate where to post to
                 // console.log(`${DNL_BASE_URL}/carrier/${comapny.object_id}/payment`);
                  let optionsCarier = {
                      headers: {
                          'Content-Type': 'application/json',
                          'X-Auth-Token': response.body.payload.token
                      },
                      uri: `${DNL_BASE_URL}/carrier/${comapny.object_id}/payment`,
                      method: 'POST',
                      json: {
                          'paid_on': new Date().toISOString(), 
                          'note': data.note, 
                          'amount': data.amount, 
                          'payment_type': data.payment_type
                      }
                  };
  
                  request(optionsCarier, function (error: any, response: any, body: any) {
                      //console.log('hereeeeeeeeeeeeeeeeee')
                      if(error)
                          reject(error)
                      
                      if(response)
                          resolve(response.body);
                      else
                          resolve('no response');
                  });
                
              }
          });
      });
    }


    public async getBalance (companyId: string,user:any) {
        //console.log(user)
        //console.log('asdfasf',user.reseller_uuid != ''? `${user.reseller_uuid}`: `${companyId}`)
      return new Promise(async (resolve, reject) => {
          var options = {
              uri: 'http://88.99.175.131/api_dnl/v1/auth',
              method: 'POST',
              json: { 
                  'password': 'yoo5Iche',
                  'email_or_name': 'admin'
              }
          };
            
          request(options, function (error: any, response: any, body: any) {
              if (!error && response.statusCode == 200) {
                  // An object of options to indicate where to post to
                 // console.log('carriere name:', companyId, 'token:', response.body.payload.token);
                 const name = user.reseller_uuid != ''? `${user.reseller_uuid}-${companyId}`: `${companyId}`
                // console.log(`${DNL_BASE_URL}/carrier/list?name=null-${name}`)
                 let optionsCarier = {
                      headers: {
                          'Content-Type': 'application/json',
                          'X-Auth-Token': response.body.payload.token
                      },
                      uri: `${DNL_BASE_URL}/carrier/list?name=null-${name}`,
                      method: 'GET'
                  };
  
                  request(optionsCarier, function (error: any, response: any, body: any) {
                      //console.log('hereeeeeeeeeeeeeeeeee')
                      if(error)
                          reject(error)
                      
                      if(response)
                          resolve(response.body);
                      else
                          resolve('no response');
                  });
                
              }
          });
      });
    }
}
