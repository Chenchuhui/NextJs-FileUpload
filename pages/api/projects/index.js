import dbConnect from '../../../lib/dbConnect'
import Project from '../../../models/Project'

export default async function handler(req, res) {
  const { method } = req

  await dbConnect()

  switch (method) {
    case 'GET':
      try {
        const proejcts = await Project.find({}) /* find all the data in our database */
        res.status(200).json({ success: true, data: proejcts })
      } catch (error) {
        res.status(400).json({ success: false })
      }
      break
    case 'POST':
      try {
        const project = await Project.create(
          req.body
        ) /* create a new model in the database */
        res.status(201).json({ success: true, data: project })
      } catch (error) {
        res.status(400).json({ success: false, data: error })
      }
      break
    default:
      res.status(400).json({ success: false })
      break
  }
}
