const SingleProject = () => {
  return <>Hello world</>;
};

export const getServerSideProps = (context) => {
  try {
    const {
      query: { address },
    } = context;
    return {
      props: {
        address,
      },
    };
  } catch (error) {
    return {};
  }
};

export default SingleProject;
