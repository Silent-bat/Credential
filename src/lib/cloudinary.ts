import { storeFile } from '@/lib/file-storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a file to database storage (previously Cloudinary)
 * @param file File or Buffer to store
 * @param id Unique identifier for the file
 * @param folder Optional folder name for organization
 * @returns Object with secure_url and other metadata
 */
export async function uploadToCloudinary(
  file: File | Buffer | ArrayBuffer,
  id: string = uuidv4(),
  folder: string = 'general'
) {
  try {
    // Get file name and type
    let fileName = id;
    let contentType = 'application/octet-stream';
    
    if (file instanceof File) {
      fileName = file.name || id;
      contentType = file.type;
    }
    
    // Store file using database storage
    const storedFile = await storeFile(file, fileName, contentType, folder);
    
    // Return format similar to the original Cloudinary response
    return {
      secure_url: `/api/file/${storedFile.id}`,
      public_id: storedFile.id,
      folder: storedFile.folder || folder,
      resource_type: (contentType || 'image/png').split('/')[0] || 'image',
      format: (contentType || 'image/png').split('/')[1] || 'png',
      bytes: storedFile.size,
      created_at: storedFile.uploadDate,
      original_filename: storedFile.name
    };
  } catch (error) {
    console.error('Error uploading file to storage:', error);
    throw new Error(`Failed to store file: ${error}`);
  }
} 