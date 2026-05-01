import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

export const multerConfig = (folder: string) => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = join('./uploads', folder);

      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath, { recursive: true });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.random();
      cb(null, unique + extname(file.originalname));
    },
  }),
});
