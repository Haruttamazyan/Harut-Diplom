import { BadRequestException } from "@nestjs/common";
import { oCampaignEntityName} from '../constants';
//let db = require('../api/postgre/connect');
//let connection = db.connection();
//let config = require('./config/index');
const jwt = require('jsonwebtoken');
import { JWT_KEY } from '../config';
const promise = require('bluebird');
let pgp = require('pg-promise')({promiseLib: promise});
//let host = (process.env.DEVELOPMENT === 'dev') ? process.env.PROD_HOST_NAME : 'localhost';
const connectionString = `postgresql://postgres:PASSWORD@localhost:5432/ed-v2`;
let db = pgp(connectionString);

db.connect()
    .then((obj:any) => {
        console.log('success db connection ');
        obj.done();
    })
    .catch((error:any) => {
        console.log('ERROR:', error.message || error);
    });

let compaign = async (id:string)=>{
    console.log('helper',id)
    return db.one(`SELECT * FROM "${oCampaignEntityName}" WHERE "MCD_id" = $1`, id)
    .then((data:any)=>{
        return data
    })
    .catch((err:any)=>{
        console.log(err)
        throw new BadRequestException(err)
    })
}
let connection = () => {
    return db
};

let jwtParserPromise = (token) => {
    return new Promise((resolve, reject) => {
        try {
            jwt.verify(token, JWT_KEY, function (err, decoded) {
                if (err) return reject(new Error(err));
                return resolve(decoded)
            });
        } catch (err) {
            return reject(err);
        }
    })
};
let jwtParserPromiseCallback = async (token) => {
    return await jwtParserPromise(token)
};

module.exports = {
    connection: connection,
    campaign : compaign,
    jwtParserPromiseCallback: jwtParserPromiseCallback
};
