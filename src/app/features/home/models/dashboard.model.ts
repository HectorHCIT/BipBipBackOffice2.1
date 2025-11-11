export interface DashboardKPI {
  label: string;
  value: number;
  icon?: string;
}

export interface OrdersByPaymentMethod {
  method: string;
  total: number;
}

export interface OrdersByChannel {
  channel: string;
  total: number;
  percentage: number;
}

export interface OrdersByBrand {
  brandId: number;
  brandName: string;
  logo: string;
  total: number;
}

export interface OrdersByCity {
  cityId: number;
  cityName: string;
  total: number;
}

export interface DashboardData {
  totalOrders: number;
  deliveredOrders: number;
  ordersInProgress: number;
  ordersByPaymentMethod: OrdersByPaymentMethod[];
  ordersByChannel: OrdersByChannel[];
  ordersByBrand: OrdersByBrand[];
  ordersByCity: OrdersByCity[];
}

export interface DashboardFilters {
  cityId?: string;
  startDate?: Date;
  endDate?: Date;
}
