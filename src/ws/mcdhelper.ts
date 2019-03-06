import { BadRequestException } from "@nestjs/common";
import { oCampaignEntityName} from '../constants';
import { JWT_KEY } from '../config';
const promise = require('bluebird');
let pgp = require('pg-promise')({promiseLib: promise});
//let host = (process.env.DEVELOPMENT === 'dev') ? process.env.PROD_HOST_NAME : 'localhost';
const connectionStringToMcd = `postgresql://postgres:PASSWORD@localhost:5432/mcd`;
const connectionStringToC4 = `postgresql://postgres:PASSWORD@localhost:5432/class4_dnl`;
let db = pgp(connectionStringToMcd);
let dvC4 = pgp(connectionStringToC4)

db.connect()
    .then((obj:any) => {
        console.log('success MCDdb connection ');
        obj.done();
    })
    .catch((error:any) => {
        console.log('ERROR:', error.message || error);
    });

    dvC4.connect()
    .then((obj:any) => {
        console.log('success C4db connection ');
        obj.done();
    })
    .catch((error:any) => {
        console.log('ERROR:', error.message || error);
    });

    let getContactListLeadsForCallsListSectionForAgentSection = async (campaign_uuid_row:any[]) => {
        return db.many(`SELECT * FROM cdr WHERE campaign_uuid = any (ARRAY[${campaign_uuid_row}])`)
          .then((response) => {
            return response
          })
          .catch((err) => {
            if (err.received === 0) {
              return []
            }
            throw err
          })
      };

    let Records = async (start_time: string, end_time: string, campaign_uuid: any) => {
            console.log("credentials", start_time, end_time, campaign_uuid );
    return db.many(`SELECT * FROM cdr WHERE campaign_uuid = '$1' AND call_start_on = '$2' AND ended_on = '$3' `, campaign_uuid, start_time, end_time)
        .then((response) => {
            console.log("rsponse 1111-------->", response)
            return response
        })
        .catch((err) => {
            if (err.received === 0) {
                return []
            }
            throw err
        })
    };

    let callMandeForOutbound = async (agent_uuid: any) => {
        return db.many(`SELECT count(*) FROM cdr WHERE connected_to_agent_uuid = '$1' `, agent_uuid)
            .then((response) => {
                console.log("rsponse 22222-------->", response)
                return response
            })
            .catch((err) => {
            if (err.received === 0) {
                return []
            }
            throw err
            })
    };

    let minutesForOutbound = async (agent_uuid: any) => {
        return db.many(`SELECT sum(duration) FROM cdr WHERE connected_to_agent_uuid = '$1' `, agent_uuid)
            .then((response) => {
                console.log("rsponse 333333-------->", response)
                return response
            })
            .catch((err) => {
            if (err.received === 0) {
                return []
            }
            throw err
            })
    };

    let workedToday = async (agent_uuid: any) => {
        return db.many(`SELECT (call_start_on, ended_on) FROM cdr WHERE connected_to_agent_uuid = '$1' `, agent_uuid)
            .then((response) => {
                console.log("response 4444444--------->", response);
                // let nowDate:any = new Date(); 
                // nowDate = nowDate.getTime();
                // if(response)
                return response
            })
            .catch((err) => {
            if (err.received === 0) {
                return []
            }
            throw err
            })
    };

    let totalCalls = async(ids:string[]) => {
        if (ids.length !== 0) {
            return db.many(`SELECT count(*), sum(duration), avg(duration) FROM cdr WHERE campaign_uuid = any (ARRAY[${ids}])`)
              .then((response:any) => {
                  console.log('counut1-->',response)
                return response[0]
              })
              .catch((err) => {
                if (err.received === 0) {
                  return []
                }
                throw err
              })
          }
          return []
    }
    let totalCallsbyHour = async(ids:string[],hour:string) => {
        if (ids.length !== 0) {
            return db.many(`SELECT count(*), sum(duration), avg(duration) FROM cdr WHERE campaign_uuid = any (ARRAY[${ids}]) AND timestamp < NOW() - INTERVAL '${hour}' HOUR`)
              .then((response:any) => {
                  console.log('counut2-->',response)
                return response[0]
              })
              .catch((err) => {
                if (err.received === 0) {
                  return []
                }
                throw err
              })
          }
          return []
    }

    let totalCallsTest = async(ids:string[],timestamp:any,timestamp2:string) => {
      console.log(timestamp,timestamp2)
        if (ids.length !== 0) {
            return db.many(`SELECT count(*), sum(duration), avg(duration) FROM cdr WHERE campaign_uuid = any (ARRAY[${ids}]) AND timestamp >= '${timestamp}' AND timestamp <= '${timestamp2}'`)
              .then((response:any) => {
                  console.log('counut2-->',response)
                return response[0]
              })
              .catch((err) => {
                if (err.received === 0) {
                  return []
                }
                throw err
              })
          }
          return []
    }

    let CallsMadeforOutbound = async(id:string) => {
        
            return db.one(`SELECT count(*) as calls, sum(duration) as minutes FROM cdr WHERE connected_to_agent_uuid = $1`,id)
              .then((response:any) => {
                  console.log('agentcalls-->',response)
                return response
              })
              .catch((err) => {
                if (err.received === 0) {
                  return []
                }
                throw err
              })
         
    }

    let outgoing = async(id:string) => {
        return db.many(`SELECT * FROM cdr WHERE campaign_uuid = '${id}'`)
          .then((response:any) => {
              //console.log('agentcalls-->',response)
            return response
          })
          .catch((err) => {
            if (err.received === 0) {
              return []
            }
            throw err
          })
     
}

let DNC = async(ids:string[]) => {
    return db.many(`SELECT * FROM campaign_dnc WHERE campaign_uuid = any (ARRAY[${ids}])`)
      .then((response:any) => {
          //console.log('agentcalls-->',response)
        return response
      })
      .catch((err) => {
        if (err.received === 0) {
          return []
        }
        throw err
      })
 
}

let gettopAgents = async(ids:string[]) => {
    return db.many(`SELECT connected_to_agent_url, count(*) FROM cdr WHERE connected_to_agent_url = any (ARRAY[${ids}]) GROUP BY connected_to_agent_url ORDER BY count(*) DESC`)
      .then((response:any) => {
          console.log('agentTops-->',response)
        return response
      })
      .catch((err:any) => {
        if (err.received === 0) {
          return []
        }
        throw err
      })
 
}

let getTopCampaigns = async(ids:string[]) => {
    return db.many(`SELECT campaign_uuid, count(*) FROM cdr WHERE campaign_uuid = any (ARRAY[${ids}]) GROUP BY campaign_uuid ORDER BY count(*) DESC`)
      .then((response:any) => {
          console.log('campaignsTops-->',response)
        return response
      })
      .catch((err:any) => {
        if (err.received === 0) {
          return []
        }
        throw err
      })
 
}

let getoutgoingCampaigns = async(ids:string[],timestamp:any,timestamp2:string) => {
  return db.many(`SELECT * FROM cdr WHERE campaign_uuid = any (ARRAY[${ids}]) AND timestamp >= '${timestamp}' AND timestamp <= '${timestamp2}'`)
    .then((response:any) => {
        //console.log('campaignsTops-->',response)
      return response
    })
    .catch((err:any) => {
      if (err.received === 0) {
        return []
      }
      throw err
    })

}

let getCountAgentCallsPerCampaign = async (sip:string) => {
  return db.one(`SELECT count(*), campaign_uuid FROM cdr WHERE connected_to_agent_url = 'user/${sip}' group by campaign_uuid`)
    .then((response:any) => {
        console.log('AgentCampaign-->',response)
      return response
    })
    .catch((err:any) => {
      if (err.received === 0) {
        return []
      }
      throw err
    })

}

let getCountAgentCallsByTime = async(sip:string,timestamp:any,timestamp2:string) => {
  return db.one(`SELECT count(*) FROM cdr WHERE connected_to_agent_url = 'user/${sip}' AND timestamp >= '${timestamp}' AND timestamp <= '${timestamp2}'`)
    .then((response:any) => {
        console.log('AgentTime-->',response)
      return response
    })
    .catch((err:any) => {
      if (err.received === 0) {
        return []
      }
      throw err
    })

}


let getCountCallsforAgent = async(sip:string,timestamp:any,timestamp2:string) => {
  //console.log(`SELECT count(*) FROM cdr WHERE connected_to_agent_url = 'user/${sip}' AND timestamp >= '${timestamp}' AND timestamp < '${timestamp2}'`)
  return db.one(`SELECT count(*) FROM cdr WHERE connected_to_agent_url = 'user/${sip}' AND timestamp >= '${timestamp}' AND timestamp < '${timestamp2}'`)
    .then((response:any) => {
        console.log('AgentTime-->',response)
      return response
    })
    .catch((err:any) => {
      if (err.received === 0) {
        return []
      }
      throw err
    })

}

let getBalanceFromC4 = async(id:string) => {
  return dvC4.many(`SELECT * FROM c4_client_balance WHERE client_id = '${id}'`)
    .then((response:any) => {
        //console.log('campaignsTops-->',response)
      return response
    })
    .catch((err:any) => {
      if (err.received === 0) {
        return []
      }
      throw err
    })

}

    

    



let connection = () => {
    return db
};


module.exports = {
    connection: connection,
    getMcd:getContactListLeadsForCallsListSectionForAgentSection,
    Record:Records,
    CallMandeForOutbound: callMandeForOutbound,
    MinutesForOutbound: minutesForOutbound,
    WorkedToday: workedToday,
    totalCalls:totalCalls,
    totalCallsbyHour:totalCallsbyHour,
    CallsMadeforOutbound:CallsMadeforOutbound,
    totalCallsTest:totalCallsTest,
    outgoing:outgoing,
    DNC:DNC,
    gettopAgents:gettopAgents,
    getTopCampaigns:getTopCampaigns,
    getoutgoingCampaigns:getoutgoingCampaigns,
    getBalanceFromC4:getBalanceFromC4,
    getCountAgentCallsPerCampaign:getCountAgentCallsPerCampaign,
    getCountAgentCallsByTime:getCountAgentCallsByTime,
    getCountCallsforAgent:getCountCallsforAgent
};
