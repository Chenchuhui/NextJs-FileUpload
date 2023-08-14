import dbConnect from '../../../lib/dbConnect'
import Project from '../../../models/Project'
import File from '../../../models/File'
import { getDeleteCommand } from '../../../lib/S3Connect'

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req

  await dbConnect()

  switch (method) {
    case 'GET' /* Get a model by its ID */:
      try {
        const project = await Project.findById(id).lean()
        if (!project) {
          return res.status(400).json({ success: false })
        }
        let files = await File.find({'_id': {$in: project.files}}).lean()
        if (!files) {
          res.status(400).json({ success: false })
      }
      files = files.map((file) => {
          file._id = file._id.toString()
          return file;
      })
        res.status(200).json({ success: true, project: project, files: files })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break

    case 'PUT' /* Edit a model by its ID */:
      try {
        const project = await Project.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        })
        if (!project) {
          return res.status(400).json({ success: false , data: "No project found"})
        }
        res.status(200).json({ success: true, data: project })
      } catch (error) {
        res.status(400).json({ success: false, data: error })
      }
      break

    case 'DELETE' /* Delete a model by its ID */:
      try {
        const project = await Project.findById(id)
        if (!project) {
          return res.status(400).json({ success: false })
        }

        // Getting the corresponding files from the File model
        const filesToDelete = await File.find({ '_id': {$in: project.files}});
        if (!filesToDelete) {
          res.status(400).json({ success: false })
        }

        filesToDelete.map(async (file) => {
          const S3Params = {
            Bucket: process.env.BUCKETNAME,
            Key: file.name
          }
          await getDeleteCommand(S3Params);
        })
        const deleteFileMsg = await File.deleteMany({ '_id': { $in: project.files }})
        if (!deleteFileMsg) {
          res.status(400).json({ success: false })
        }
        const deleteProjectMsg = await project.deleteOne();
        if (!deleteProjectMsg) {
          res.status(400).json({ success: false })
        }
        res.status(200).json({ success: true, data: {} })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break

    default:
      res.status(400).json({ success: false })
      break
  }
}
