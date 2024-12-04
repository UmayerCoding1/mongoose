import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import { User } from './../models/user.model.js';
import {uploadOnCloudinary} from './../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

const generateAccessRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        
        

        user.refreshToken = refreshToken;
       await user.save({validateBeforeSave: false});

       return {accessToken,refreshToken}
    } catch (error) {
        console.log(error);
        
        throw new  ApiError(500, 'Something went wrong while generating refresh and access token')
    }
}

const registerUser = asyncHandler(async (req,res) => {
    /**
     * 1: TODO 1 : get user details from frontend
     * 2: TODO 2 : validation - no empty
     * 3: TODO3 : check if user name and user email already exist
     * 4: TODO4 : check for  image, check for avatar
     * 5: TODO5 : upload item to cloudinary avatar
     * 6: TODO6 : create object - create entry is db
     * 7: TODO7 : remove password and refresh token from response
     * 8: TODO8 : check for creation 
     * 9: TODO9 : return res
     * 6: TODO: 
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


const loginUser = asyncHandler(async (req,res) => {
    /**
     * 1: req body -> data
     * 2: check username or email
     * 3: find the user
     * 4: password check
     * 5: access and refresh token
     * 6: send cookie
     */

    
    
    const {email,userName,password} = req.body;
    
    
    if(!email){
        throw new ApiError(400, 'email is required')
    }

   const user = await User.findOne({
        $or: [{email}]
     });

  
  

     if(!user){
        throw new ApiError(404, "User does not exist")
     }

     const isPasswordValid = await user.isPasswordCorrect(password);

     
     

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credential")
     }

     const {accessToken,refreshToken} = await generateAccessRefreshToken(user._id);
     if(!accessToken && !refreshToken ){
        throw new ApiError(500, 'Something went wrong while not find refresh and access token')
     }
     

     
     
     const loggedUser =await User.findById(user._id).select("-password -refreshToken");
     
     

     const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
     }

     return res
     .status(200)
     .cookie("accessToken", accessToken, options)
     .cookie('refreshToken', refreshToken, options)
     .json(
        new ApiResponse(
            200,
            {
                user: loggedUser,accessToken,
                refreshToken
            },
            "user login successfully"
        )
     )
     
})

const logoutUser = asyncHandler(async(req,res) => {
 await User.findByIdAndUpdate(req.user._id,{
    $set: {
        refreshToken: undefined
    }
   });

   const options = {
    httpOnly: true,
    secure: true
 }

 return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'User logged out'))
})

const refreshAccessToken = asyncHandler(async(req,res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, 'Unauthorized request');
    }

    const decodeToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

     const user = await User.findById(decodeToken?._id);

     if(!user){
        throw new ApiError(401, "Invalid refresh token")
     }

     if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401, "Refresh token is expired or used")
     }

     const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
     }

      const {accessToken,newRefreshToken} =await generateAccessRefreshToken(user._id);


      return res
      .status(200)
      .cookie('accessToken', accessToken,options)
      .cookie('refreshToken', newRefreshToken,options)
      .json(
        new ApiResponse(
            200,
            {accessToken, refreshToken: newRefreshToken},
            "Invalid refresh token"
        )
      )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}