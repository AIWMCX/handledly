import { ServicePageTemplate } from "@/components/services";
import { servicesData } from "@/data/servicesData";

export default function JunkRemoval() {
  return <ServicePageTemplate data={servicesData['junk-removal']} />;
}
