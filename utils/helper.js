import web3 from "../eth/web3";

export const getProjectDetailsArray = (props) => {
  const {
    address,
    minimumSupportAmount,
    projectBalance,
    spendRequestCount,
    projectOwner,
    projectDescription,
    supportersCount,
  } = props;
  return [
    {
      title: "Project address",
      data: address,
    },
    {
      title: "Project owner",
      data: projectOwner,
    },
    {
      title: "Minimum support ammount",
      data: `${web3.utils.fromWei(minimumSupportAmount, "ether")} Eth`,
    },
    {
      title: "Project balance",
      data: `${web3.utils.fromWei(projectBalance, "ether")} Eth`,
    },
    {
      title: "Number of spend requests",
      data: spendRequestCount,
    },
    {
      title: "Number of peoject suppoters",
      data: supportersCount,
    },
    {
      title: "Project description",
      data: projectDescription,
    },
  ];
};
