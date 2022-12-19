import { useRouter } from "next/router";
import { useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import projectWeb3Instance from "../../eth/project";
import web3 from "../../eth/web3";

const SpendingRequest = ({
  sp,
  index,
  supportersCount,
  web3Addresses,
  projectAddress,
}) => {
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [disburseLoading, setDisburseLoading] = useState(false);
  const router = useRouter();
  const spDetails = [
    {
      title: "Spend Amount ",
      data: `${web3.utils.fromWei(sp.value, "ether")} Eth`,
      size: "6",
    },
    {
      title: "Reciepient address",
      data: sp.vendor,
      size: "6",
    },
    {
      title: "Approval Rate",
      size: "6",
      data: `${Math.round((sp.approvalCount / supportersCount) * 100)}%`,
    },
    {
      title: "Description",
      data: sp.description,
      size: "12",
    },
  ];

  const handleApproveRequest = async () => {
    setApprovalLoading(true);
    await projectWeb3Instance(projectAddress)
      .methods.approveRequest(index)
      .send({
        from: web3Addresses[0],
      });

    setApprovalLoading(false);
    router.reload();
  };

  const handleDisburseRequest = async () => {
    setDisburseLoading(true);
    await projectWeb3Instance(projectAddress)
      .methods.disbursePayment(index)
      .send({
        from: web3Addresses[0],
      });
    setDisburseLoading(false);
    router.reload();
  };

  return (
    <Card border={sp.isDispensed ? "" : "success"} className="p-3 mb-3">
      <Card.Body>
        <Row>
          {spDetails?.map((detail) => (
            <Col key={detail.title} className={`col-md-${detail.size} mb-4`}>
              <div className="fw-bold small mb-1 text-uppercase">
                {detail.title}{" "}
              </div>
              <div> {detail.data} </div>
            </Col>
          ))}
        </Row>
      </Card.Body>

      {!sp.isDispensed ? (
        <Row>
          <Col className="d-flex   justify-content-end">
            <div className="p-1">
              <Button
                onClick={() => handleApproveRequest()}
                variant="outline-success"
                disabled={approvalLoading || sp.isDispensed}
              >
                {approvalLoading ? "Processing..." : "Approve request"}
              </Button>
            </div>
            <div className="p-1">
              <Button
                disabled={disburseLoading || sp.isDispensed}
                onClick={() => handleDisburseRequest()}
                variant="outline-success"
              >
                {disburseLoading ? "Processing..." : " Disburse request"}
              </Button>
            </div>
          </Col>
        </Row>
      ) : null}
    </Card>
  );
};

const SpendingRequests = ({
  spendingRequests,
  supportersCount,
  projectAddress,
  web3Addresses,
}) => {
  return (
    <>
      {spendingRequests?.map((sp, index) => {
        return (
          <SpendingRequest
            supportersCount={supportersCount}
            projectAddress={projectAddress}
            web3Addresses={web3Addresses}
            sp={sp}
            index={index}
          />
        );
      })}
    </>
  );
};

export default SpendingRequests;
