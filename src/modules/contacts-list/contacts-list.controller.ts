import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Req,
  Param,
  UseInterceptors,
  FileInterceptor,
  UseGuards,
  BadRequestException,
  NotAcceptableException,
  HttpStatus
} from '@nestjs/common';
import { ApiUseTags, ApiConsumes, ApiOperation, ApiResponse, ApiBearerAuth, ApiImplicitBody } from '@nestjs/swagger';
import { ContactsListService } from './contacts-list.service';
import { SetContactsBindingsDto } from './dto';
import { User } from '../../decorators';
import { IAuthTokenContent } from '../../interfaces/auth-token.interface';
import { Request } from 'express';
import { HasCompanyGuard } from '../../guards';
import { UuidDto, UuidArrayDto, PaginationQueryDto, UuidDoubleDto } from '../../dto';
import {
  DuplicateBindingException,
  OutOfLimitBindingException,
  InvalidBindingTypeException,
  UnknownContactsListException,
  ParseException,
  AlreadyHasContactsException
} from './exceptions';
import { multerOptions } from './multer-options';
import { IEditContactsListPayload, IImportContactsFilePayload } from './interfaces';
import { ContactService } from './modules/contact/contact.service';
import { UpdateContactDto } from './dto';
import { UnknownContactException, DuplicateContactException } from './modules/contact/exceptions';
import { CreateContactsListResponse, ParseErrorResponse, ImportFileContactsListResponse } from './swagger/response-types';
import { CreateContactsListDto, EditContactsListDto, ImportFileContactsListDto } from './swagger/implicit-body';
import { UserService } from '../user/user.service';
import { IPaginated } from '../../interfaces';
import { ContactsListEntity } from './contacts-list.entity';
import { ContactEntity } from './modules/contact/contact.entity';

@Controller('contacts-list')
@ApiUseTags('contacts-list')
@ApiBearerAuth()
export class ContactsListController {
  constructor (
    private readonly contactsListService: ContactsListService,
    private readonly contactService: ContactService,
    private readonly userService: UserService
  ) {}

  // Maybe move this to an utils folder.
  private validateName (value: any) {
    if (!value || typeof value !== 'string') {
      // Just for consistency with the rest of the errors since for some
      // reason validation pipe throws an error when working with files.
      throw new BadRequestException([
        {
          property: 'contact_list_name',
          children: [],
          constraints: {
            isString: 'contact_list_name must be a string'
          }
        }
      ]);
    }
  }

  private validateFile (value: any) {
    if (!value) {
      throw new BadRequestException('"contacts" property must be a file');
    }
  }

  @Post()
  @UseGuards(HasCompanyGuard)
  @UseInterceptors(FileInterceptor('contacts', multerOptions))
  @ApiOperation({
    title: 'Create contacts list',
    description: 'Create contacts list and validate contacts file. ' +
    'Note this will not parse the file as there isn\'t enough information to do so, ' +
    'instead, it will return a preview containing the first 10 rows ' +
    'in the file to be used in /contacts-list/{id}/set-bindings.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiImplicitBody({ name: 'CreateContactsListDto', type: CreateContactsListDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Contacts list created successfully.',
    type: CreateContactsListResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'Parsing error',
    type: ParseErrorResponse
  })
  public async createContactsList (
    @Req() req: Request,
    @User() user: IAuthTokenContent
  ) {
    this.validateName(req.body.contact_list_name)

    try {
      const { id: contactsListId } = await this.contactsListService.createContactsList({
        contact_list_name: req.body.contact_list_name,
        user
      });

      return {
        contactsListId
      };
    } catch (e) {
      if (e instanceof ParseException) {
        throw new NotAcceptableException(e.message, 'parsing-error');
      }
      
      throw e;
    }
  }

  @Post(':id/import')
  @UseGuards(HasCompanyGuard)
  @UseInterceptors(FileInterceptor('contacts', multerOptions))
  @ApiOperation({
    title: 'Import contacts to contact-list',
    description: 'Create contacts list and validate contacts file. ' +
    'Note this will not parse the file as there isn\'t enough information to do so, ' +
    'instead, it will return a preview containing the first 10 rows ' +
    'in the file to be used in /contacts-list/{id}/set-bindings.'
  })
  @ApiConsumes('multipart/form-data')
  //@ApiImplicitFile({ name: 'file', required: true, description: 'List of contacts' })
  @ApiImplicitBody({ name: 'ImportFileContactsListDto', type: ImportFileContactsListDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Contacts list updated successfully.',
    type: ImportFileContactsListResponse
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'Parsing error',
    type: ParseErrorResponse
  })
  public async importFileContactsList (
    @Param() { id }: UuidDto,    
    @Req() req: Request,
    @User() user: IAuthTokenContent
  ) {
    this.validateFile(req.file);

    /*await this.userService.ensureCanPerformCompanyAction({
      user,
      action: 'editContactsLists'
    });*/

    //await this.contactsListService.getContactsListById(id);

    const {
      count,
      contactsPreview
    } = await this.contactsListService.parseRawContactsFile(req.file.path);
     // console.log("test789")'
     console.log(count,contactsPreview)
    try {
      const payload: IImportContactsFilePayload = {};

      if (req.file) {
        // Ensure contacts list does not have contacts.
        await this.contactsListService.ensureDoesNotHaveContacts(id);

        payload.contact_file_url = req.file.path;
        payload.contact_file_count = count;
        payload.contact_file_column_count = contactsPreview[0] ? contactsPreview[0].length : 0;
      }
          
      return await this.contactsListService.importContactsFileIntoList(id, payload);
    } catch (e) {
      
      if (e instanceof UnknownContactsListException) {
        throw new BadRequestException(e.message);
      }

      if (e instanceof ParseException) {
        throw new NotAcceptableException(e.message, 'parsing-error');
      }

      throw e;
    }
  }
/*
  @Put(':id')
  @UseGuards(HasCompanyGuard)
  @UseInterceptors(FileInterceptor('contacts', multerOptions))
  @ApiOperation({
    title: 'Update contacts list',
    description: 'Verify contacts list does not have assigned contacts, ' +
    'then validate contacts file. Note this will not parse the file as there isn\'t ' +
    'enough information to do so, instead, it will return a preview containing ' +
    'the first 10 rows in the file to be used in /contacts-list/{id}/set-bindings.'
  })
  @ApiConsumes('multipart/form-data')
  @ApiImplicitBody({ name: 'EditContactsListDto', type: EditContactsListDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Contacts list updated successfully',
    type: CreateContactsListResponse
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'This will happen if body does not contain ' +
    'a name or a contacts file, or if contacts list does not exist.'
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'Contacts list already have assigned contacts. This will happen ' +
    'if /contacts-list/{id}/set-bindings was called in this contacts list before ' +
    'and request body contains a contacts file.'
  })
  public async editContactsList (
    @Param() { id }: UuidDto,
    @Req() req: Request,
    @User() user: IAuthTokenContent
  ) {
    if (!req.file && !req.body.contact_list_name) {
      throw new BadRequestException('Nothing to change');
    }

    await this.userService.ensureCanPerformCompanyAction({
      user,
      action: 'editContactsLists'
    });

    try {
      const payload: IEditContactsListPayload = {};

      // Ensure contacts list exists before parsing the file.
      await this.contactsListService.getContactsListByIdAndCompany(
        user.companyId as string,
        id
      );

      if (req.file) {
        // Ensure contacts list does not have contacts.
        await this.contactsListService.ensureDoesNotHaveContacts(id);

        const {
          count,
          contactsPreview
        } = await this.contactsListService.parseRawContactsFile(req.file.path);

        payload.contact_file_url = req.file.path;
        payload.contact_file_count = count;
        payload.contact_file_column_count = contactsPreview[0].length;
      }

      if (req.body.contact_list_name) {
        this.validateName(req.body.contact_list_name);
        payload.contact_list_name = req.body.contact_list_name;
      }

     return await this.contactsListService.editContactsList(id, payload);
      
    } catch (e) {
      if (e instanceof UnknownContactsListException) {
        throw new BadRequestException(e.message);
      }

      if (e instanceof AlreadyHasContactsException) {
        throw new NotAcceptableException(e.message);
      }

      throw e;
    }
  }*/
  @Put(':id')
  @UseGuards(HasCompanyGuard)
  @ApiOperation({ title: 'update contacts list by id' })
  @ApiResponse({ status: HttpStatus.OK })
  public async updateContactsListById (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto,
    @Req() req: Request,
  ) {
    try {
      if (!req.body.contact_list_name) {
        throw new BadRequestException('Nothing to change');
      }
  
      return await this.contactsListService.updateContactsListById(
        id,
        req.body.contact_list_name
      );
    } catch (e) {
      if (e instanceof UnknownContactsListException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }
  

  @Post(':id/set-bindings')
  @UseGuards(HasCompanyGuard)
  @ApiOperation({
    title: 'Set contacts list bindings',
    description: 'Parse contacts list given to POST /contacts-list or ' +
    'PUT /contacts-list/{id}. This will assign a meaning to each of the columns ' +
    'in the file and save the contacts in database. Note that this perform validations ' +
    'and respond immediately, and contacts will then start being processed. ' +
    'API will then emit socket events with current status until all contacts are processed. ' +
    'It\'s done this way because large files may take a while before they are completely processed, ' +
    'and being able to broadcast the status gives users a better insight of how long it\'s left.'
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Validated bindings successfully, and started processing contacts.'
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: `This will happen if:
    1) Some properties in the bindings object have duplicated values.
    2) Some property has a negative value, or a greater value than the number of available columns (zero-based).
    3) Some property has an invalid type (only numbers allowed).
    4) Contacts list does not exist.`
  })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'Contacts list already has assigned contacts.'
  })
  public async setContactsListBindings (
    @Param() { id }: UuidDto,
    @User() { companyId }: IAuthTokenContent,
    @Body() bindings: SetContactsBindingsDto
  ) {
    try {
      return await this.contactsListService.setContactsListBindings({
        listId: id,
        companyId: companyId as any,
        bindings
      });
    } catch (e) {
      if (
        e instanceof DuplicateBindingException ||
        e instanceof OutOfLimitBindingException ||
        e instanceof InvalidBindingTypeException ||
        e instanceof UnknownContactsListException) {
        throw new BadRequestException(e.message);
      }

      if (e instanceof AlreadyHasContactsException) {
        throw new NotAcceptableException(e.message);
      }

      throw e;
    }
  }

  @Get()
  @UseGuards(HasCompanyGuard)
  @ApiOperation({ title: 'Get contacts lists' })
  @ApiResponse({ status: HttpStatus.OK })
  public async getContactsLists (
    @User() user: IAuthTokenContent,
    @Query() { offset, limit }: PaginationQueryDto
  ): Promise<any> {
    return await this.contactsListService.getContactsListsByCompany({
      companyId: user.companyId as any,
      offset,
      limit
    });
  }

  @Get(':id')
  @UseGuards(HasCompanyGuard)
  @ApiOperation({ title: 'Get contacts list by id' })
  @ApiResponse({ status: HttpStatus.OK })
  public async getContactsListById (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {
    try {
      return await this.contactsListService.getContactsListById(
        id
      );
    } catch (e) {
      if (e instanceof UnknownContactsListException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  @Get(':id1/contacts/:id2')
  @UseGuards(HasCompanyGuard)
  @ApiOperation({ title: 'Get contact by List id' })
  @ApiResponse({ status: HttpStatus.OK })
  public async getContactByListId (
    @User() user: IAuthTokenContent,
    @Param() { id1: contactsListId, id2: contactId }: UuidDoubleDto,
  ) {
    try {
      return await this.contactsListService.getContactByListId(
        contactsListId,
        contactId
      );
    } catch (e) {
      if (e instanceof UnknownContactsListException) {
        throw new BadRequestException(e.message);
      }

      throw e;
    }
  }

  @Get(':id/contacts')
  @UseGuards(HasCompanyGuard)
  @ApiOperation({ title: 'Get contacts' })
  @ApiResponse({ status: HttpStatus.OK })
  public async getContacts (
    @User() user: IAuthTokenContent,
    @Param() { id: contactsListId }: UuidDto,
    @Query() { offset, limit }: PaginationQueryDto
  ) {
    return await this.contactsListService.getContactsListByIdAndCompany(
      user.companyId as string,
      contactsListId,
      {
        offset,
        limit
      }
    )
  }

  @Put(':id1/contacts/:id2')
  @UseGuards(HasCompanyGuard)
  @ApiOperation({ title: 'Update contact' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Contact updated successfully.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Unknown contact.' })
  @ApiResponse({
    status: HttpStatus.NOT_ACCEPTABLE,
    description: 'No properties specified in body. Can also happen if attempting to ' +
    'change the phone number but it\'s already assigned to another contact in the list.'
  })
  public async updateContact (
    @User() user: IAuthTokenContent,
    @Param() { id1: contactsListId, id2: contactId }: UuidDoubleDto,
    @Body() contact: UpdateContactDto
  ) {
   
    if (!Object.keys(contact).length) {
      throw new NotAcceptableException('At least one property must be specified');
    }
     
    try {
      return await this.contactsListService.updateContact({
        contactId,
        contact
      });
    } catch (e) {
      if (e instanceof UnknownContactException) {
        throw new BadRequestException(e.message);
      }

      if (e instanceof DuplicateContactException) {
        throw new NotAcceptableException(e.message);
      }

      throw e;
    }
  }

  @Delete(':id/contacts')
  @UseGuards(HasCompanyGuard)
  public async deleteContacts (
    @User() user: IAuthTokenContent,
    @Param() { id: contactsListId }: UuidDto,
    @Body() { ids: contactsIds }: UuidArrayDto
  ) {
    return await this.contactsListService.deleteContacts({
      contactsListId,
      contactsIds
    });
  }
  @Delete(':id')
  @UseGuards(HasCompanyGuard)
  public async deleteContactsList (
    @User() user: IAuthTokenContent,
    @Param() { id }: UuidDto
  ) {
    return await this.contactsListService.deleteContactList(id);
  }

  @Delete(':id/contacts/all')
  @UseGuards(HasCompanyGuard)
  public async deleteAllContacts (
    @User() user: IAuthTokenContent,
    @Param() { id: contactsListId }: UuidDto
  ) {
    return await this.contactsListService.deleteAll(contactsListId);
  }
}