import { useRouter } from 'next/router'
import useSWR from 'swr'
import Form from '../../components/Form'

const fetcher = (url) =>
  fetch(url)
    .then((res) => res.json())
    .then((json) => json.data)

const EditPet = () => {
  const router = useRouter()
  const { id } = router.query
  const {
    data: project,
    error,
    isLoading,
  } = useSWR(id ? `/api/projects/${id}` : null, fetcher)

  if (error) return <p>Failed to load</p>
  if (isLoading) return <p>Loading...</p>
  if (!project) return null

  const projectForm = {
    name: project.name,
    description: project.description,
    files: project.files
  }

  return <Form formId="edit-pet-form" projectForm={projectForm} forNewPet={false} />
}

export default EditPet
