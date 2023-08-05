import { useState } from 'react'
import { useRouter } from 'next/router'
import { mutate } from 'swr'
import { FileUpload } from './FileUpload'


const Form = ({ formId, projectForm, forNewPet = true }) => {
  const router = useRouter()
  const contentType = 'application/json'
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [uploadedFiles, setUploadFiles] = useState([]);

  const [form, setForm] = useState({
    name: projectForm.name,
    description: projectForm.description,
    files: projectForm.files
  })

  /* The PUT method edits an existing entry in the mongodb database. */
  const putData = async (form) => {
    const { id } = router.query

    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PUT',
        headers: {
          Accept: contentType,
          'Content-Type': contentType,
        },
        body: JSON.stringify(form),
      })

      // Throw error with status code in case Fetch API req failed
      if (!res.ok) {
        throw new Error(res.status)
      }

      const { data } = await res.json()

      mutate(`/api/projects/${id}`, data, false) // Update the local data without a revalidation
      router.push('/')
    } catch (error) {
      setMessage('Failed to update pet')
    }
  }

  /* The POST method adds a new entry in the mongodb database. */
  const postData = async (form) => {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          Accept: contentType,
          'Content-Type': contentType,
        },
        body: JSON.stringify(form),
      })

      // Throw error with status code in case Fetch API req failed
      if (!res.ok) {
        throw new Error(res.status)
      }

      router.push('/')
    } catch (error) {
      setMessage('Failed to add pet')
    }
  }

  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    console.log(selectedFiles);
    setUploadFiles(selectedFiles);
}

const handleUpload = async (e) => {
  e.preventDefault();

  const formData = new FormData();
  // Append each selected file to the FormData object
  uploadedFiles.forEach((file, index) => {
      formData.append(`file${index}`, file);
  });
  try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const {data} = await response.json();
      console.log(data);
      if (response.ok) {
        // Handle success, e.g., show a success message
        console.log('Files uploaded successfully');
      } else {
        // Handle error, e.g., show an error message
        console.error('Error uploading files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  }


  const handleChange = (e) => {
    const target = e.target
    const value = target.value
    const name = target.name

    setForm({
      ...form,
      [name]: value,
    })
  }


  /* Makes sure pet info is filled for pet name, owner name, species, and image url*/
  const formValidate = () => {
    let err = {}
    if (!form.name) err.name = 'Name is required'
    if (!form.description) err.owner_name = 'Description is required'
    return err
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = formValidate()
    if (Object.keys(errs).length === 0) {
      forNewPet ? postData(form) : putData(form)
    } else {
      setErrors({ errs })
    }
  }

  return (
    <>
      <form id={formId} onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          type="text"
          maxLength="20"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="description">Description</label>
        <input
          type="text"
          maxLength="50"
          name="description"
          value={form.description}
          onChange={handleChange}
          required
        />

        <label htmlFor="files">Files</label>
        {<ul>
          {form.files.map((data, index) => (
            <li key={index}>{data} </li>
          ))}
        </ul>}
        {/* <FileUpload/> */}
        <input 
          type="file" 
          multiple
          name="files"
          onChange={handleFilesChange} />
        <button onClick={handleUpload}>Upload</button>

        <button type="submit" className="btn">
          Submit
        </button>
      </form>
      <p>{message}</p>
      <div>
        {Object.keys(errors).map((err, index) => (
          <li key={index}>{err}</li>
        ))}
      </div>
    </>
  )
}

export default Form
