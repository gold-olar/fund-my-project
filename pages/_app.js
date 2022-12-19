import "bootstrap/dist/css/bootstrap.min.css";
import React from 'react';

const App = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
};

export default App;
