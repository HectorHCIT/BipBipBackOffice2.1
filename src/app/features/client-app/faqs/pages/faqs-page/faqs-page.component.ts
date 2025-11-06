import { Component, ChangeDetectionStrategy, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule } from 'primeng/paginator';
import { MessageService, MenuItem, ConfirmationService } from 'primeng/api';

import { FaqService } from '../../services/faq.service';
import { FaqList } from '../../models';
import { FaqFormComponent } from '../../components/faq-form/faq-form.component';

@Component({
  selector: 'app-faqs-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    ToggleSwitchModule,
    ToastModule,
    BreadcrumbModule,
    SkeletonModule,
    TooltipModule,
    ConfirmDialogModule,
    PaginatorModule,
    FaqFormComponent
  ],
  providers: [MessageService, ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './faqs-page.component.html'
})
export class FaqsPageComponent implements OnInit {
  readonly faqService = inject(FaqService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);

  readonly searchTerm = signal('');
  readonly statusFilter = signal<'all' | 'active' | 'inactive'>('all');
  readonly selectedFaqId = signal<number | null>(null);
  readonly showFormDrawer = signal(false);

  readonly isLoading = computed(() => this.faqService.isLoading());

  readonly filteredFaqs = computed(() => {
    const faqs = this.faqService.faqs();
    const search = this.searchTerm().toLowerCase();
    const status = this.statusFilter();

    let filtered = faqs.filter(faq => {
      const matchesSearch = faq.faq.toLowerCase().includes(search) ||
                          faq.description.toLowerCase().includes(search);
      const matchesStatus = status === 'all' ||
                          (status === 'active' && faq.isActive) ||
                          (status === 'inactive' && !faq.isActive);
      return matchesSearch && matchesStatus;
    });

    // Sort by sortOrderFaq
    return filtered.sort((a, b) => a.sortOrderFaq - b.sortOrderFaq);
  });

  breadcrumbItems: MenuItem[] = [
    { label: 'Client App' },
    { label: 'Preguntas Frecuentes' }
  ];

  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  ngOnInit(): void {
    this.loadFaqs();
  }

  loadFaqs(): void {
    this.faqService.getFaqList().subscribe({
      error: (error) => {
        console.error('Error loading FAQs:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las preguntas frecuentes'
        });
      }
    });
  }

  setStatusFilter(status: 'all' | 'active' | 'inactive'): void {
    this.statusFilter.set(status);
  }

  openCreateDrawer(): void {
    this.selectedFaqId.set(null);
    this.showFormDrawer.set(true);
  }

  editFaq(faq: FaqList): void {
    this.selectedFaqId.set(faq.idFaq);
    this.showFormDrawer.set(true);
  }

  onDrawerVisibilityChange(visible: boolean): void {
    if (!visible) {
      this.showFormDrawer.set(false);
      this.selectedFaqId.set(null);
    }
  }

  handleFormSave(): void {
    this.loadFaqs();
  }

  toggleFaqStatus(faq: FaqList, event: Event): void {
    event.stopPropagation();

    const newStatus = !faq.isActive;
    const message = newStatus
      ? '¿Estás seguro de activar esta pregunta frecuente?'
      : '¿Estás seguro de desactivar esta pregunta frecuente?';

    this.confirmationService.confirm({
      message,
      header: 'Confirmar acción',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí',
      rejectLabel: 'No',
      accept: () => {
        this.faqService.enableFaq(faq.idFaq, newStatus).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Éxito',
              detail: `Pregunta ${newStatus ? 'activada' : 'desactivada'} correctamente`
            });
            this.loadFaqs();
          },
          error: (error) => {
            console.error('Error toggling FAQ status:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo cambiar el estado de la pregunta'
            });
          }
        });
      }
    });
  }

  onDrop(event: CdkDragDrop<FaqList[]>): void {
    // Get the current filtered list
    const faqs = [...this.filteredFaqs()];

    // Move item in the array
    moveItemInArray(faqs, event.previousIndex, event.currentIndex);

    // Update the service state immediately for optimistic UI
    const allFaqs = [...this.faqService.faqs()];
    const updatedFaqs = allFaqs.map(faq => {
      const newIndex = faqs.findIndex(f => f.idFaq === faq.idFaq);
      if (newIndex !== -1) {
        return { ...faq, sortOrderFaq: newIndex + 1 };
      }
      return faq;
    });
    this.faqService.faqs.set(updatedFaqs);

    // Update each FAQ position in the backend
    faqs.forEach((faq, index) => {
      const newPosition = index + 1;
      if (faq.sortOrderFaq !== newPosition) {
        this.faqService.changeOrder(faq.idFaq, newPosition).subscribe({
          error: (error) => {
            console.error('Error updating FAQ order:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se pudo actualizar el orden de las preguntas'
            });
            // Reload on error to restore correct state
            this.loadFaqs();
          }
        });
      }
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Orden actualizado correctamente'
    });
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  getStatusSeverity(isActive: boolean): 'success' | 'danger' {
    return isActive ? 'success' : 'danger';
  }
}
