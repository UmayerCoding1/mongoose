import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { User } from './../models/user.model.js';
import {uploadOnCloudinary} from './../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req,res) => {
    /**
     * 1: TODO1 : get user details from frontend
     * 2: TODO2 : validation - no empty
     * 3: TODO3 : check if user name and user email already exist
     * 4: TODO4 : check for  image, check for avatar
     * 5: TODO5 : upload item to cloudinary avatar
     * 6: TODO6 : create object - create entry is db
     * 7: TODO7 : remove password and refresh token from response
     * 8: TODO8 : check for creation 
     * 9: TODO9 : return res
     */

    const {userName,email,fullName,password} = req.body;
    console.log(req.body);
    
    
    if(
        [fullName,email,userName,password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400,"All fields are required")
    }

    if(!email.includes('@')){
      throw new ApiError(400, 'Email is not valid')
    }

  const existedUser = await User.findOne({
        $or: [{userName}, {email}]
    })

    if(existedUser){
        throw new ApiError(409, "User with email or username already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;

    if(!avatarLocalPath){
         throw new ApiError(400,'Avatar is required');
       }
       
    if(req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length > 0){
     coverImageLocalPath = req.files?.coverImage[0]?.path;
    }

   

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);



   if(!avatar){
     throw new ApiError(409,'Avatar is required');
   }
    
  

   const user = await User.create({
        fullName: fullName.toLowerCase(),
        email,
        userName: userName.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
    })

    const  createdUser =  await User.findById(user._id).select(
        "-password  -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, "User registered successfully")
    )
 
})

export {registerUser}