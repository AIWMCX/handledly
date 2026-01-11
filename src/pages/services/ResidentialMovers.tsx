import { ServicePageTemplate } from "@/components/services";
import { servicesData } from "@/data/servicesData";

export default function ResidentialMovers() {
  return <ServicePageTemplate data={servicesData['residential-movers']} />;
}
