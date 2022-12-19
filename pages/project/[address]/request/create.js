import { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import NavigationBar from "../../../../components/Nav";
import Alert from "react-bootstrap/Alert";
import web3 from "../../../../eth/web3";
import { useRouter } from "next/router";
import projectWeb3Instance from "../../../../eth/project";

const CreateRequest = (props) => {
    const { projectBalance, address } = props;
    const [values, setValues] = useState({ amount: "", description: "", vendor:"" });
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

      if(!val?.vendor || !val?.vendor?.trim()) {
        errorMessage = "Enter a dispense address";
      }

      if (web3.utils.toWei(val?.amount, "ether") > projectBalance) {
        errorMessage = "Project contribution does not have that amount";
      }
  
  
      return {
        isValid: errorMessage ? false : true,
        errorMessage,
      };
    };
  
    const handleCreateRequest = async () => {
      try {
        const { isValid, errorMessage } = validateValue(values);
        if (!isValid) {
          return setResponse({
            type: "danger",
            message: errorMessage,
            show: true,
          });
        }
        const { amount, description, vendor } = values;
  
        const accounts = await web3.eth.getAccounts();

        console.log(accounts, )
        
        setIsLoading(true);
        await projectWeb3Instance(address).methods
          .createSpendRequest(description, String(amount), vendor)
          .send({
            from: accounts[0],
          });
        setIsLoading(false);
        router.push(`/project/${address}`)
  
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
                <h2 className="mb-5"> Create Spending Request</h2>
                {response?.show ? (
                  <Alert variant={response?.type}>{response?.message}</Alert>
                ) : null}
                <Form>
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Amount needed (in Wei)</Form.Label>
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
                    <Form.Label>Withdraw address</Form.Label>
                    <Form.Control
                      value={values?.vendor}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, vendor: e.target.value }))
                      }
                      type="text"
                      placeholder="0xlabalaba"
                    />
                  </Form.Group>
  
  
                  <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label> Description </Form.Label>
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
                      placeholder="Need to flex a lirru"
                    />
                  </Form.Group>
  
                  <div className="d-grid gap-2">
                  <Button
                   disabled={isLoading}
                    onClick={() => handleCreateRequest()}
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



  export const getServerSideProps = async (context) => {
    try {
      const {
        query: { address },
      } = context;

      const projectDetails = await projectWeb3Instance(address)
        .methods.getProjectDetails()
        .call();
     
  
      return {
        props: {
          address,
          minimumSupportAmount: projectDetails[0],
          projectBalance: projectDetails[1],
          spendRequestCount: projectDetails[2],
          supportersCount: projectDetails[3],
          projectOwner: projectDetails[4],
          projectDescription: projectDetails[5],
        },
      };
    } catch (error) {
      console.log(error);
      return { props: {} };
    }
  };

  export default CreateRequest;