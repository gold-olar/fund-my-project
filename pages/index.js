import ListGroup from "react-bootstrap/ListGroup";
import React from "react";
import { useRouter } from "next/router";
import generatorWeb3Instance from "../eth/projectGenerator";
import { Button } from "react-bootstrap";
import NavigationBar from "../components/Nav";

const Home = ({ projects }) => {
  const router = useRouter();
  return (
    <>
      <NavigationBar />
      <div className="my-5 container-fluid">
        <div className="row">
          <div className="col-md-12 my-5">
            <h2> All Projects</h2>
          </div>
          <div className="col-md-6">
            <ListGroup className="pointer" as="ol" numbered>
              {projects?.map((project) => (
                <ListGroup.Item
                  action
                  onClick={() => router.push(`/project/${project}`)}
                  key={project}
                  as="li"
                >
                  {project}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

export const getServerSideProps = async () => {
  try {
    const projects = await generatorWeb3Instance.methods
      .getDeployedProjects()
      .call();
    return {
      props: {
        projects,
      },
    };

    console.log(projects)
  } catch (error) {
    console.log(error);
    return {props: {}};
  }
};
