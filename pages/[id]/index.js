import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import dbConnect from '../../lib/dbConnect'
import Project from '../../models/Project'
import File from '../../models/File'

/* Allows you to view pet card info and delete pet card*/
const PetPage = ({ project, files }) => {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const handleDelete = async () => {
    const projectID = router.query.id

    try {
      await fetch(`/api/projects/${projectID}`, {
        method: 'Delete',
      })
      router.push('/')
    } catch (error) {
      setMessage('Failed to delete the pet.')
    }
  }

  return (
    <div key={project._id}>
      <div className="card">
        <img src={'kunkun.png'} />
        <h5 className="pet-name">{project.name}</h5>
        <div className="main-content">
          <p className="pet-name">{project.name}</p>
          <p className="description">Description: {project.description}</p>

          {/* Extra Project Info: Files */}
          <div className="files info">
              <p className="label">Files</p>
              <ul>
                {files.map((data, index) => (
                  <li key={index}>
                    <Link href={data.url}>
                      {data.description}
                    </Link> 
                  </li>
                ))}
              </ul>
            </div>

          <div className="btn-container">
            <Link href="/" >
              <button className="btn home">Home</button>
            </Link>
            <Link href="/[id]/edit" as={`/${project._id}/edit`} legacyBehavior>
              <button className="btn edit">Edit</button>
            </Link>
            <button className="btn delete" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
      {message && <p>{message}</p>}
    </div>
  )
}

export async function getServerSideProps({ params }) {
  await dbConnect()

  const project = await Project.findById(params.id).lean()
  project._id = project._id.toString()
  let files = await File.find({'_id': {$in: project.files}}).lean()
  files = files.map((file) => {
    file._id = file._id.toString()
    return file;
  })
  project.files = project.files.map((file) => JSON.stringify(file))

  return { props: { project, files } }
}

export default PetPage
