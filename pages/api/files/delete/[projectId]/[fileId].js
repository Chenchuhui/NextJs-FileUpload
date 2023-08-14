import dbConnect from '../../../../../lib/dbConnect'
import Project from '../../../../../models/Project'
import File from '../../../../../models/File'
import { getDeleteCommand } from '../../../../../lib/S3Connect'

export default async function handler(req, res) {
    const {
      query: { projectId, fileId },
      method,
    } = req

    await dbConnect();

    if (method === 'DELETE') {
        try {
            // Find the file in the database
            const file = await File.findById(fileId);
            if (!file) {
                return res.status(404).json({ success: false, message: "File not found" });
            }

            // Delete file from S3
            const S3Params = {
                Bucket: process.env.BUCKETNAME,
                Key: file.name,
            };
            await getDeleteCommand(S3Params);

            // Remove the file reference from the project
            await Project.findByIdAndUpdate(projectId, {
                $pull: { files: fileId }
            });

            // Remove the file from the database
            await File.findByIdAndRemove(fileId);

            return res.status(200).json({ success: true, message: "File deleted successfully" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: err });
        }
    }

    return res.status(405).json({ success: false, message: "Method not supported" });
}
