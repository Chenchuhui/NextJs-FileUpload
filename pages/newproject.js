import Form from '../components/Form'

const NewProject = () => {
  const petForm = {
    name: '',
    description: '',
    files: [],
  }

  return <Form formId="add-pet-form" projectForm={petForm} />
}

export default NewProject
