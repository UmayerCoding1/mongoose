import {asyncHandler} from "../utils/asyncHandler.js";
import {uploadOnCloudinary} from '../utils/cloudinary.js';
const fileUpload = asyncHandler(async(req,res) => {
   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImage = req.files?.coverImage[0]?.path;
   console.log(coverImage);
   
   

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   console.log('avatar URL : ',avatar.url);
   
  
   return res.send({url: avatar.url})
})

export {fileUpload};