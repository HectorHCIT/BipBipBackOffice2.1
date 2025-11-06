import { Injectable, signal, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { tap, switchMap, map } from 'rxjs/operators';
import { DataService } from '@core/services/data.service';
import { ImageUploadService } from '@shared/services/image-upload.service';
import { type Channel, type ChannelList, type ChannelListUI, type Brand, type BrandAPI, type ChannelPayload } from '../models';

/**
 * ChannelService
 *
 * Service para gestionar canales de comunicación de la app móvil
 * Maneja CRUD de canales con integración a S3 para iconos
 */
@Injectable({
  providedIn: 'root'
})
export class ChannelService {
  private readonly dataService = inject(DataService);
  private readonly imageUploadService = inject(ImageUploadService);

  // State signals
  readonly channels = signal<ChannelListUI[]>([]);
  readonly brands = signal<Brand[]>([]);
  readonly isLoading = signal(false);

  /**
   * Obtener lista de canales
   * Mapea las marcas de API a formato UI con isSelected
   */
  getChannelList(): Observable<ChannelListUI[]> {
    this.isLoading.set(true);

    return this.dataService.get$<ChannelList[]>('Channel/ChannelList').pipe(
      map(channels => channels.map(channel => this.mapChannelToUI(channel))),
      tap(channels => {
        this.channels.set(channels);
        this.isLoading.set(false);
      })
    );
  }

  /**
   * Mapear canal de API a formato UI
   * Convierte BrandAPI[] a Brand[] con isSelected
   */
  private mapChannelToUI(channel: ChannelList): ChannelListUI {
    return {
      ...channel,
      brandsList: channel.brandsList.map(apiBrand => ({
        idBrand: apiBrand.idBrand,
        brandName: apiBrand.nameBrand,
        logoUrl: apiBrand.logoBrand,
        isSelected: true // Las marcas asociadas al canal están seleccionadas
      }))
    };
  }

  /**
   * Obtener detalles de un canal
   */
  getChannelDetail(channelId: number): Observable<Channel> {
    return this.dataService.get$<Channel[] | Channel>('Channel/ChannelDetail', {
      channelId
    }).pipe(
      map(response => {
        // El API devuelve un array con un solo elemento
        if (Array.isArray(response)) {
          return response[0];
        }
        return response;
      })
    );
  }

  /**
   * Crear nuevo canal
   */
  createChannel(payload: ChannelPayload): Observable<any> {
    return this.dataService.post$('Channel/CreateChannel', payload);
  }

  /**
   * Actualizar canal existente
   */
  updateChannel(idChannel: number, payload: ChannelPayload): Observable<any> {
    return this.dataService.put$(`Channel/UpdateChannel`, payload, {
      idChannel
    });
  }

  /**
   * Obtener lista de marcas
   * Mapea la respuesta de la API al formato UI con isSelected
   */
  getBrandsList(): Observable<Brand[]> {
    return this.dataService.get$<BrandAPI[]>('Brand/BrandList').pipe(
      map(apibrands => apibrands.map(apiBrand => ({
        idBrand: apiBrand.idBrand,
        brandName: apiBrand.nameBrand,
        logoUrl: apiBrand.logoBrand,
        isSelected: false
      }))),
      tap(brands => {
        this.brands.set(brands);
      })
    );
  }

  /**
   * Upload de imagen de icono a S3
   * @param file - Archivo de imagen
   * @returns Observable<string> - URL de la imagen subida
   */
  uploadIcon(file: File): Observable<string> {
    return this.imageUploadService.uploadChannelImage(file.name, file, true);
  }

  /**
   * Limpiar estado
   */
  clear(): void {
    this.channels.set([]);
    this.brands.set([]);
    this.isLoading.set(false);
  }
}
