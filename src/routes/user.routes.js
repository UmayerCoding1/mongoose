import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updatedUserAvatar,
  updatedUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "./../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      // maxCount:1
    },
    {
      name: "coverImage",
      // maxCount:1
    },
  ]),
  registerUser
);

router.post("/login", loginUser);

// secure route
router.post("/logout", verifyJwt, logoutUser);

router.post("/refresh-token", refreshAccessToken);
router.post("/change-password", verifyJwt, changeCurrentPassword);
router.get("/current-user", verifyJwt, getCurrentUser);
router.patch("/update-account", verifyJwt, updateAccountDetails);
router.patch("/avatar", verifyJwt, upload.single("avatar"), updatedUserAvatar);
router.patch("/cover-image",verifyJwt,upload.single("coverImage"),updatedUserCoverImage);
router.get("/c/:userName", verifyJwt, getUserChannelProfile);
router.get("/history", verifyJwt, getWatchHistory);

export default router;
