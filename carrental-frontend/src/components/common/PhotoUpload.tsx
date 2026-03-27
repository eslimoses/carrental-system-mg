import React, { useState, useRef } from 'react';
import { FiUpload, FiX, FiCamera, FiImage } from 'react-icons/fi';

// Icon aliases
const Upload = FiUpload;
const X = FiX;
const Camera = FiCamera;
const ImageIcon = FiImage;

interface PhotoUploadProps {
  onPhotosChange: (files: File[]) => void;
  maxPhotos?: number;
  label?: string;
  existingPhotos?: string[];
  onRemoveExisting?: (index: number) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onPhotosChange,
  maxPhotos = 5,
  label = 'Upload Photos',
  existingPhotos = [],
  onRemoveExisting
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    
    const remainingSlots = maxPhotos - selectedFiles.length - existingPhotos.length;
    const filesToProcess = Math.min(files.length, remainingSlots);
    
    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    }
    
    const updatedFiles = [...selectedFiles, ...newFiles];
    const updatedPreviews = [...previews, ...newPreviews];
    
    setSelectedFiles(updatedFiles);
    setPreviews(updatedPreviews);
    onPhotosChange(updatedFiles);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
    onPhotosChange(newFiles);
  };

  const totalPhotos = existingPhotos.length + selectedFiles.length;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        {label} ({totalPhotos}/{maxPhotos})
      </label>
      
      {/* Drag & Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-yellow-500 bg-yellow-50'
            : 'border-gray-300 hover:border-yellow-400 hover:bg-gray-50'
        } ${totalPhotos >= maxPhotos ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => totalPhotos < maxPhotos && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={totalPhotos >= maxPhotos}
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full ${dragActive ? 'bg-yellow-100' : 'bg-gray-100'}`}>
            <Upload className={`w-8 h-8 ${dragActive ? 'text-yellow-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="text-gray-600 font-medium">
              {dragActive ? 'Drop photos here' : 'Drag & drop photos here'}
            </p>
            <p className="text-sm text-gray-400 mt-1">or click to browse</p>
          </div>
          <p className="text-xs text-gray-400">PNG, JPG, JPEG up to 10MB each</p>
        </div>
      </div>

      {/* Photo Previews */}
      {(existingPhotos.length > 0 || previews.length > 0) && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {/* Existing Photos */}
          {existingPhotos.map((url, index) => (
            <div key={`existing-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md">
                <img
                  src={url}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {onRemoveExisting && (
                <button
                  onClick={() => onRemoveExisting(index)}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                Saved
              </span>
            </div>
          ))}
          
          {/* New Photo Previews */}
          {previews.map((preview, index) => (
            <div key={`new-${index}`} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded-full">
                New
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
