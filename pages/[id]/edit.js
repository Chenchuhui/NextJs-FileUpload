import { useRouter } from 'next/router'
import useSWR from 'swr'
import Form from '../../components/Form'

const fetcher = (url) =>
  fetch(url)
    .then((res) => res.json())

const EditProject = () => {
  const router = useRouter()
  const { id } = router.query
  const {
    data,
    error,
    isLoading,
  } = useSWR(id ? `/api/projects/${id}` : null, fetcher)
  const project = data?.project;
  const files = data?.files;
  
  if (error) return <p>Failed to load</p>
  if (isLoading) return <p>Loading...</p>
  if (!project) return null
  // console.log("shit:", project.files)
  const projectForm = {
    name: project.name,
    description: project.description,
    files: project.files
  }
  return <Form formId="edit-pet-form" projectForm={projectForm} projectFiles={files} forNewProject={false} />
}

export default EditProject
