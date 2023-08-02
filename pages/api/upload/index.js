import { Formidable } from "formidable";
import fs from 'fs'
import path from 'path'

// import sharp from 'sharp'
import dbConnect from '../../../lib/dbConnect'
import File from '../../../models/File'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

/**
 * Handling the file upload and return object Ids of files
 * @param {*} req 
 * @param {*} res 
 */
export const config = {
  api: {
    bodyParser: false
  }
}

const awsCredentials = {
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  region: process.env.REGION
};
console.log(awsCredentials);
const s3Client = new S3Client({ region: awsCredentials.region, credentials: awsCredentials });
const bucketName = process.env.BUCKETNAME;

const imageFileType = ['image/png', 'image/jpeg', 'image/gif'];

export default async (req, res) => {
  await dbConnect();
  const data = await new Promise((resolve, reject) => {
    const form = new Formidable();

    form.parse(req, (err, fields, files) => {
      if (err) reject({ err })
      resolve({ err, fields, files })
    }) 
  })
  // Extract the file data
  const { files } = data;

  // An array storing the objectId of uploaded files
  const idArr = [];

  // Write files to S3 and then store to the database
  const fileCreationPromises = Object.keys(files).map(async (fileKey) => {
    const fileData = files[fileKey];
    console.log(fileData);
    const fileContent = fs.readFileSync(fileData.filepath);
    const keyname = Date.now() + fileData.originalFilename.replace(/\s+/g, '');
    const S3Params = {
      Bucket: bucketName,
      Key: keyname,
      Body: fileContent,
      ContentDisposition: 'inline',
      ContentType: fileData.mimetype
    }
    const uploadCommand = new PutObjectCommand(S3Params);
    s3Client.send(uploadCommand);
    // const targetFilePath = path.join(targetPath, fileData.originalFilename);
    const fileURI = `https://${bucketName}.s3.amazonaws.com/${S3Params.Key}`;
    console.log(`https://${bucketName}.s3.amazonaws.com/${S3Params.Key}`);
    // fs.writeFileSync(targetFilePath, fileContent);

    // Optionally, you may want to remove the temporary file after writing to local storage
    fs.unlinkSync(fileData.filepath);

    // Adding the file to database
    const fileParams = {
      name: keyname,
      description: fileData.originalFilename,
      type: fileData.mimetype,
      url: fileURI
    };

    await File.create(fileParams)
        .then (
          (file) => {
            idArr.push(file._id.toString())
          }
        ).catch(
          (err) => {
            res.status(400).json(
              {
                success: false,
                data: err
              }
            );
          }
        )
  });
  
  // Wait for all file creation promises to resolve before sending the response
  try {
    await Promise.all(fileCreationPromises);
  } catch (err) {
    res.status(422).json({
      success: false,
      data: err
    })
  }

  console.log(idArr);
  res.status(200).json({
    success: true,
    data: idArr
  })
}

