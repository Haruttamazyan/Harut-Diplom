import { Component, Inject, Post, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { didGroupRepositoryToken, didRepositoryToken, pricingRepositoryToken } from '../../constants';
import { DidGroupEntity } from './did-gropu.entity'
import { DidEntity } from '../user/did.entity'

@Component()
export class DidGroupService {
  constructor (
    @Inject(didGroupRepositoryToken)
    private readonly DidGroupRepository: Repository<DidGroupEntity>,
    @Inject(didRepositoryToken)
    private readonly DidRepository: Repository<DidEntity>,

  ) {}


 public async create(body:any){


      return await this.DidGroupRepository.save(
          this.DidGroupRepository.create({
            name:body.did_group_name
          })
      )
  }
  public async delete(id:string){
      const group:any = await this.DidGroupRepository.findOneById(id,{
          relations:['dids']
      })
      //console.log(group)
      if(group.dids == []){
        await this.DidGroupRepository.deleteById(id)
        return {success:true}
      } else{
          await this.DidRepository.updateById(group.dids[0].id,{
              group:null
          })
          await this.DidGroupRepository.deleteById(id)
        return {success:true}
      }

     
  }

  public async GetGroup(id:string){
      return await this.DidGroupRepository.findOne({
          relations:['dids'],
      })
  }

    public async GetGroups(){
        return await this.DidGroupRepository.find({
            relations:['dids'],
        })
    }

  public async EditGroup(id:string,body:any){
    /* return await this.DidGroupRepository.updateById(id,{
        name:body.did_group_name
    })*/
    const dids:any = await this.DidGroupRepository.findOneById(id)
    dids.name = body.did_group_name

    await this.DidGroupRepository.save(dids)
    return dids

  }

  public async AddDid(id:string,body:any){
    /* return await this.DidGroupRepository.updateById(id,{
         name:body.did_group_name
     })*/
     const did = await this.DidRepository.findOneById(body.did_uuid)
        if(!did)
          throw new BadRequestException(`Did with id ${body.did_uuid} does not exist`)

     const group:any = await this.DidGroupRepository.findOneById(id)
     
        did.group = group
     await this.DidRepository.save(did)
     return {success:true}

}

public async DeleteDidfromGroup(id:string){
    const group:any = await this.DidGroupRepository.findOneById(id)
     
    group.dids = null
    await this.DidGroupRepository.save(group)
    return group

}


}
