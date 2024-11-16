"use client";
import { Container, Row, Col } from "react-grid-system";
import { useData } from "@/lib/hooks";
import Properties from "@/components/properties";

export default function Home() {
  const { properties } = useData();

  return (
    <>
      <main>
        <Container fluid>
          <Row>
            <Col xs={12}>
              <h1 className="text-2xl font-bold my-4">Properties for sale</h1>
            </Col>
            <Properties properties={properties} />
          </Row>
        </Container>
      </main>
    </>
  );
}
