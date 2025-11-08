import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { VolumeChartData } from '../../models';

/**
 * Tipo de gráfico de volumen
 */
export type VolumeChartType = 'pending' | 'completed' | 'cancelled';

@Component({
  selector: 'app-volume-chart',
  standalone: true,
  imports: [CommonModule, ChartModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './volume-chart.component.html',
  styleUrl: './volume-chart.component.scss'
})
export class VolumeChartComponent {
  /** Datos del gráfico */
  readonly data = input.required<VolumeChartData>();

  /** Tipo de gráfico (determina el color) */
  readonly type = input.required<VolumeChartType>();

  /** Indica si está cargando */
  readonly loading = input<boolean>(false);

  /**
   * Obtiene los datos formateados para PrimeNG Chart
   */
  get chartData() {
    const chartData = this.data();
    const type = this.type();

    return {
      labels: chartData.series.map(s => s.name),
      datasets: [
        {
          data: chartData.series.map(s => s.value),
          fill: true,
          borderColor: this.getBorderColor(type),
          backgroundColor: this.getBackgroundColor(type),
          tension: 0.4,
          borderWidth: 2
        }
      ]
    };
  }

  /**
   * Opciones del gráfico
   */
  get chartOptions() {
    return {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#ddd',
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
            font: {
              size: 11
            }
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: '#f0f0f0'
          },
          ticks: {
            font: {
              size: 11
            },
            precision: 0
          }
        }
      }
    };
  }

  /**
   * Obtiene el color del borde según el tipo
   */
  private getBorderColor(type: VolumeChartType): string {
    switch (type) {
      case 'pending':
        return '#F8D65D'; // Amarillo
      case 'completed':
        return '#008717'; // Verde
      case 'cancelled':
        return '#FF4548'; // Rojo
    }
  }

  /**
   * Obtiene el color de fondo según el tipo
   */
  private getBackgroundColor(type: VolumeChartType): string {
    switch (type) {
      case 'pending':
        return 'rgba(248, 230, 150, 0.3)'; // Amarillo claro
      case 'completed':
        return 'rgba(156, 238, 170, 0.3)'; // Verde claro
      case 'cancelled':
        return 'rgba(255, 123, 125, 0.3)'; // Rojo claro
    }
  }
}
