import * as multer from 'multer';
import { AVATAR_STORAGE_PATH } from '../../config';
import { extname } from 'path';
import { v4 } from 'uuid';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

export const multerOptions: multer.Options = {
  limits: {
    files: 1,
    fileSize: 1024 * 1024 * 1024 // 1gb
  },
  fileFilter (req: Request, file, cb) {
    if(!file){
        return cb(null,false)
    }
    const extension = extname(file.originalname);
    
    const allowedExtensions = ['.jpg', '.png','.PNG'];

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new BadRequestException(
          `Extension '${extension}' is not allowed. ` +
          `Only ${allowedExtensions.join(', ')} files are supported.`
        ),
        false
      );
    }

    cb(null, true);
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, AVATAR_STORAGE_PATH),
    filename: (req, file, cb) => cb(null, v4() + extname(file.originalname?file.originalname:''))
  })
};
