import { ServicePageTemplate } from "@/components/services";
import { servicesData } from "@/data/servicesData";

export default function SafeMoving() {
  return <ServicePageTemplate data={servicesData['safe-moving']} />;
}
