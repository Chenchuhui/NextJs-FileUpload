import Link from 'next/link'
import dbConnect from '../lib/dbConnect'
import Project from '../models/Project'

const Index = ({ projects }) => (
  <>
    {/* Create a card for each project */}
    {projects.map((project) => (
      <div key={project._id}>
        <div className="card">
          <img src={'kunkun.png'} />
          <h5 className="project-name">{project.name}</h5>
          <div className="main-content">
            <p className="project-name">{project.name}</p>
            <p className="decription">Description: {project.description}</p>

            <div className="btn-container">
              <Link href="/[id]/edit" as={`/${project._id}/edit`} legacyBehavior>
                <button className="btn edit">Edit</button>
              </Link>
              <Link href="/[id]" as={`/${project._id}`} legacyBehavior>
                <button className="btn view">View</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    ))}
  </>
)

/* Retrieves project(s) data from mongodb database */
export async function getServerSideProps() {
  await dbConnect()
  
  /* find all the data in our database */
  const result = await Project.find({})
  const projects = result.map((doc) => {
    const project = doc.toObject()
    project._id = project._id.toString()
    project.files = project.files.map((file) => JSON.stringify(file))
    return project
  })

  return { props: { projects: projects } }
}

export default Index
