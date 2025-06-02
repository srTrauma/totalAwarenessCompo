import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ProfileImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string | null) => void;
  userId?: number;
  className?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({
  currentImage,
  onImageChange,
  userId,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede exceder 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida');
      return;
    }

    setUploading(true);
      try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('image', file);
      if (userId) {
        formData.append('userId', userId.toString());
      }

      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      setPreview(data.imageUrl);
      onImageChange(data.imageUrl);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  }, [onImageChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const removeImage = () => {
    setPreview(null);
    onImageChange(null);
    toast.success('Imagen eliminada');
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Foto de perfil"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            disabled={uploading}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`
            w-32 h-32 rounded-full border-2 border-dashed border-blue-300 
            flex items-center justify-center cursor-pointer
            transition-colors hover:border-blue-500 hover:bg-blue-50
            ${isDragActive ? 'border-blue-500 bg-blue-50' : ''}
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={uploading} />
          <div className="text-center">
            <CameraIcon className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-blue-600">
              {uploading ? 'Subiendo...' : 'Subir foto'}
            </p>
          </div>
        </div>
      )}
      
      {preview && (
        <div
          {...getRootProps()}
          className={`
            px-4 py-2 border border-blue-300 rounded-lg cursor-pointer
            text-sm text-blue-600 hover:bg-blue-50 transition-colors
            ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input {...getInputProps()} disabled={uploading} />
          {uploading ? 'Subiendo...' : 'Cambiar foto'}
        </div>
      )}
    </div>
  );
};

export default ProfileImageUpload;
