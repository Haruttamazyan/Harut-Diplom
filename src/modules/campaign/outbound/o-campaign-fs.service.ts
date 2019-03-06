import { Component, BadGatewayException, BadRequestException } from '@nestjs/common';
import { OCampaignEntity } from './entities/o-campaign.entity';
import { MCIStrategyEnum, CampaignTypeEnum, CampaignStrategyEnum } from './types';
import * as fs from 'fs';
import { CAMPAIGNS_JSON_PATH,  DNL_HOST, CONTACTS_STORAGE_PATH, CDR_STORAGE_PATH } from '../../../config';
import { promisify } from 'util';
import { spawn } from 'child_process';
import { isDate } from 'moment';
import { STATUS_REJECTED } from '../../company/types';
const child_process = require('child_process')
const sgMail = require('@sendgrid/mail');

const Telnet = require('telnet-client');
const Netcat = require('node-netcat')
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const deleteFile = promisify(fs.unlinkSync)
interface fileObj {
  leads?: string[];
}

const replaceAll = function(str: string, search: string, replacement: string) {
  var target = str;
  return target.replace(new RegExp(search, 'g'), replacement);
};
/*const child =  spawn('sudo', ['node','index.js'],{
  cwd: '/opt/freeSwitchInterface',
  stdio: ['pipe', 'pipe', 'pipe'],
});*/


@Component()
export class OCampaignFsService {
  public async createFreeswitchCampaign (campaign: OCampaignEntity,abandon_playback_url?:string,update?:boolean) {
    return new Promise(async (resolve, reject) => {
      console.log('asdsfdsggds---->',campaign.connectedCallsConfig)
      let payload:{} = {
        name: campaign.name,
        tz_spec: '+0000',
        start_date: '2018-04-09',
        end_date: '2020-06-28',
        allowed_days: 127,
        weekday_start_time: '0000',
        weekday_end_time: '2359',
        weekend_start_time: '0000',
        weekend_end_time: '2359',
        campaign_type: CampaignTypeEnum[campaign.type],
        enable_amd_on_ringing: false,
        enable_amd_on_answer: false,
        wait_for_amd_on_delay: 10,
        //greeting_media_url: campaign.connectedCallsConfig.introAudio.url,
        did_to_use:campaign.callerIds? campaign.callerIds.map(item=>{  return item.did}):null,
        match_local_call: false,
        agents: [],
        onhook: true,
        ratio: campaign.callRatio?campaign.callRatio:null,
        agent_selection_strategy: 0, //CampaignStrategyEnum[campaign.strategy],
        break_time_between_calls: 15, //campaign.breakTimeBetweenCalls,
        multi_did_strategy:campaign.MCIStrategy? MCIStrategyEnum[campaign.MCIStrategy]:null,
        abandon_playback_url:/*'/home/khachatryan/data/recordings/afcc1eaf-0227-44e1-9217-5dabe3fa87fe.mp3',*/ abandon_playback_url?abandon_playback_url:null,
        broadcast_src:  campaign.connectedCallsConfig[0].action == 'ivr'? campaign.connectedCallsConfig[0].playbackAudio?campaign.connectedCallsConfig[0].playbackAudio.url:campaign.connectedCallsConfig[0].file:campaign.connectedCallsConfig[0].action == 'playback'? campaign.connectedCallsConfig[0].playbackAudio?campaign.connectedCallsConfig[0].playbackAudio.url:campaign.connectedCallsConfig[0].file: 'https://api.twilio.com/cowbell.mp3',
        dnc_dtmf: campaign.connectedCallsConfig[0].dtmf?campaign.connectedCallsConfig[0].dtmf[0].action == 'add-to-DNC'?campaign.connectedCallsConfig[0].dtmf[0].key:null :null,
        dtmf_to_agent:campaign.connectedCallsConfig[0].dtmf?campaign.connectedCallsConfig[0].dtmf[0].action == 'direct-to-agent'?campaign.connectedCallsConfig[0].dtmf[0].key:null :null,
        dtmf_to_external:campaign.connectedCallsConfig[0].dtmf?campaign.connectedCallsConfig[0].dtmf[0].action == 'dial-a-number'?campaign.connectedCallsConfig[0].dtmf[0].key:null :null,
        dtmf_to_external_url: campaign.connectedCallsConfig[0].dtmf?campaign.connectedCallsConfig[0].dtmf[0].action == 'dial-a-number'?`sofia/internal/${campaign.prefix}${campaign.connectedCallsConfig[0].dtmf[0].number}@${DNL_HOST}:5090`:null :null,
        dialplan_url: null,
        recycle_option: 0,
        recycle_delay: 30,
        recycle_max_retry: 0,
        cps: 10
      };
            /*console.log('paylod---',payload)
         
     const path = `${CAMPAIGNS_JSON_PATH}/${campaign.id}.json`;
    
     await writeFile(path, JSON.stringify(payload));*/


      //let command = `sudo -i /root/mod_campaign_dialling/tools/mcd-cmd.sh  localhost 54322 "mcd campaign create"  ${path} `
      //let ok = await this.lastCommandToStartCampaignPromiseSecond(command)

        payload = JSON.stringify(payload)
        let command
        if(update){
           command = `mcd campaign modify ${campaign.MCD_id} ${payload}`
        } else{
         command = `mcd campaign create ${payload}`
        }
      console.log('command-->',command)  

       await this.ncat(command)
          .then((res) => {
            console.log('fs service -->',res)
            if(res.toString().substring(1, 3) === 'OK'){
              resolve(res.toString().slice(res.toString().indexOf('OK') + 3,res.toString().indexOf('\n')))
            } else {
              reject(res)
            }
       })
        .catch((err) => {
         console.log('err--<',err)
             // throw new BadRequestException(err);
            reject(err)
             //return err
       });
      /*  console.log('ok-->',ok)
        if(ok.error){
          throw new BadRequestException(ok.error)
        }
        if(ok.toString().lastIndexOf('cat:') > 0){
          reject(ok)
        }
        if(ok.toString().substring(1, 3) === 'OK'){
          //let aa = ok.toString().replace('+OK ', "")
          resolve(ok.toString().slice(ok.toString().indexOf('OK') + 3,ok.toString().indexOf('\n')))
        }*/


  
         
    })
  }

  public async joinFreeswitchContactsList(campaign: any, contact_list: any) {
   // console.log('asfasf',contact_list.id,'asfas', campaign.id)
    return new Promise(async (resolve, reject) => {
     
      if(contact_list) {
        const path = `${CONTACTS_STORAGE_PATH}/${campaign.id}___${contact_list.id}.json`;
      let fileContent = '';
     // console.log('lead_path---',path)
      if(fs.existsSync(path))
        fileContent = await readFile(path, 'utf8');
          let commandJson:{}
        if(fileContent) {
          let content = JSON.parse(fileContent);
          //for(let i=0; i<contact_list.cantacts_info.length)
          contact_list.contacts_info.forEach(async (item: any) => {  
  
          content.leads.push('sofia/internal/'+ campaign.prefix + item.phone_number + `@${DNL_HOST}:5090`);
          })
          console.log('lead_file_file_content---',content)
          commandJson = JSON.stringify(content)
          await writeFile(path, JSON.stringify(content));
        } else {
          let  file: fileObj = {leads: []};
          contact_list.contacts_info.forEach(async (item: any) => {  
              file.leads.push('sofia/internal/'+ campaign.prefix + item.phone_number + `@${DNL_HOST}:5090`);
              })
              console.log('lead_file_file_content1---',file)
              commandJson = JSON.stringify(file)
          await writeFile(path, JSON.stringify(file));
        }

       /* let command = `sudo /root/mod_campaign_dialling/tools/mcd-cmd.sh  localhost 54322 "mcd campaign leads add ${campaign.MCD_id}"  ${path} `
        let ok = await this.lastCommandToStartCampaignPromiseSecond(command)
        console.log('ok-->',ok)*/
        let command = `mcd campaign leads add ${campaign.MCD_id} ${commandJson}`
        console.log('command-->',command)  

        await this.ncat(command)
           .then((res) => {
             console.log('fs service -->',res)
             if(res.toString().substring(1, 3) === 'OK'){
               resolve(res.toString().slice(res.toString().indexOf('OK') + 3,res.toString().indexOf('\n')))
             } else {
               reject(res)
             }
        })
         .catch((err) => {
          console.log('err-->',err)
              // throw new BadRequestException(err);
             reject(err)
              //return err
        });

        /*if(ok.toString().lastIndexOf('cat:') > 0){
          reject(ok)
        }
        if(ok.toString().substring(1, 3) === 'OK'){
          //let aa = ok.toString().replace('+OK ', "")
          resolve(ok.toString().slice(ok.toString().indexOf('OK') + 3,ok.toString().indexOf('\n')))
        }
        resolve({
          success:false,
          response:ok.toString()
        })*/

      } else{
        reject();
      }

      
    });
  }

  public async startFreeswitchCampaign(mcd_id: string) {
    return new Promise(async (resolve, reject) => {

     // let command = `sudo -i /usr/local/freeswitch/bin/fs_cli -x "mcd campaign start ${mcd_id}"`
     //   let ok = await this.lastCommandToStartCampaignPromiseSecond(command)
        let command = `api mcd campaign start ${mcd_id}`;
        console.log('start command-->',command)
         await this.TelNet(command)
         .then((res)=>{
          console.log('fs service start -->',res)
          console.log(res.toString().lastIndexOf('STARTED'))
          if(res.toString().lastIndexOf('STARTED') > 0){
            resolve({
              success:true,
              response:`+OK Campaign [${mcd_id}] STARTED`
            })
          } else {
            reject(res)
          }

         })
         .catch((err)=>{
           reject(err)
         })

/*
        if(ok.toString().lastIndexOf('cat:') > 0){
          //console.log('rej')
          reject(ok)
        }
        if(ok.toString().lastIndexOf('STARTED') > 0){
         // console.log('asenq',ok.toString().replace('+OK ', ""))
          //let aa = ok.toString().replace('+OK ', "")
          resolve ({
            success:true,
            response:`+OK Campaign [${mcd_id}] STARTED`
          })
        }
        //console.log('tuft')
        resolve({
          success:false,
          response:ok.toString()
        })*/


      

    });
  }

  public async stopFreeswitchCampaign(mcd_id: string) {
    return new Promise(async (resolve, reject) => {

     // let command = `sudo -i /usr/local/freeswitch/bin/fs_cli -x "mcd campaign stop ${mcd_id}"`
       // let ok = await this.lastCommandToStartCampaignPromiseSecond(command)
        //console.log('ok-->',ok)

        let command = `api mcd campaign stop ${mcd_id}`;
        console.log('start command-->',command)
         await this.TelNet(command)
         .then((res)=>{
          console.log('fs service start -->',res)
          console.log(res.toString().lastIndexOf('STOPPED'))
          if(res.toString().lastIndexOf('STOPPED') > 0){
            resolve({
              success:true,
              response:`+OK Campaign [${mcd_id}] STOPPED`
            })
          } else {
            reject(res)
          }

         })
         .catch((err)=>{
           reject(err)
         })

        /*
        if(ok.toString().lastIndexOf('cat:') > 0){
          reject(ok)
        }
        if(ok.toString().lastIndexOf('STOPPED') > 0){
          //console.log('test')
          resolve ( {
            success:true,
            response:`+OK Campaign [${mcd_id}] STOPPED`
          }
            )
        }
        resolve({
          success:false,
          response:ok.toString()
        })*/

      /*
      const command = `api mcd campaign stop ${mcd_id}`;
 
        //console.log('command', command)
  const child = await spawn('sudo', ['node','index.js'],{
   cwd: '/opt/freeSwitchInterface',
   stdio: ['pipe', 'pipe', 'pipe'],
 });

  await child.stdin.setEncoding('utf-8');

   await this.waiting()
   
  await  child.stdin.write(`${command}\n`);
   
  child.stdout.on('data', function(data){
      //console.log('123123',data.toString())
   if(data.toString().lastIndexOf('STOPPED') > 0){
     //console.log(1,data.toString())
        child.stdin.end();
        resolve ( {
          success:true,
          response:`+OK Campaign [${mcd_id}] STOPPED`
        }
          )
   } else if(data.toString().lastIndexOf('already') > 0){
   // console.log(1,data.toString())
       child.stdin.end();
       resolve ({
        success:false,
        response:`-ERR Campaign [${mcd_id}] already stopped`
      }
         )
  } else if(data.toString().lastIndexOf('is not running') > 0){
    //console.log(1,data.toString())
       child.stdin.end();
       resolve ({
        success:false,
        response:`-ERR Campaign [${mcd_id}] is not running`
      })
  }
   });
   child.stderr.on('data', (data) => {
   // console.log(`stderr: ${data}`);
     reject(data)
   });
   
   child.on('close', (code) => {
    // console.log(`child process exited with code ${code}`);
   });
   setTimeout(function() {
     child.stdin.end();
   }, 3000);
   */

    });
  }

  public async pauseFreeswitchCampaign(mcd_id: string) {
    return new Promise(async (resolve, reject) => {

    //  let command = `sudo -i /usr/local/freeswitch/bin/fs_cli -x "mcd campaign pause ${mcd_id}"`
     //   let ok = await this.lastCommandToStartCampaignPromiseSecond(command)
       // console.log('ok-->',ok)

       let command = `api mcd campaign pause ${mcd_id}`;
       console.log('start command-->',command)
        await this.TelNet(command)
        .then((res)=>{
         console.log('fs service start -->',res)
         console.log(res.toString().lastIndexOf('PAUSED'))
         if(res.toString().lastIndexOf('PAUSED') > 0){
           resolve({
             success:true,
             response:`+OK Campaign [${mcd_id}] PAUSED`
           })
         } else {
           reject(res)
         }

        })
        .catch((err)=>{
          reject(err)
        })



       /*
        if(ok.toString().lastIndexOf('cat:') > 0){
          reject(ok)
        }
        if(ok.toString().lastIndexOf('PAUSED') > 0){
          //let aa = ok.toString().replace('+OK ', "")
          resolve ( {
            success:true,
            response:`+OK Campaign [${mcd_id}] PAUSED`
          }
            )
        }
        resolve({
          success:false,
          response:ok.toString()
        }
          )*/
      

     

    });
  }
  public async joinFreeswitchAgent(campaign: any, sip_id: string) {
    // console.log('asfasf',contact_list.id,'asfas', campaign.id)
     return new Promise(async (resolve, reject) => {

     // let command = `sudo -i /usr/local/freeswitch/bin/fs_cli -x "mcd campaign agent register ${campaign.MCD_id} user/${sip_id}"`
       // let ok = await this.lastCommandToStartCampaignPromiseSecond(command)
       // console.log('ok-->',ok)

       let command = `api mcd campaign agent register ${campaign.MCD_id} user/${sip_id}`
       console.log('join command-->',command)
       await this.TelNet(command)
       .then((res)=>{
        console.log('fs service join -->',res)
        console.log(res.toString().indexOf('+OK'))
        if(res.toString().lastIndexOf('+OK') > 0){
          resolve(res.toString().slice(res.toString().indexOf('uuid') + 8,res.toString().lastIndexOf('"')))
        } else {
          reject(res)
        }

       })
       .catch((err)=>{
         reject(err)
       })
        

       /*
        if(ok.toString().lastIndexOf('cat:') > 0){
          reject(ok)
        }
        if(ok.toString().substring(1, 3) === 'OK'){
          //let aa = ok.toString().replace('+OK ', "")
          resolve(ok.toString().slice(ok.toString().indexOf('uuid') + 8,ok.toString().lastIndexOf('"')))
        }
        resolve({
          success:false,
          response:ok.toString()
        })*/
          /*
            const command = 'assign-agent user/' + sip_id + ' ' + campaign.MCD_id;
                
             const child = await spawn('sudo', ['node','index.js'],{
               cwd: '/opt/freeSwitchInterface',
               stdio: ['pipe', 'pipe', 'pipe'],
               
             });
 
             await child.stdin.setEncoding('utf-8');
             await this.waiting()
               
                 await  child.stdin.write(`${command}\n`);
                 
             await child.stdout.on('data', function(data:any){
               //console.log("DATA:",data.toString())
               if(data.toString().lastIndexOf('already') > 0){
                   child.stdin.end();
                   resolve (false)
              } else if(data.toString().lastIndexOf('+OK') > 0){
                child.stdin.end();
                //console.log('test---->',data.toString().slice(data.toString().indexOf('uuid') + 8,data.toString().lastIndexOf('"')))
                resolve (data.toString().slice(data.toString().indexOf('uuid') + 8,data.toString().lastIndexOf('"')))
                //resolve (true)
           }else if(data.toString().lastIndexOf('No such') > 0){
           // console.log(1,data.toString())
               child.stdin.end();
               resolve ('No such')
               }
               });

               child.stderr.on('data', (data) => {
                 console.log(`stderr: ${data}`);
                 reject(data)
                 
               });
               
               child.on('close', (code) => {
                 console.log(`child process exited with code ${code}`);
               });
               setTimeout(function() {
                 child.stdin.end();
               }, 5000);
               */
     });
   }

   public async leaveFreeswitchAgent(campaign: any, sip_id: string) {
    // console.log('asfasf',contact_list.id,'asfas', campaign.id)
     return new Promise(async (resolve, reject) => {

      //let command = `sudo -i /usr/local/freeswitch/bin/fs_cli -x "mcd campaign agent unregister ${campaign.MCD_id} user/${sip_id}"`
       // let ok = await this.lastCommandToStartCampaignPromiseSecond(command)
       let command = `api mcd campaign agent unregister ${campaign.MCD_id} user/${sip_id}`
       console.log('unjoin command-->',command)
       await this.TelNet(command)
       .then((res)=>{
        console.log('fs service unjoin -->',res)
        
        if(res.toString().lastIndexOf('+OK') > 0){
          resolve({ success:true,
            response:res.toString()
          })
        } else {
          reject(res)
        }

       })
       .catch((err)=>{
         reject(err)
       })


        /*
        if(ok.toString().lastIndexOf('cat:') > 0){
          reject(ok)
        }
        if(ok.toString().substring(1, 3) === 'OK'){
         // console.log('ok++++')
          //let aa = ok.toString().replace('+OK ', "")
          resolve({ success:true,
            response:ok.toString()
          })
        }
        resolve({
          success:false,
          response:ok.toString()
        })
        */
          
     });
   }



   public async getstats(id:string){
     //console.log('query--->',`SELECT SUM(\"duration\")  FROM \"cdr\" WHERE \"campaign_uuid\"='${id}'`)
      const count = await this.getcountall(id,false)
      //console.log('coount--->',count)
      const countbymonth = await this.getcountall(id,true)
      //console.log('coount--->',countbymonth)
      const duration = await this.getsumduration(id,false)
      //console.log('duration--->',duration)
      const durationbymonth = await this.getsumduration(id,true)
      //console.log('duration--->',durationbymonth)
      const avg = await this.getavgCallduration(id,false)
      //console.log('avg--->',avg)
      const avgbymonth = await this.getavgCallduration(id,true)
      //console.log('avg--->',avgbymonth)

      return {
        "number of calls":count,
        "number of calls by month":countbymonth,
        "total duration":duration,
        "duration by month":durationbymonth,
        "avg":avg,
        "avg by month":avgbymonth
        }


        }

    public async getRealTimeStats(ids:string[]){


       const campaigns:any[] =  await this.summary()
       console.log('first--->',campaigns.length)

       const campaign = campaigns.filter((item)=> (ids.includes(item.uuid)))
        console.log('2222___>',campaign.length)
       
         return campaign
      


    }

        private async getcountall(id:string,month?:boolean){
          return new Promise(async (resolve, reject) => {
            
            if(month){
            const bat =  spawn('psql', ['-U', 'postgres','-d','mcd','-c',`SELECT count(*), date_trunc('month',\"timestamp\") FROM \"cdr\" WHERE \"campaign_uuid\"='${id}' group by date_trunc('month',\"timestamp\")`]);
             bat.stdout.on('data', (data) => {
               let count = data.toString().slice(data.toString().lastIndexOf('|') - 2,data.toString().lastIndexOf('|')-1)
                let date = data.toString().slice(data.toString().lastIndexOf('|') + 2,data.toString().lastIndexOf('(1')-1)
               //console.log(1,data.toString());
              resolve({
                count:count,
                date_trunc:date
              })
            });
            
            bat.stderr.on('data', (data) => {
              //console.log(2,data.toString());
              if(data.toString().lastIndexOf('does not exist') > 0){
                
                resolve ((data.toString().slice(data.toString().indexOf('ERROR'),data.toString().indexOf('\n'))))
              }
              resolve(data.toString())
            });
            
            bat.on('exit', (code) => {
              //console.log(`Child exited with code ${code}`);
            });
            
            } else{
             const  bat =  spawn('psql', ['-U', 'postgres','-d','mcd','-c',`SELECT count(*) FROM \"cdr\" WHERE \"campaign_uuid\"='${id}'`]);
              
               bat.stdout.on('data', (data) => {
               // console.log(1,data.toString());
                resolve(data.toString().slice(data.toString().indexOf('(1') - 2,data.toString().indexOf('(1') - 1))
                
              });
              
              bat.stderr.on('data', (data) => {
                //console.log(2,data.toString());
                if(data.toString().lastIndexOf('does not exist') > 0){
                  
                  resolve ((data.toString().slice(data.toString().indexOf('ERROR'),data.toString().indexOf('\n'))))
                }
                resolve(data.toString())
              });
              
              bat.on('exit', (code) => {
                console.log(`Child exited with code ${code}`);
              });
            
              }
            
           })
        }


      private async getsumduration(id:string,month?:boolean){
        return new Promise(async (resolve, reject) => {
          
          if(month){
         const  bat =  spawn('psql', ['-U', 'postgres','-d','mcd','-c',`SELECT SUM(\"duration\"), date_trunc('month',\"timestamp\")  FROM \"cdr\" WHERE \"campaign_uuid\"='${id}' group by date_trunc('month',\"timestamp\")`]);
            
           bat.stdout.on('data', (data) => {
            let sum = data.toString().slice(data.toString().lastIndexOf('|') - 5,data.toString().lastIndexOf('|')-1)
                let date = data.toString().slice(data.toString().lastIndexOf('|') + 2,data.toString().lastIndexOf('(1')-1)
               //console.log(1,data.toString());
              resolve({
                sum:sum,
                date_trunc:date
              })
          });
          
          bat.stderr.on('data', (data) => {
            //console.log(2,data.toString());
            if(data.toString().lastIndexOf('does not exist') > 0){
              
              resolve ((data.toString().slice(data.toString().indexOf('ERROR'),data.toString().indexOf('\n'))))
            }
            resolve(data.toString())
          });
          
          bat.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
          });
          }else{
         const   bat =  spawn('psql', ['-U', 'postgres','-d','mcd','-c',`SELECT SUM(\"duration\") FROM \"cdr\" WHERE \"campaign_uuid\"='${id}'`]);
            
            bat.stdout.on('data', (data) => {
              //console.log(2,data.toString());
              resolve(data.toString().slice(data.toString().indexOf('(1') - 2,data.toString().indexOf('(1') - 1))
            });
            
            bat.stderr.on('data', (data) => {
              //console.log(2,data.toString());
              if(data.toString().lastIndexOf('does not exist') > 0){
                
                resolve ((data.toString().slice(data.toString().indexOf('ERROR'),data.toString().indexOf('\n'))))
              }
              resolve(data.toString())
            });
            
            bat.on('exit', (code) => {
              console.log(`Child exited with code ${code}`);
            });
          }
          
         })

      }

      private async getavgCallduration(id:string,month?:boolean){
        return new Promise(async (resolve, reject) => {
          
          if(month){
         const  bat =  spawn('psql', ['-U', 'postgres','-d','mcd','-c',`SELECT count(*), date_trunc('month',\"timestamp\")  FROM \"cdr\" WHERE \"campaign_uuid\"='${id}' AND \"duration\" != 0  group by date_trunc('month',\"timestamp\")`]);
            
           bat.stdout.on('data', (data) => {
             if(data.toString().indexOf('0 rows') > 0){
               resolve('0')
             }
             let count = data.toString().slice(data.toString().lastIndexOf('|') - 5,data.toString().lastIndexOf('|')-1)
             let date = data.toString().slice(data.toString().lastIndexOf('|') + 2,data.toString().lastIndexOf('(1')-1)
            //console.log(1,data.toString());
           resolve({
             count:count,
             date_trunc:date
           })
          });
          
          bat.stderr.on('data', (data) => {
           // console.log(3,data.toString());
            if(data.toString().lastIndexOf('does not exist') > 0){
              
              resolve ((data.toString().slice(data.toString().indexOf('ERROR'),data.toString().indexOf('\n'))))
            }
            resolve(data.toString())
          });
          
          bat.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
          });
          } else{
         const   bat =  spawn('psql', ['-U', 'postgres','-d','mcd','-c',`SELECT count(*)  FROM \"cdr\" WHERE \"campaign_uuid\"='${id}' AND \"duration\" != 0`]);
            
            bat.stdout.on('data', (data) => {
              //console.log(3,data.toString());
              resolve(data.toString().slice(data.toString().indexOf('(1') - 2,data.toString().indexOf('(1') - 1))
            });
            
            bat.stderr.on('data', (data) => {
             // console.log(3,data.toString());
              if(data.toString().lastIndexOf('does not exist') > 0){
                
                resolve ((data.toString().slice(data.toString().indexOf('ERROR'),data.toString().indexOf('\n'))))
              }
              resolve(data.toString())
            });
            
            bat.on('exit', (code) => {
              console.log(`Child exited with code ${code}`);
            });
          }
          
         })

      }

    public async summary(){
      return new Promise(async (resolve, reject) => {

        let command = `api mcd campaign list`;

    let terminal:string = await this.TelNet(command)
        .then((response) => {
          console.log('summaryyyy__>',response.toString().includes('+OK'))
          if(response.toString().indexOf('{')){
            console.log('ok======')
            return response.toString();
          }else{
            console.log('errrorrrr===')
            reject(response)
          }
        })
        .catch((err) => {
         // console.log(`error campaign stats`)
            reject(err)
        });
        //console.log('getCampaignStatByMCD-->',terminal)

    let value = terminal.substring(terminal.indexOf('{'), terminal.length);
          //console.log(value)
        resolve( await JSON.parse(value).campaigns);

        });
      }

      public async outgoing(id:string){
        return new Promise(async (resolve, reject) => {
            const bat =  spawn('psql', ['-U', 'postgres','-d','mcd','-c',`SELECT * FROM \"cdr\" WHERE \"campaign_uuid\"='${id}'`]);
          
          bat.stdout.on('data', (data) => {
            let fileContent = data.toString()
                fileContent = replaceAll(fileContent,'[|]', ',');
                fileContent = replaceAll(fileContent,'[--]', '');
                fileContent = replaceAll(fileContent,'[++++++++++++++]', '').replace(/[ ]/g,'');
                fileContent = fileContent.replace('(9rows)','')
                const obj = require('papaparse').parse(fileContent,{header:true}).data
                 obj.shift()
                 obj.splice(obj.length-3)
                 for(let i = 0; i< obj.length;++i){
                   //console.log(obj[i])
                   obj[i].campaign_name = obj[i].campaign_uuid
                   delete obj[i].campaign_uuid

                 }
            resolve(obj)
          });
          
          bat.stderr.on('data', (data) => {
           // console.log(2,data.toString());
            if(data.toString().lastIndexOf('does not exist') > 0){
              
              resolve ((data.toString().slice(data.toString().indexOf('ERROR'),data.toString().indexOf('\n'))))
            }
            resolve(data.toString())
          });
          
          bat.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
          });
         })

      }

      public async allcam(id:string){
        return new Promise(async (resolve, reject) => {
            const bat = await spawn('psql', ['-U', 'postgres','-d','mcd','-c',`SELECT * FROM \"cdr\"`]);

            const path = `${CAMPAIGNS_JSON_PATH}/${id}.csv`;
         await bat.stdout.on('data',async (data) => {
             /*   let fileContent = data.toString()
                fileContent = replaceAll(fileContent,'[|]', ',');
                fileContent = replaceAll(fileContent,'[--]', '');
                fileContent = replaceAll(fileContent,'[++++++++++++++]', '').replace(/[ ]/g,'');
             await writeFile(path, fileContent);*/
             //console.log(23132465465, fileContent)
            // console.log("reafing---> ",await readFile(path, 'utf8'))
                resolve(data.toString())
          });
  
          bat.stderr.on('data', (data) => {
            //console.log(2,data.toString());
            if(data.toString().lastIndexOf('does not exist') > 0){
              
              resolve ((data.toString().slice(data.toString().indexOf('ERROR'),data.toString().indexOf('\n'))))
            }
            resolve(data.toString())
          });
          
          bat.on('exit', (code) => {
            console.log(`Child exited with code ${code}`);
          });
         })

      }

     
      private async commandPromise (command:any)  {
        
        return new Promise((resolve, reject) => {
            child_process.exec(command,{maxBuffer: 1024 * 500}, (error:any, stdout:any, stderr:any) => {
              
                if (error) return reject(error);
                if (stderr) return reject(stderr);
                return resolve(stdout)
            })
        })
    };

    private async lastCommandToStartCampaignPromiseSecond (command:string)  {
           let terminal = await this.commandPromise(command)
          .then((response) => {
            
              return response;
          })
          .catch((err) => {
            console.log('err--<',err)
                throw new BadRequestException(err);
                //return err
          });
  
      return terminal;
  };

  public async getCampaignStatByMCD(id:string){
    let command = `api mcd campaign list`;

    let terminal:string = await this.TelNet(command)
        .then((response) => {
          if(response.toString().indexOf('+OK') > 0){
            return response.toString();
          }else{
            throw new BadRequestException(response)
          }
        })
        .catch((err) => {
         // console.log(`error campaign stats`)
            throw new BadRequestException(err)
        });
        //console.log('getCampaignStatByMCD-->',terminal)

    let value = terminal.substring(terminal.indexOf('+OK') + 4, terminal.length);
    let all_campaigns_statistics = await JSON.parse(value).campaigns;
    let arr = [];
    for (let i = 0; i < all_campaigns_statistics.length; i++) {
        if (all_campaigns_statistics[i].uuid = id) {
            arr.push(all_campaigns_statistics[i]);
            break;
        }
    }
    return arr

  }

  public async callsStatistics(id:string) {
    let command = `api mcd campaign list active_calls ${id}`;
    let terminal:string = await this.TelNet(command)
        .then((response) => {
          if(response.toString().indexOf('+OK') > 0){
            return response.toString();
          }else{
            throw new BadRequestException(response)
          }
        })
        .catch((err) => {
         // console.log(`error campaign callsStatistics`)
          throw new BadRequestException(err)
        });
        if(terminal.lastIndexOf('No such')) throw new BadRequestException(`-ERR No such campaign [${id}]`)
       // console.log('getCampaignStatByMCD-->',terminal)
    let new_value = await terminal.substring(terminal.indexOf('+OK') + 4, terminal.length);
    let old_symbol = "\n";
    let new_symbol = "";
    return await new_value.split(old_symbol).join(new_symbol);
  }

  public async ShowRegistrations(){
    let command = 'api show registrations';
    let terminal:string = await this.TelNet(command)
        .then((response) => {
            return response.toString();
        })
        .catch((err) => {
         // console.log(`error showing registrations`)
          throw new BadRequestException(err)
        });
       // console.log('showing registrations-->',terminal)
    /*let new_value = await terminal.substring(4, terminal.length);
    let old_symbol = "\n";
    let new_symbol = "";
    return await new_value.split(old_symbol).join(new_symbol);*/
    return terminal
  }

  public async getParkedCalls(data:any){
    let response = 0;
    await data.active_leads.forEach((entity:any) => {
        if (entity.rang_at.secs !== 0 || entity.rang_at.nsecs !== 0 || entity.answered_at.secs !== 0 || entity.answered_at.nsecs !== 0) {
            response += 1
        }
    });
    return response
  }
  public async getLiveVariableForResponse(data:any){
    let response = 0;
    await data.active_leads.forEach((entity:any) => {
        if (entity.answered_at.secs !== 0 || entity.answered_at.nsecs !== 0) {
            response += 1;
        }
    });
    return response
  }
  public async countAgentUuid(data:any){
    let response = 0;
    await data.active_leads.forEach((entity:any) => {
        if (entity.agent_uuid !== null) {
            response += 1;
        }
    });
    return response
  }

  public async endpointRecord (start_time: string, end_time: string, ingress_id: any) {
    return new Promise(async (resolve, reject) => {
      const bat = await spawn('psql', ['-U', 'postgres','-d','mcd','-c',`SELECT * FROM \"cdr\"`]);

     // console.log("bat", bat);
    })
  }

  public async getListOfActiveCallsForLive(id:string) {
    let command = `api mcd campaign list active_calls ${id}`;
    let terminal:string = await this.TelNet(command)
        .then((response) => {
          if(response.toString().indexOf('+OK') > 0){
            return response.toString();
          }else{
            throw new BadRequestException(response)
          }
        })
        .catch((err) => {
         // console.log(`error campaign callsStatistics`)
          throw new BadRequestException(err)
        });
  if (terminal.startsWith('-ERR')) return [];
  let value = terminal.substring(terminal.indexOf('+OK') + 4, terminal.length);
  return JSON.parse(value)['active_leads'];
    
  }


  public async exportMCD(id: string, data: any,email?:string) {
    // console.log('asfasf',contact_list.id,'asfas', campaign.id)
     return new Promise(async (resolve, reject) => {
      
       var row = 'id,timestamp,campaign_name,lead_uuid,contact_list_name,recording_uuid,call_start_on,answered_on,ended_on,connected_to_agent_first_name,connected_to_agent_last_name ,disposition ,auto_disposition,ani ,dnis,call_uuid_lead,call_uuid_agent,recycle_reason ,attempt_nr\n'
         const path = `${CDR_STORAGE_PATH}/${id}.csv`;
  
      // console.log('lead_path---',path)
       

         for(let i =0; i< data.length;++i){
           /*data[i].forEach(async (item: any) => {  
              row += `${item},`
            })*/
           row += `${data[i].id},${data[i].timestamp},${data[i].campaign_uuid},${data[i].lead_uuid},${data[i].batch_uuid},${data[i].recording_uuid},${data[i].call_start_on},${data[i].answered_on},${data[i].ended_on},${data[i].connected_to_agent_uuid},${data[i].connected_to_agent_url},${data[i].duration},${data[i].disposition},${data[i].auto_disposition},${data[i].ani},${data[i].dnis},${data[i].call_uuid_lead},${data[i].call_uuid_agent},${data[i].recycle_reason},${data[i].attempt_nr}`
            row += '\n'
         }
         
              // console.log('cdr=file-content---',row)
           await writeFile(path, row);
           if(email){
         const msg = await this.sendMail(email,row)
            resolve({
              path:path,
              email:msg
            })
        }
 
         resolve({
           path:path
         })
       
     });
   }

   private async sendMail(email:string,data:string){

   sgMail.setApiKey(process.env['SENDGRID_API_KEY']);


   const msg = {
     to: email,
     from: 'noreply@extremedialer.com',
     subject: `report`,
     //text: `report`,
     attachments: [{
      filename: 'file.csv',
      content: new Buffer(data).toString("base64"),
      type: 'text/plain',
      disposition: 'attachment',
      contentId: 'file.csv'
  }],
     html: `CDR report`
   };
    
   sgMail.send(msg)
 //  console.log('msg send',email)
   return `msg send ${email}`
  }


  public async ncat(command:string){
    return new Promise(async (resolve, reject) => {
    var options = {
      // define a connection timeout
       timeout: 60000,
      // buffer(default, to receive the original Buffer objects), ascii, hex,utf8, base64
       read_encoding: 'utf8'
      }
     
    
    var client = Netcat.client(54322, '127.0.0.1',options);


    await client.on('open', async  () => {
      console.log('connect');
     await client.send(command,true,()=>{
        console.log('command sended')
      });
      
    });
    
    
    await client.on('data', async  (response:any) => {
      console.log("received data-->",response.toString())
      resolve(response.toString())
      
    });
    
    client.on('error', function (err:any) {
      console.log(err);
      reject(err)
    });
    
    client.on('close', function () {
      console.log('close');
    });
    
    client.start();
      })
  }

  public async TelNet(command:string){
    return new Promise(async (resolve, reject) => {
    var connection = new Telnet()
    var params = {
      host: '127.0.0.1',
      port: 8021,
      timeout: 60000,
      passwordPrompt: "Content-Type: auth/request",
      password:"auth ClueCon\n",
      shellPrompt:"",
      negotiationMandatory: false,
      debug: true
      // removeEcho: 4
    };
    
    
    connection.on('ready', async function() {
      console.log('ready connection')
      await connection.send(`${command} \n\n`, function(err:any, response:any){
        console.log("err-->",err)
        if(err) reject(err)
        //console.log("Telnet Response:::",response)
       resolve(response)
       
      })

    });
    
    connection.on('timeout', function() {
      console.log('socket timeout!')
      connection.end();
      process.exit(0);
    });
    
    
    connection.on('failedLogin', function() {
      console.log("failedLogin")
    });
    
    connection.on('close', function() {
      console.log('connection closed');
    });
    
    connection.on('error', function(error) {
      console.log('connection error');
      console.log(error)
    });
    
    
    connection.connect(params).catch((err) =>{
      console.log(err)
    });
  })
  }
}

