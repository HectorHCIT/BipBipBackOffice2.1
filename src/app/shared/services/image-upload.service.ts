import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadImage {
  presignedUrl: string;
  url: string;
}

export interface ImageUploadOptions {
  folder?: string;
  customPath?: string;
  removeSpaces?: boolean;
  customFileName?: string;
  preserveFileExtension?: boolean;
  // Opciones de optimización integradas
  optimize?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0 for WebP/JPEG
  format?: 'webp' | 'jpeg' | 'png' | 'original';
  maxSizeKB?: number; // Maximum file size in KB
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {

  constructor(private http: HttpClient) { }

  /**
   * Creates storage for image and uploads it to S3 (with optional optimization)
   * @param name - Image name
   * @param file - File to upload
   * @param options - Optional configuration including optimization
   * @returns Observable<string> - Returns the uploaded image URL
   */
  createStorageForImage(name: string, file: File, options: ImageUploadOptions = {}): Observable<string> {
    const {
      folder = 'general',
      customPath,
      removeSpaces = true,
      customFileName,
      preserveFileExtension = false,
      // Optimization options
      optimize = false,
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'webp',
      maxSizeKB = 500
    } = options;

    try {
      return new Observable<string>((observer) => {
        // Function to process upload (with or without optimization)
        const processUpload = async (fileToUpload: File) => {
          // Determine the final image name
          let finalImageName: string;

          if (customFileName) {
            // Use custom filename (for chat: chat_${timestamp}.${extension})
            finalImageName = customFileName;
            if (preserveFileExtension && fileToUpload.name.includes('.')) {
              const fileExtension = fileToUpload.name.split('.').pop();
              finalImageName = `${customFileName}.${fileExtension}`;
            }
          } else {
            // Use provided name with optional space removal
            finalImageName = removeSpaces ? name.replace(/\s/g, '') : name;
          }

          // Determine the endpoint URL
          const endpoint = customPath || `${environment.s3BuckedBrands}/BackOfficeMedia`;

          // Create the payload
          const payload = { image: finalImageName, folder };

          this.http.post<UploadImage>(endpoint, payload).subscribe({
            next: (response) => {
              this.uploadImageToS3(response.presignedUrl, fileToUpload).subscribe({
                next: () => {
                  observer.next(response.url);
                  observer.complete();
                },
                error: (error) => {
                  observer.error(error);
                }
              });
            },
            error: (error) => {
              observer.error(error);
            }
          });
        };

        // If optimization is enabled, optimize first, then upload
        if (optimize && this.isImageFile(file)) {
          this.optimizeImage(file, { maxWidth, maxHeight, quality, format, maxSizeKB })
            .then((optimizedFile) => {
              console.log(`Image optimized: ${file.size} bytes → ${optimizedFile.size} bytes (${((1 - optimizedFile.size/file.size) * 100).toFixed(1)}% reduction)`);
              processUpload(optimizedFile);
            })
            .catch((error) => {
              console.warn('Image optimization failed, using original file:', error);
              processUpload(file);
            });
        } else {
          // No optimization, upload original file
          processUpload(file);
        }
      });
    } catch (error) {
      throw new Error(error as string);
    }
  }

  /**
   * Uploads image to S3 using presigned URL
   * @param presignedUrl - The presigned URL from AWS S3
   * @param file - File to upload
   * @returns Observable<void>
   */
  private uploadImageToS3(presignedUrl: string, file: File): Observable<void> {
    return new Observable<void>((observer) => {
      const headers = new HttpHeaders({
        'Skip-Auth-Interceptor': 'true',
        'Content-Type': file.type
      });

      this.http.put(presignedUrl, file, { headers }).subscribe({
        next: () => {
          observer.next();
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  /**
   * Checks if file is an image
   */
  private isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
  }

  /**
   * Convenience method for brand images
   * @param name - Image name
   * @param file - File to upload
   * @param optimize - Whether to optimize the image (default: false for backward compatibility)
   * @returns Observable<string>
   */
  uploadBrandImage(name: string, file: File, optimize: boolean = false): Observable<string> {
    return this.createStorageForImage(name, file, {
      folder: 'brands',
      removeSpaces: true,
      optimize,
      maxWidth: optimize ? 800 : undefined,
      maxHeight: optimize ? 800 : undefined,
      quality: optimize ? 0.85 : undefined,
      format: optimize ? 'webp' : undefined,
      maxSizeKB: optimize ? 200 : undefined
    });
  }

  /**
   * Convenience method for loyalty program images
   * @param name - Image name
   * @param file - File to upload
   * @param optimize - Whether to optimize the image (default: false for backward compatibility)
   * @returns Observable<string>
   */
  uploadLoyaltyImage(name: string, file: File, optimize: boolean = false): Observable<string> {
    return this.createStorageForImage(name, file, {
      folder: 'image/catalog/Loyalty',
      removeSpaces: true,
      optimize,
      maxWidth: optimize ? 600 : undefined,
      maxHeight: optimize ? 400 : undefined,
      quality: optimize ? 0.8 : undefined,
      format: optimize ? 'webp' : undefined,
      maxSizeKB: optimize ? 150 : undefined
    });
  }

  /**
   * Convenience method for channel images
   * @param name - Image name
   * @param file - File to upload
   * @param optimize - Whether to optimize the image (default: false for backward compatibility)
   * @returns Observable<string>
   */
  uploadChannelImage(name: string, file: File, optimize: boolean = false): Observable<string> {
    return this.createStorageForImage(name, file, {
      customPath: `${environment.s3BuckedBrands}/Brands`,
      removeSpaces: true,
      optimize,
      maxWidth: optimize ? 800 : undefined,
      maxHeight: optimize ? 600 : undefined,
      quality: optimize ? 0.85 : undefined,
      format: optimize ? 'webp' : undefined,
      maxSizeKB: optimize ? 200 : undefined
    });
  }

  /**
   * Convenience method for chat images with dynamic folder structure
   * @param uid - User ID for folder structure
   * @param file - File to upload
   * @param timestamp - Timestamp for unique filename
   * @param optimize - Whether to optimize the image (default: false for backward compatibility)
   * @returns Observable<string>
   */
  uploadChatImage(uid: string, file: File, timestamp: number, optimize: boolean = false): Observable<string> {
    const env = environment.production ? 'prod' : 'dev';

    return this.createStorageForImage('', file, {
      customPath: `${environment.s3BuckedBrands}/Upload`,
      folder: `${env}/${uid}/`,
      customFileName: `chat_${timestamp}`,
      preserveFileExtension: true,
      optimize,
      maxWidth: optimize ? 1200 : undefined,
      maxHeight: optimize ? 1200 : undefined,
      quality: optimize ? 0.75 : undefined,
      format: optimize ? 'webp' : undefined,
      maxSizeKB: optimize ? 300 : undefined
    });
  }

  // ===== IMAGE OPTIMIZATION FUNCTIONS =====

  /**
   * Optimizes image: converts to WebP, compresses, and resizes if needed
   * @param file - Original image file
   * @param options - Optimization options
   * @returns Promise<File> - Optimized image file
   */
  async optimizeImage(file: File, options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: string;
    maxSizeKB?: number;
  } = {}): Promise<File> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'webp',
      maxSizeKB = 500
    } = options;

    try {
      // Create canvas and context
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Load image
      const img = await this.loadImageFromFile(file);

      // Calculate new dimensions
      const { width, height } = this.calculateDimensions(img.width, img.height, maxWidth, maxHeight);

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to optimized blob
      const optimizedBlob = await this.canvasToOptimizedBlob(canvas, format, quality, maxSizeKB);

      // Generate new filename with correct extension
      const originalName = file.name.split('.')[0];
      const newExtension = format === 'original' ? file.name.split('.').pop() : format;
      const newFileName = `${originalName}.${newExtension}`;

      // Create new File object
      return new File([optimizedBlob], newFileName, {
        type: optimizedBlob.type,
        lastModified: Date.now()
      });

    } catch (error) {
      console.error('Error optimizing image:', error);
      // Return original file if optimization fails
      return file;
    }
  }

  /**
   * Loads an image file and returns HTMLImageElement
   */
  private loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculates new dimensions while maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number, height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // If image is smaller than max dimensions, don't upscale
    if (width <= maxWidth && height <= maxHeight) {
      return { width, height };
    }

    // Calculate scaling factor
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: Math.round(width * ratio),
      height: Math.round(height * ratio)
    };
  }

  /**
   * Converts canvas to optimized blob with quality adjustment
   */
  private async canvasToOptimizedBlob(
    canvas: HTMLCanvasElement,
    format: string,
    initialQuality: number,
    maxSizeKB: number
  ): Promise<Blob> {
    let quality = initialQuality;
    let blob: Blob | null = null;
    const minQuality = 0.1;
    const qualityStep = 0.1;

    // Determine MIME type
    const mimeType = this.getMimeType(format);

    while (quality >= minQuality) {
      blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, mimeType, quality);
      });

      if (!blob) {
        throw new Error('Failed to create blob from canvas');
      }

      const sizeKB = blob.size / 1024;

      // If size is acceptable or we've reached minimum quality, return blob
      if (sizeKB <= maxSizeKB || quality <= minQuality) {
        console.log(`Optimized to ${sizeKB.toFixed(1)}KB with quality ${quality}`);
        return blob;
      }

      // Reduce quality and try again
      quality -= qualityStep;
    }

    return blob!;
  }

  /**
   * Gets MIME type for format
   */
  private getMimeType(format: string): string {
    switch (format) {
      case 'webp':
        return 'image/webp';
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      default:
        return 'image/webp'; // Default to WebP
    }
  }

}
