import { Component, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EMOJI_DATA, EmojiCategory } from './emoji-data';

/**
 * Componente custom de emoji picker
 *
 * Características:
 * - Categorías organizadas
 * - Búsqueda de emojis
 * - Emojis recientes
 * - Sin dependencias externas
 */
@Component({
  selector: 'app-emoji-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './emoji-picker.component.html',
  styleUrls: ['./emoji-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmojiPickerComponent {
  @Output() emojiSelect = new EventEmitter<string>();

  // Estado del componente
  categories = signal<EmojiCategory[]>(EMOJI_DATA);
  selectedCategoryId = signal<string>('rostros_emociones');
  searchTerm = signal<string>('');
  recentEmojis = signal<string[]>(this.loadRecentEmojis());

  /**
   * Obtiene la categoría seleccionada
   */
  get selectedCategory(): EmojiCategory | undefined {
    return this.categories().find(c => c.id === this.selectedCategoryId());
  }

  /**
   * Obtiene los emojis filtrados por búsqueda
   */
  get filteredEmojis() {
    const search = this.searchTerm().toLowerCase();

    if (!search) {
      return this.selectedCategory?.emojis || [];
    }

    // Buscar en todas las categorías
    const allEmojis = this.categories().flatMap(cat => cat.emojis);
    return allEmojis.filter(emoji =>
      emoji.nombre.toLowerCase().includes(search)
    );
  }

  /**
   * Selecciona una categoría
   */
  selectCategory(categoryId: string): void {
    this.selectedCategoryId.set(categoryId);
    this.searchTerm.set('');
  }

  /**
   * Selecciona un emoji
   */
  selectEmoji(emoji: string): void {
    this.emojiSelect.emit(emoji);
    this.addToRecent(emoji);
  }

  /**
   * Maneja el cambio en el input de búsqueda
   */
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  /**
   * Añade un emoji a los recientes
   */
  private addToRecent(emoji: string): void {
    const recent = this.recentEmojis();
    const filtered = recent.filter(e => e !== emoji);
    const updated = [emoji, ...filtered].slice(0, 24); // Máximo 24 recientes

    this.recentEmojis.set(updated);
    this.saveRecentEmojis(updated);
  }

  /**
   * Carga los emojis recientes desde localStorage
   */
  private loadRecentEmojis(): string[] {
    try {
      const stored = localStorage.getItem('chat-recent-emojis');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Guarda los emojis recientes en localStorage
   */
  private saveRecentEmojis(emojis: string[]): void {
    try {
      localStorage.setItem('chat-recent-emojis', JSON.stringify(emojis));
    } catch {
      // Ignorar errores de localStorage
    }
  }

  /**
   * Obtiene el ícono de una categoría
   */
  getCategoryIcon(categoryId: string): string {
    const icons: Record<string, string> = {
      'rostros_emociones': 'pi-face-smile',
      'gestos_manos': 'pi-thumbs-up',
      'personas': 'pi-users',
      'animales': 'pi-github',
      'comida_bebida': 'pi-shopping-cart',
      'actividades': 'pi-play',
      'viajes_lugares': 'pi-map-marker',
      'objetos': 'pi-box',
      'simbolos': 'pi-heart',
      'naturaleza_clima': 'pi-sun',
      'banderas': 'pi-flag'
    };
    return icons[categoryId] || 'pi-circle';
  }
}
