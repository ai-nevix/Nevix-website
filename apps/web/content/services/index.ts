import type { Service, ServiceCategorySlug } from '@vastrix/types';

import { aiIntelligenceServices } from './ai-intelligence';
import { automationServices } from './automation';
import { dataAnalyticsServices } from './data-analytics';
import { digitalEngineeringServices } from './digital-engineering';
import { consultingServices, productSaasServices } from './product-consulting';

/** All 35 services from catalogue §2–§7, in category order. */
export const services: Service[] = [
  ...aiIntelligenceServices,
  ...automationServices,
  ...digitalEngineeringServices,
  ...dataAnalyticsServices,
  ...productSaasServices,
  ...consultingServices,
];

export const serviceBySlug = new Map(services.map((s) => [s.slug, s]));

export function getServicesByCategory(categorySlug: ServiceCategorySlug): Service[] {
  return services.filter((s) => s.categorySlug === categorySlug).sort((a, b) => a.order - b.order);
}

export {
  aiIntelligenceServices,
  automationServices,
  consultingServices,
  dataAnalyticsServices,
  digitalEngineeringServices,
  productSaasServices,
};
