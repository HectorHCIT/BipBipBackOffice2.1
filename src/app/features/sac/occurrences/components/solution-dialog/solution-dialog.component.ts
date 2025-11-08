import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

// PrimeNG
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

// Models
import { Solution } from '../../models';

@Component({
  selector: 'app-solution-dialog',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './solution-dialog.component.html',
  styleUrl: './solution-dialog.component.scss'
})
export class SolutionDialogComponent {
  // Inputs
  readonly visible = input.required<boolean>();
  readonly solutions = input.required<Solution[]>();

  // Outputs
  readonly onClose = output<void>();

  /**
   * Cierra el diálogo
   */
  close(): void {
    this.onClose.emit();
  }

  /**
   * Formatea una fecha ISO a formato legible
   */
  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-HN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
