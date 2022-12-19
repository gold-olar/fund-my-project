import { Button, Card, Col, Container, Row } from "react-bootstrap";
import NavigationBar from "../../components/Nav";
import projectWeb3Instance from "../../eth/project";
import web3 from "../../eth/web3";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import { useEffect, useState } from "react";
import { getProjectDetailsArray } from "../../utils/helper";
 

const SingleProject = (props) => {
  const {
    projectOwner,
  } = props;
  const [web3Addresses, setWeb3Addresses] = useState([]);

  const fetchWeb3Addresses = async () => {
   const accounts =  await web3.eth.getAccounts();
   return setWeb3Addresses(accounts)
  }

  useEffect(() => {
    fetchWeb3Addresses()
  }, [])

  const projectDetails = getProjectDetailsArray(props)

  return (
    <>
      <NavigationBar />
      <Container className="mt-4">
        <Row>
          <Col className="col-md-4 my-3">
            <h4 className="mb-5"> Project Details</h4>
            <Row>
              {projectDetails?.map((detail) => (
                <Col className="col-md-12 mb-4">
                  <div className="fw-bold small mb-1 text-uppercase">
                    {" "}
                    {detail.title}{" "}
                  </div>
                  <div> {detail.data} </div>
                </Col>
              ))}
              <Col>
                <InputGroup>
                  <InputGroup.Text id="btnGroupAddon">Eth</InputGroup.Text>
                  <Form.Control type="text" placeholder="0.2" />
                  <Button> Fund Project</Button>
                </InputGroup>
              </Col>
            </Row>
          </Col>
          <Col className="col-md-8 my-3">
            <Card className="p-3">
              <Row>
                <Col className="col-md-9">
                  <h6> Project Spending Requests</h6>
                </Col> 
                {projectOwner === web3Addresses[0] ? (
                  <Col className="col-md-3">
                    <Button variant="outline-primary">
                      Create Request{" "}
                    </Button> 
                  </Col>
                ) : null}
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

export default SingleProject;
