"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";

interface ResumeDropzoneProps {
  onFileAccepted: (file: File) => void;
  isLoading: boolean;
}

export default function ResumeDropzone({ onFileAccepted, isLoading }: ResumeDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const { t, dir } = useLanguage();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error(t("file_too_large") || "File is too large. Max size is 5MB");
      return;
    }
    
    setFile(selectedFile);
    onFileAccepted(selectedFile);
    toast.success(t("file_uploaded") || "File uploaded successfully");
  }, [onFileAccepted, t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1,
    disabled: isLoading
  });

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="w-full max-w-2xl mx-auto" dir={dir}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragActive ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-300 dark:border-gray-700"}
          ${isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-green-400"}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        {isDragActive ? (
          <p className="text-lg text-gray-700 dark:text-gray-300">{t("drop_here") || "Drop your resume here..."}</p>
        ) : (
          <div>
            <p className="text-lg mb-2 text-gray-700 dark:text-gray-300">{t("drag_drop") || "Drag & drop your resume here"}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("click_to_select") || "or click to select a file"}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">{t("file_types") || "PDF, DOC, DOCX (Max 5MB)"}</p>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{(file.size / 1024).toFixed(0)} KB</span>
          </div>
          <button onClick={removeFile} className="text-red-500 cursor-pointer hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}