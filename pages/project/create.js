import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import NavigationBar from "../../components/Nav";
import Alert from "react-bootstrap/Alert";
import generatorWeb3Instance from "../../eth/projectGenerator";
import web3 from "../../eth/web3";
import { useRouter } from "next/router";


const CreateProject = () => {
  const [values, setValues] = useState({ amount: "", description: "" });
  const [response, setResponse] = useState({ message: "", type: "" }); // danger, success => type
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter()

  const validateValue = (val) => {
    let errorMessage;

  
    if (!val?.description || !val?.description?.trim()) {
      errorMessage = "Enter a project description";
    }

    if (!val?.amount || !val?.amount?.trim()) {
      errorMessage = "Enter a minimum amount to contribute";
    }

    return {
      isValid: errorMessage ? false : true,
      errorMessage,
    };
  };

  const handleCreateProject = async () => {
    try {
      const { isValid, errorMessage } = validateValue(values);
      if (!isValid) {
        return setResponse({
          type: "danger",
          message: errorMessage,
          show: true,
        });
      }
      const { amount, description } = values;

      const accounts = await web3.eth.getAccounts();
      
      setIsLoading(true);
      await generatorWeb3Instance.methods
        .createProject(String(amount), description)
        .send({
          from: accounts[0],
        });
      setIsLoading(false);
      router.push("/")

    } catch (error) {
      setResponse({
        type: "danger",
        message: error.message || "There was a problem",
        show: true,
      });
      return setIsLoading(false);
    }
  };

  useEffect(() => {
    if (response?.show) {
      setTimeout(() => setResponse({}), 2000);
    }
  }, [response]);

  return (
    <>
      <NavigationBar />
      <Container className="my-5">
        <Row>
          <Col className="col-md-6 mx-auto">
            <Card className="p-5">
              <h2 className="mb-5"> Create Project</h2>
              {response?.show ? (
                <Alert variant={response?.type}>{response?.message}</Alert>
              ) : null}
              <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Minimum Contribution allowed (in Wei)</Form.Label>
                  <Form.Control
                    value={values?.amount}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    type="number"
                    placeholder="2000"
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicEmail">
                  <Form.Label>Project description </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={10}
                    value={values?.description}
                    onChange={(e) =>
                      setValues((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    type="number"
                    placeholder="My final year project"
                  />
                </Form.Group>

                <div className="d-grid gap-2">
                <Button
                 disabled={isLoading}
                  onClick={() => handleCreateProject()}
                  variant="primary"
                  type="button"
                  size="lg"
                >
                 {isLoading ? "Processing": "Create Project"}
                </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default CreateProject;
