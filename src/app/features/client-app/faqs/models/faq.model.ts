export interface FaqList {
  idFaq: number;
  faq: string;
  description: string;
  isActive: boolean;
  sortOrderFaq: number;
}

export interface FaqDetail {
  idFaq: number;
  faq: string;
  description: string;
  isActive: boolean;
  sortOrderFaq: number;
}

export interface FaqPayload {
  isActive: boolean;
  titleFaq: string;
  descFaq: string;
}
