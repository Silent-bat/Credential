import prisma from '@/lib/db';

/**
 * Store a file in the database
 * @param file File to store
 * @param folder Optional folder name for organization
 * @returns File metadata including ID
 */
export async function storeFile(
  file: File | Buffer | ArrayBuffer,
  fileName: string = '',
  contentType: string = 'application/octet-stream',
  folder: string = 'general'
) {
  try {
    // Convert to buffer
    let buffer: Buffer;
    let fileSize: number;
    let name: string = fileName;
    let type: string = contentType;

    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      fileSize = file.size;
      name = fileName || file.name;
      type = contentType || file.type;
    } else if (file instanceof ArrayBuffer) {
      buffer = Buffer.from(file);
      fileSize = buffer.length;
    } else if (Buffer.isBuffer(file)) {
      buffer = file;
      fileSize = buffer.length;
    } else {
      throw new Error('Unsupported file type');
    }

    // Store file in database
    const storedFile = await prisma.fileStorage.create({
      data: {
        name,
        contentType: type,
        size: fileSize,
        folder,
        data: buffer,
        uploadDate: new Date(),
      },
    });

    // Return metadata only (not the file content)
    const { data, ...metadata } = storedFile;
    return metadata;
  } catch (error) {
    console.error('Error storing file:', error);
    throw new Error(`Failed to store file: ${error}`);
  }
}

/**
 * Retrieve a file from the database
 * @param fileId ID of the file to retrieve
 * @returns File data and metadata
 */
export async function getFile(fileId: string) {
  try {
    const file = await prisma.fileStorage.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      throw new Error('File not found');
    }

    return file;
  } catch (error) {
    console.error('Error retrieving file:', error);
    throw new Error(`Failed to retrieve file: ${error}`);
  }
}

/**
 * Delete a file from the database
 * @param fileId ID of the file to delete
 * @returns Success status
 */
export async function deleteFile(fileId: string) {
  try {
    await prisma.fileStorage.delete({
      where: { id: fileId },
    });

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw new Error(`Failed to delete file: ${error}`);
  }
} 