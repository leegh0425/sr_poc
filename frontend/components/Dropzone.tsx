"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { X, Upload, FileIcon } from "lucide-react"

interface DropzoneProps {
  onFilesChange: (files: File[]) => void
  files: File[]
  error?: string
}

export function Dropzone({ onFilesChange, files, error }: DropzoneProps) {
  const [previews, setPreviews] = useState<string[]>([])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = [...files, ...acceptedFiles]
      onFilesChange(newFiles)

      acceptedFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = () => {
          setPreviews((prev) => [...prev, reader.result as string])
        }
        reader.readAsDataURL(file)
      })
    },
    [files, onFilesChange],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
  })

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    onFilesChange(newFiles)
    setPreviews(newPreviews)
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl 
          bg-gradient-to-b from-white/85 to-white/75 backdrop-blur-md
          transition-all duration-200 cursor-pointer
          ${
            isDragActive
              ? "border-brand-600/70 ring-4 ring-brand-600/20 scale-[1.02] shadow-float"
              : error
                ? "border-brand-400/80 shadow-depth-1"
                : "border-white/70 hover:border-brand-300 shadow-depth-2 hover:shadow-depth-3"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="p-8 text-center">
          <Upload
            className={`mx-auto h-12 w-12 mb-4 drop-shadow-md ${isDragActive ? "text-brand-600" : "text-gray-400"}`}
          />
          <p className="text-base font-semibold text-gray-700 mb-1 drop-shadow-sm">
            {isDragActive ? "파일을 여기에 놓으세요" : "파일 첨부 (필수)"}
          </p>
          <p className="text-sm text-gray-500">클릭하거나 드래그 앤 드롭으로 파일을 업로드하세요</p>
          <p className="text-xs text-gray-400 mt-2">지원 형식: 이미지, PDF, Word 문서</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-brand-700 font-medium" role="alert">
          {error}
        </p>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/85 border border-white/70 backdrop-blur-md shadow-depth-2 hover:shadow-depth-3 hover:-translate-y-[2px] transition-all duration-200"
            >
              {previews[index] && file.type.startsWith("image/") ? (
                <img
                  src={previews[index] || "/placeholder.svg"}
                  alt={file.name}
                  className="w-10 h-10 object-cover rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shadow-inner-soft">
                  <FileIcon className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1.5 rounded-full hover:bg-brand-50 transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.12)]"
                aria-label={`${file.name} 삭제`}
              >
                <X className="w-4 h-4 text-gray-500 hover:text-brand-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
