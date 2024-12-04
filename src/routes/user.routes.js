import express from 'express';
import { registerUser,loginUser,logoutUser} from '../controllers/user.controllers.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJet } from './../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', upload.fields([
    {
        name: "avatar",
        // maxCount:1
    },
    {
        name: "coverImage",
        // maxCount:1
    }
]),registerUser)

router.post('/login',  loginUser)

// secure route
router.post('/logout', verifyJet, logoutUser)


export default router;