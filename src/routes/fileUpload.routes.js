import express from 'express';
import { fileUpload } from '../controllers/fileUpload.controllers.js';
import { upload } from '../middlewares/multer.middleware.js';


const router = express.Router();

router.post('/upload', upload.fields([
    {
        name: "avatar",
        // maxCount:1
    },
    {
        name: "coverImage",
        // maxCount:1
    }
]),fileUpload);

export default router;