import {
  Component,
  Input,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ChartDataset } from '../../models/invoice.model';

// Registrar componentes de Chart.js
Chart.register(...registerables);

/**
 * InvoiceChartsComponent - Componente reutilizable para gráficos de área
 *
 * Características:
 * - Gráfico de área con Chart.js
 * - Colores personalizables
 * - Responsive
 * - Animaciones suaves
 */
@Component({
  selector: 'app-invoice-charts',
  standalone: true,
  imports: [CommonModule, ChartModule],
  template: `
    <div class="flex flex-col w-full max-w-md">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {{ chartLabel }}
      </h3>
      <div class="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        @if (chartData) {
          <p-chart
            type="line"
            [data]="chartData"
            [options]="chartOptions"
            [style]="{ height: '250px' }"
          />
        } @else {
          <div class="flex items-center justify-center h-64">
            <span class="text-gray-500 dark:text-gray-400">Sin datos disponibles</span>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceChartsComponent {
  @Input({ required: true }) chartData!: ChartDataset | null;
  @Input({ required: true }) chartLabel!: string;

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#ffffff',
        borderWidth: 1,
        padding: 10,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(107, 114, 128, 0.1)'
        },
        ticks: {
          color: '#6b7280'
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    elements: {
      line: {
        borderWidth: 2
      },
      point: {
        radius: 3,
        hoverRadius: 5,
        hitRadius: 10
      }
    }
  };
}
