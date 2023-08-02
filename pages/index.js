import Link from 'next/link'
import dbConnect from '../lib/dbConnect'
import Project from '../models/Project'

const Index = ({ projects }) => (
  <>
    {/* Create a card for each pet */}
    {projects.map((pet) => (
      <div key={pet._id}>
        <div className="card">
          <img src={'kunkun.png'} />
          <h5 className="pet-name">{pet.name}</h5>
          <div className="main-content">
            <p className="pet-name">{pet.name}</p>
            <p className="decription">Description: {pet.description}</p>

            {/* Extra Project Info: Files */}
            <div className="files info">
              <p className="label">Files:</p>
              <ul>
                {
                pet.files.map((data, index) => (
                  <li key={index}>{data} </li>
                ))}
              </ul>
            </div>

            <div className="btn-container">
              <Link href="/[id]/edit" as={`/${pet._id}/edit`} legacyBehavior>
                <button className="btn edit">Edit</button>
              </Link>
              <Link href="/[id]" as={`/${pet._id}`} legacyBehavior>
                <button className="btn view">View</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    ))}
  </>
)

/* Retrieves pet(s) data from mongodb database */
export async function getServerSideProps() {
  await dbConnect()

  /* find all the data in our database */
  const result = await Project.find({})
  const projects = result.map((doc) => {
    const project = doc.toObject()
    project._id = project._id.toString()
    return project
  })

  return { props: { projects: projects } }
}

export default Index
