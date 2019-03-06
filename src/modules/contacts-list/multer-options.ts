import * as multer from 'multer';
import { CONTACTS_STORAGE_PATH } from '../../config';
import { extname } from 'path';
import { v4 } from 'uuid';
import { Request } from 'express';
import { BadRequestException } from '@nestjs/common';

export const multerOptions: multer.Options = {
  limits: {
    files: 1,
    fileSize: 1024 * 1024 * 1024 // 1gb
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, CONTACTS_STORAGE_PATH),
    filename: (req, file, cb) => cb(null, v4() + extname(file.originalname))
  }),
  fileFilter (req: Request, file, cb) {
    const extension = extname(file.originalname);
    const allowedExtensions = ['.csv', '.xls'];

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
  }
};
