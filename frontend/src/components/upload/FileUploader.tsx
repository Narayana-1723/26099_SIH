import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, X, AlertCircle } from 'lucide-react';
import { CPSE_LIST } from '../../utils/constants';

interface FileUploaderProps {
  onUpload: (file: File, cpse: string) => Promise<void>;
  isUploading: boolean;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onUpload, isUploading }) => {
  const [selectedCpse, setSelectedCpse] = useState<string>('ONGC');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    setErrorMsg(null);
    const validExtensions = ['.csv', '.xlsx', '.json'];
    const hasValidExt = validExtensions.some((ext) => uploadedFile.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      setErrorMsg('Unsupported file format. Please upload CSV, XLSX, or JSON.');
      return;
    }

    if (uploadedFile.size > 25 * 1024 * 1024) {
      setErrorMsg('File size exceeds the 25MB enterprise ingestion limit.');
      return;
    }

    setFile(uploadedFile);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a material dataset file.');
      return;
    }
    await onUpload(file, selectedCpse);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs">
      <div className="space-y-5">
        {/* CPSE Selector */}
        <div>
          <label htmlFor="cpse-select" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Select Originating CPSE Enterprise <span className="text-red-500">*</span>
          </label>
          <select
            id="cpse-select"
            value={selectedCpse}
            onChange={(e) => setSelectedCpse(e.target.value)}
            disabled={isUploading}
            className="w-full sm:w-80 px-3 py-2 text-sm border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy focus:border-transparent"
          >
            {CPSE_LIST.map((cpse) => (
              <option key={cpse.code} value={cpse.code}>
                {cpse.code} — {cpse.name}
              </option>
            ))}
          </select>
        </div>

        {/* Drag and Drop Zone */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Material Catalog File <span className="text-red-500">*</span>
          </label>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
              dragActive
                ? 'border-gov-navy bg-blue-50/60'
                : file
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleChange}
              disabled={isUploading}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-900">{file.name}</div>
                <div className="text-xs text-slate-500 font-mono">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for Ingestion
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  disabled={isUploading}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Remove file</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mb-1">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-slate-800">
                  <span className="font-bold text-gov-navy hover:underline">Click to browse</span> or drag &amp; drop dataset file here
                </div>
                <div className="text-xs text-slate-500">
                  Supported formats: <strong className="text-slate-700">CSV, XLSX, JSON</strong> (Max 25MB)
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error message if any */}
        {errorMsg && (
          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 p-3 rounded border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="submit"
            disabled={!file || isUploading}
            className="btn-primary px-6 py-2.5 text-sm"
          >
            {isUploading ? 'Initializing Batch Job...' : 'Upload & Start Harmonization Job'}
          </button>
        </div>
      </div>
    </form>
  );
};
