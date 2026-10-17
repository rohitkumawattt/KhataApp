import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export const uploadToCloudinary = (fileBuffer, folder = 'khataApp') => {
    return new Promise((resolve, reject) => {
        if (!fileBuffer) {
            return reject(new Error('File buffer is missing'));
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'auto', // Image / PDF auto detect
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary API Error:', error);
                    return reject(error);
                }
                resolve({
                    public_id: result.public_id,
                    secure_url: result.secure_url,
                });
            }
        );

        uploadStream.end(fileBuffer);
        // console.log("IMAGE UPLOADED ON COLUDINARY")
    });
};


export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
        // console.log("SUCCESSFULLY DELETED FROM CLOUDINARY")
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error.message);
    }
};

export { cloudinary };