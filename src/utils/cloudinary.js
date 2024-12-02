import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
// Configuration
cloudinary.config({
  cloud_name: "dlh8axija",
  api_key: "734479388384749",
  api_secret: "yDqsgyKi-rprpKUZnSesF-Z2_Xw",
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // /upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // file has been uploaded successfully
    fs.unlinkSync(localFilePath);

    return response;
    //
  } catch (error) {
    console.log(error);

    // remove the locally saved file as the upload operation on failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export { uploadOnCloudinary };
