import { ServicePageTemplate } from "@/components/services";
import { servicesData } from "@/data/servicesData";

export default function SameDayMoving() {
  return <ServicePageTemplate data={servicesData['same-day-moving']} />;
}
