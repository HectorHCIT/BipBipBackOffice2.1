import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import { type ApiUploadImageRequest, type ApiUploadImageResponse } from '../models';

/**
 * ImageUploadService
 *
 * Service for uploading images to S3
 * Two-step process:
 * 1. Get pre-signed URL from backend
 * 2. Upload file directly to S3 using pre-signed URL
 */
@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private readonly dataService = inject(DataService);
  private readonly http = inject(HttpClient);

  /**
   * Upload image to S3 and return the final URL
   *
   * @param file File to upload
   * @param folder S3 folder path (default: 'credentialUser')
   * @returns Observable with final S3 URL
   */
  uploadCredentialImage(file: File, folder: string = 'credentialUser'): Observable<string> {
    // Step 1: Generate filename and get pre-signed URL
    const filename = this.generateFilename(file.name);

    const request: ApiUploadImageRequest = {
      image: filename,
      folder: folder
    };

    return this.dataService.post$<ApiUploadImageResponse>('BackOfficeMedia', request).pipe(
      switchMap(response => {
        // Step 2: Upload file to S3 using pre-signed URL
        return this.uploadToS3(response.presignedUrl, file).pipe(
          map(() => response.url) // Return final URL after successful upload
        );
      })
    );
  }

  /**
   * Upload file to S3 using pre-signed URL
   * This bypasses auth interceptor
   *
   * @param presignedUrl Pre-signed S3 URL
   * @param file File to upload
   * @returns Observable<void>
   */
  private uploadToS3(presignedUrl: string, file: File): Observable<void> {
    // Create HttpContext to bypass auth interceptor if needed
    // Note: This depends on how the interceptor is configured
    const headers = {
      'Content-Type': file.type
    };

    return this.http.put<void>(presignedUrl, file, {
      headers,
      // Add context to bypass interceptor if needed
      // context: new HttpContext().set(BYPASS_INTERCEPTOR, true)
    });
  }

  /**
   * Generate filename for S3
   * Removes hyphens and truncates to 10 chars + extension
   *
   * @param originalName Original filename
   * @returns Sanitized filename
   */
  private generateFilename(originalName: string): string {
    const extension = originalName.substring(originalName.lastIndexOf('.'));
    const nameWithoutExt = originalName
      .substring(0, originalName.lastIndexOf('.'))
      .replace(/-/g, ''); // Remove hyphens

    // Truncate to 10 characters
    const truncatedName = nameWithoutExt.substring(0, Math.min(10, nameWithoutExt.length));

    return `${truncatedName}${extension}`;
  }

  /**
   * Validate file before upload
   *
   * @param file File to validate
   * @param maxSizeInMB Maximum file size in MB
   * @param allowedTypes Allowed MIME types
   * @returns Error message if invalid, null if valid
   */
  validateFile(
    file: File,
    maxSizeInMB: number = 5,
    allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
  ): string | null {
    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `El archivo es demasiado grande. Tamaño máximo: ${maxSizeInMB}MB`;
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido. Formatos permitidos: ${allowedTypes.join(', ')}`;
    }

    return null;
  }

  /**
   * Read file as data URL for preview
   *
   * @param file File to read
   * @returns Observable with data URL
   */
  readFileAsDataURL(file: File): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();

      reader.onload = () => {
        observer.next(reader.result as string);
        observer.complete();
      };

      reader.onerror = error => {
        observer.error(error);
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Create image from file for preview
   *
   * @param file File to preview
   * @returns Observable with image element
   */
  createImagePreview(file: File): Observable<HTMLImageElement> {
    return this.readFileAsDataURL(file).pipe(
      map(dataUrl => {
        const img = new Image();
        img.src = dataUrl;
        return img;
      })
    );
  }
}
