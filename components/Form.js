import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { mutate } from 'swr'
import Link from 'next/link'

const Form = ({ formId, projectForm, projectFiles, forNewProject = true }) => {
  const router = useRouter()
  const contentType = 'application/json'
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState(projectFiles);
  const [newFiles, setNewFiles] = useState([]);
  const [uploadState, setUploadState] = useState(0);
  const [uploadedFiles, setUploadFiles] = useState([]);
  const [dataChanged, setDataChanged] = useState(false);

  const [form, setForm] = useState({
    name: projectForm.name,
    description: projectForm.description,
    files: projectForm.files
  })

  const fileState = {
    0: '',
    1: 'File Uploading...',
    2: 'Uploaded!'
  }

  useEffect(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Listen to Next.js route change events
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [dataChanged]);

  const handleBeforeUnload = (event) => {
    if (dataChanged) {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes! Are you sure you want to leave?';
    }
  };

  const handleRouteChange = (url) => {
    if (dataChanged) {
      const userConfirmed = window.confirm('You have unsaved changes! Are you sure you want to leave?');
      if (!userConfirmed) {
        router.events.emit('routeChangeError');
        throw 'Route change aborted.'; // This error can be caught by an error boundary or it will just log to the console, it's mainly to stop the route change.
      }
    }
  };

  // Post Method to update files state from false to true
  const changeFilesState = async () => {
    console.log(newFiles)
    const res = await fetch(`/api/files/changestate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ files: newFiles }),  // Send newFiles array as a part of request body
    })
    return res;
}

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
      setMessage('Failed to update project')
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

  const handleFilesChange = async (e) => {
    e.preventDefault();
    setUploadState(1)
    const selectedFiles = Array.from(e.target.files);
    setUploadFiles(selectedFiles);
    setDataChanged(true);

    const formData = new FormData();
    // Append each selected file to the FormData object
    selectedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
    });
    try {
        const response = await fetch('/api/files/upload', {
          method: 'POST',
          body: formData,
        });
        const {data} = await response.json();
        if (response.ok) {
          // Handle success, e.g., show a success message
          setNewFiles(data);
          // console.log(newFiles);
          setForm({
            ...form,
            ['files']: form.files.concat(data),
          })
          setUploadState(2)
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

    setDataChanged(true)

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = formValidate()
    const res = await changeFilesState();
    if (!res.ok) {
      throw new Error(res)
    }
    if (Object.keys(errs).length === 0) {
      setDataChanged(false);
      forNewProject ? postData(form) : putData(form)
    } else {
      setErrors({ errs })
    }
  }

  const handleFileDelete = async (e) => {
    e.preventDefault()
    const projectId = router.query.id;
    const fileId = e.target.value;

    // Optimistically update the UI
    // const newFiles = form.files.filter(file => file !== fileId);
    setForm(prevForm => ({
      ...prevForm,
      files: prevForm.files.filter(file => file !== fileId),
    }
    ));
    try {
      const response = await fetch(`/api/files/delete/${projectId}/${fileId}`, {
        method: 'DELETE',
      });

      if (response.status === 200) {
        setFiles(files.filter(file => file._id !== fileId));
        alert('File deleted successfully');
      } else {
        throw new Error('Failed to delete file on server');
      }
    } catch(err) {
      console.log(err)
      setForm(prevForm => ({
        ...prevForm,
        files: [...prevForm.files, fileId]
      }));
      alert('Failed to delete file');
    }

  }

  return (
    <div>
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
          {files.map((data, index) => (
            <div className="form-container" key={index}>
            <span>
              <Link href={data.url}>
                {data.description}
              </Link>
            </span>
            <button className="btn delete" onClick={handleFileDelete} value={data._id} type="button">DELETE</button>
          </div>
            
          ))}
        </ul>}
        <input 
          type="file" 
          multiple
          name="files"
          onChange={handleFilesChange} />
        <p>{fileState[uploadState]}</p>
        <span>{uploadedFiles.map(file => file.name).join(', ')}</span>

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
    </div>
  )
}

export default Form
