import React, { useCallback, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  existingImages: string[];
  onExistingImagesChange: (images: string[]) => void;
  newFiles: File[];
  onNewFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function ImageUpload({
  existingImages,
  onExistingImagesChange,
  newFiles,
  onNewFilesChange,
  maxFiles = 10,
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    files.forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not a supported image type.`);
        return;
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds ${maxSizeMB}MB limit.`);
        return;
      }
      validFiles.push(file);
    });

    return validFiles;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = validateFiles(droppedFiles);

        if (existingImages.length + newFiles.length + validFiles.length > maxFiles) {
          toast.error(`You can only upload a maximum of ${maxFiles} images.`);
          return;
        }

        onNewFilesChange([...newFiles, ...validFiles]);
      }
    },
    [existingImages, newFiles, maxFiles, onNewFilesChange]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = validateFiles(selectedFiles);

      if (existingImages.length + newFiles.length + validFiles.length > maxFiles) {
        toast.error(`You can only upload a maximum of ${maxFiles} images.`);
        return;
      }

      onNewFilesChange([...newFiles, ...validFiles]);
    }
  };

  const removeExistingImage = (index: number) => {
    const updated = [...existingImages];
    updated.splice(index, 1);
    onExistingImagesChange(updated);
  };

  const removeNewFile = (index: number) => {
    const updated = [...newFiles];
    updated.splice(index, 1);
    onNewFilesChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${isDragging
            ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
            : "border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          }`}
      >
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
          <UploadCloud className={`h-10 w-10 ${isDragging ? "text-indigo-500" : "text-gray-400"}`} />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Drag and drop images here, or click to select files
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            PNG, JPG, WEBP up to {maxSizeMB}MB (Max {maxFiles} images)
          </p>
        </div>
      </div>

      {/* Previews */}
      {(existingImages.length > 0 || newFiles.length > 0) && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Selected Images</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {/* Existing Images */}
            {existingImages.map((url, index) => (
              <div
                key={`existing-${index}`}
                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                <img
                  src={url.startsWith("http") ? url : `${import.meta.env.VITE_API_URL || "http://localhost:8000"}${url}`}
                  alt={`Product image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="p-1 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {index === 0 && (
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                      Main Image
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* New Files */}
            {newFiles.map((file, index) => (
              <div
                key={`new-${index}`}
                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`New file ${index + 1}`}
                  className="w-full h-full object-cover"
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2">
                  <button
                    type="button"
                    onClick={() => removeNewFile(index)}
                    className="p-1 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {existingImages.length === 0 && index === 0 && (
                  <div className="absolute bottom-2 left-2 right-2 text-center">
                    <span className="bg-blue-600/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                      Main Image (New)
                    </span>
                  </div>
                )}
                <div className="absolute top-2 left-2">
                  <span className="bg-green-500/90 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                    New File
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
