import { useState } from 'react'

const FileUpload = () => {
    const [uploadedFiles, setUploadFiles] = useState([]);
    const handleChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        console.log(selectedFiles);
        setUploadFiles(selectedFiles);
    }

    const handleUpload = async (e) => {
        e.preventDefault();

        console.log(uploadedFiles);
        const formData = new FormData();
        // Append each selected file to the FormData object
        files.forEach((file, index) => {
            formData.append(`file${index}`, file);
        });
        try {
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
      
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

    return (
        <div>
            <input 
            type="file" 
            multiple
            name="files"
            onChange={handleChange} />
            <button type="submit" onSubmit={handleUpload}>Upload</button>
        </div>
        
    )
}

export { FileUpload }


