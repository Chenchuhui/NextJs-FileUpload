import Form from '../components/Form'

const NewProject = () => {
  const petForm = {
    name: '',
    description: '',
    files: [],
  }
  let files = []

  return <Form formId="add-pet-form" projectForm={petForm} projectFiles={files} />
}

export default NewProject
