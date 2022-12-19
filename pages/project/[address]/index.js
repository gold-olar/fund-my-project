import { Button, Card, Col, Container, Row } from "react-bootstrap";
import NavigationBar from "../../../components/Nav";
import projectWeb3Instance from "../../../eth/project";
import web3 from "../../../eth/web3";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";
import { getProjectDetailsArray } from "../../../utils/helper";
import { useRouter } from "next/router";
import SpendingRequests from "../../../components/SpendingRequests";

const SingleProject = (props) => {
  const { projectOwner, address, minimumSupportAmount, spendingRequests, supportersCount } = props;
  const [web3Addresses, setWeb3Addresses] = useState([]);
  const [value, setValue] = useState("");
  const [response, setResponse] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();


  const validateValue = (val) => {
    let errorMessage;

    if (web3.utils.toWei(val, "ether") < minimumSupportAmount) {
      errorMessage = "Enter a larger value";
    }

    if (Number(val) === NaN) {
      errorMessage = "Enter a valid eth value";
    }

    return {
      isValid: errorMessage ? false : true,
      errorMessage,
    };
  };

  useEffect(() => {
    if (response?.show) {
      setTimeout(() => setResponse({}), 2000);
    }
  }, [response]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const { isValid, errorMessage } = validateValue(value);
      if (!isValid) {
        return setResponse({
          type: "danger",
          message: errorMessage,
          show: true,
        });
      }

      await projectWeb3Instance(address)
        .methods.fundProject()
        .send({
          from: web3Addresses[0],
          value: web3.utils.toWei(value, "ether"),
        });
      setResponse({
        type: "success",
        message: "Project funded !",
        show: true,
      });

      setIsLoading(false);
      setTimeout(() => router.reload(), 1500);
    } catch (error) {
      setResponse({
        type: "danger",
        message: error.message || "There was a problem",
        show: true,
      });
      return setIsLoading(false);
    }
    console.log(value);
  };

  const fetchWeb3Addresses = async () => {
    const accounts = await web3.eth.getAccounts();
    return setWeb3Addresses(accounts);
  };

  useEffect(() => {
    fetchWeb3Addresses();
  }, []);

  const projectDetails = getProjectDetailsArray(props);

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <Row>
          <Col className="col-md-4 my-3">
            <h4 className="mb-5"> Project Details</h4>
            <Row>
              {projectDetails?.map((detail) => (
                <Col key={detail.title} className="col-md-12 mb-4">
                  <div className="fw-bold small mb-1 text-uppercase">
                    {detail.title}{" "}
                  </div>
                  <div> {detail.data} </div>
                </Col>
              ))}
              <Col>
                <InputGroup>
                  <InputGroup.Text id="btnGroupAddon">Eth</InputGroup.Text>
                  <Form.Control
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    type="text"
                    placeholder="0.2"
                  />
                  <Button disabled={isLoading} onClick={() => handleSubmit()}>
                    {" "}
                    {isLoading ? "Processing" : "Fund Project"}{" "}
                  </Button>
                </InputGroup>
                <p
                  className={`small ${
                    response?.type === "danger" ? "text-danger" : "text-success"
                  }`}
                >
                  {response?.message}{" "}
                </p>
              </Col>
            </Row>
          </Col>
          <Col className="col-md-8 my-3">
            <Card  className=" p-3">
              <Row>
                <Col className="col-md-9">
                  <h6> Project Spending Requests</h6>
                </Col>
                {projectOwner === web3Addresses[0] ? (
                  <Col className="col-md-3">
                    <Button
                      href={`/project/${address}/request/create`}
                      variant="outline-primary"
                    >
                      Create Request{" "}
                    </Button>
                  </Col>
                ) : null}
              </Row>
              <Row className="my-4 ">
                <Col className="vh-100 overflow-scroll">
                  <SpendingRequests web3Addresses={web3Addresses} projectAddress={address} supportersCount={supportersCount} spendingRequests={spendingRequests} />
                </Col>
              </Row>
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


      const requests = await Promise.all(
        Array(parseInt(projectDetails[2]))
          .fill()
          .map(async (element, index) => {
            const spendingRequest =  await projectWeb3Instance(address).methods.getSpendingRequest(index).call();
            return {
              description: spendingRequest[0],
              value: spendingRequest[1],
              vendor: spendingRequest[2],
              isDispensed: spendingRequest[3],
              approvalCount: spendingRequest[4],
            }
          })
      );


      
    return {
      props: {
        address,
        minimumSupportAmount: projectDetails[0],
        projectBalance: projectDetails[1],
        spendRequestCount: projectDetails[2],
        supportersCount: projectDetails[3],
        projectOwner: projectDetails[4],
        projectDescription: projectDetails[5],
        spendingRequests: requests
      },
    };
  } catch (error) {
    console.log(error);
    return { props: {} };
  }
};

export default SingleProject;
