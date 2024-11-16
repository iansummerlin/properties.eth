import Image from "next/image";
import { Col } from "react-grid-system";
import { Property as PropertyType } from "@/lib/types";
import { useDialog } from "@/lib/hooks";
import { getPrice } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ViewPropertyContent, ViewProertyFooter } from "./view-property";

type PropertiesProps = Readonly<{
  properties: PropertyType[];
}>;

export default function Properties(props: PropertiesProps) {
  const { properties } = props;

  return properties.map((property) => (
    <Property key={property.id} property={property} />
  ));
}

type PropertyProps = Readonly<{
  property: PropertyType;
}>;
function Property(props: PropertyProps) {
  const { property } = props;
  const { handleOpen } = useDialog();

  const handleViewProperty = () => {
    handleOpen({
      title: property.name,
      content: <ViewPropertyContent property={property} />,
      footer: <ViewProertyFooter />,
    });
  };

  return (
    <Col xs={12} md={6} lg={4} xl={3} className="flex flex-col">
      <Card
        key={property.id}
        className="flex flex-col h-full bg-white hover:bg-gray-100 hover:opacity-90 cursor-pointer rounded-lg shadow-lg overflow-hidden mb-5"
        onClick={handleViewProperty}
      >
        <CardHeader className="m-0 p-4 border-b">
          <CardTitle className="text-lg font-semibold">
            {property.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col m-0 p-0">
          <div className="relative w-full h-64 overflow-hidden">
            <Image
              src={property.image}
              alt={property.name}
              fill
              style={{
                height: "100%",
                width: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <CardDescription className="mt-2 px-4 py-2">
            {property.description}
          </CardDescription>
        </CardContent>
        <CardFooter className="p-4 border-t mt-auto flex justify-between">
          <p>
            Price: <span className="font-semibold">{getPrice(property)}</span>
          </p>
          <Button onClick={handleViewProperty}>View</Button>
        </CardFooter>
      </Card>
    </Col>
  );
}
