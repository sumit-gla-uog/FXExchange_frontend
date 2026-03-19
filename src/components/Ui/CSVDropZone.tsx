import { useDropzone } from "react-dropzone"
import { Text } from "@salt-ds/core"
import { UploadIcon } from "@salt-ds/icons"
import "./CSVDropZone.css"

interface CsvDropzoneProps {
  onUpload: (file: File) => void
  hint?: string
}

export const CSVDropZone = ({ onUpload, hint = "format: pair_code, rate" }: CsvDropzoneProps) => {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    onDrop: (files) => files[0] && onUpload(files[0]),
  })

  return (
    <div {...getRootProps()} className={`csv-dropzone ${isDragActive ? "active" : "idle"}`}>
      <input {...getInputProps()} />
      <UploadIcon size={2} className="upload-icon" />
      {acceptedFiles.length > 0 ? (
        <Text className="file-ready">{acceptedFiles[0].name} ready to upload</Text>
      ) : isDragActive ? (
        <Text className="drop-hint">Drop CSV here...</Text>
      ) : (
        <>
          <Text className="main-text">Drag & drop CSV file here</Text>
          <Text styleAs="label" className="sub-text">or click to browse — {hint}</Text>
        </>
      )}
    </div>
  )
}