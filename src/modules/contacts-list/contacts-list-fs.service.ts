import { Component } from '@nestjs/common';
import { ContactsListEntity } from './contacts-list.entity';
import * as fs from 'fs';
import { CONTACTS_STORAGE_PATH, FS_HOST, FS_PORT } from '../../config';
import { promisify } from 'util';
import { spawn } from 'child_process';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

interface fileObj {
  leads?: string[];
}

@Component()
export class ContactsListFsService {
  fileObj: fileObj = {leads: []}; 

  public async createFreeswitchContactsList (contact: ContactsListEntity) {
    return new Promise(async (resolve, reject) => {
      const payload = {
        contact_list_name: contact.contact_list_name,
        contact_file_url: contact.contact_file_url,
        contact_file_count: contact.contact_file_count,
        contact_file_column_count: contact.contact_file_column_count,
        contact_count: contact.contact_count
      };

      const path = `${CONTACTS_STORAGE_PATH}/lead.json`;
      let fileContent = '';

      if(fs.existsSync(path))
        fileContent = await readFile(path, 'utf8');
      else
        await writeFile(path, '');
      
      if(fileContent) {
        let content = JSON.parse(fileContent);
        content.leads.push('sofia/internal/' + JSON.stringify(payload) + '@144.217.91.211:5060');
        this.fileObj.leads = content.leads.slice();
        await writeFile(path, JSON.stringify(this.fileObj));
      } else {
        if(this.fileObj.leads)
          this.fileObj.leads.push('sofia/internal/' + JSON.stringify(payload) + '@144.217.91.211:5060');
        await writeFile(path, JSON.stringify(this.fileObj));
      }

      const command = 'mcd contacts create';
      const ncat = spawn('/opt/campaign/mcd-cmd.sh', [FS_HOST, FS_PORT, command, path]);
      
      ncat.on('exit', () => resolve(path));
      ncat.on('error', reject);

      resolve(path);
    });
  }

  public async apdateFreeswitchContactsList(info_array:any,id:any){
    return new Promise(async (resolve, reject) => {

      const path = `${CONTACTS_STORAGE_PATH}/${id}.json`;
      let fileContent = '';

      if(fs.existsSync(path))
        fileContent = await readFile(path, 'utf8');
      else
        await writeFile(path, '');

        
        if(fileContent) {
          let content = JSON.parse(fileContent);
          info_array.forEach(async (item: any) => {  
  
          content.leads.push('sofia/internal/' + item.phone_number + '@144.217.91.211:5060');
          })
          
          await writeFile(path, JSON.stringify(content));
        } else {
          let  file: fileObj = {leads: []};
            info_array.forEach(async (item: any) => {  
              file.leads.push('sofia/internal/' + item.phone_number + '@144.217.91.211:5060');
              })
            
          await writeFile(path, JSON.stringify(file));
        }
      const command = 'mcd contacts create';
      const ncat = spawn('/opt/campaign/mcd-cmd.sh', [FS_HOST, FS_PORT, command, path]);
          ncat.on('exit', () => resolve(path));
        ncat.on('error', reject);
       resolve(path);
      })
  }
}
