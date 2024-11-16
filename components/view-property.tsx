import Image from "next/image";
import { Container, Row, Col } from "react-grid-system";
import { Property } from "@/lib/types";
import { getPrice, isPrice, truncate } from "@/lib/utils";

export function ViewPropertyContent({ property }: { property: Property }) {
  return (
    <Container>
      <Row>
        <Col xs={12} md={6} style={{ padding: 0 }}>
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
        </Col>
        <Col xs={12} md={6}>
          <h2 className="text-md text-semibold">Description</h2>
          <p className="text-sm">{property.description}</p>
        </Col>
      </Row>
      <Row>
        <Col xs={12} style={{ padding: 0 }}>
          <Container>
            <Row>
              {property.attributes.map(
                ({ trait_type, value }, attributeIdx) => (
                  <Col
                    key={attributeIdx}
                    xs={6}
                    md={4}
                    lg={3}
                    style={{ padding: 0 }}
                  >
                    <div className="my-2">
                      <p className="font-semibold">{trait_type}: </p>
                      <p className="text-gray-400">
                        {isPrice(trait_type)
                          ? getPrice(property)
                          : truncate(value.toString(), 24)}
                      </p>
                    </div>
                  </Col>
                )
              )}
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export function ViewProertyFooter() {
  return <></>;
}
