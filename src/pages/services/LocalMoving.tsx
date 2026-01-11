import { ServicePageTemplate } from "@/components/services";
import { servicesData } from "@/data/servicesData";

export default function LocalMoving() {
  return <ServicePageTemplate data={servicesData['local-moving']} />;
}
