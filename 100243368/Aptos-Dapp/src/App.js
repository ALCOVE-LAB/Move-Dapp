import { Container } from "react-bootstrap";
import { useEffect, useState } from "react";

import Current from "./component/block";
import Account from "./component/account";
import Contact from "./component/contact";
import Generate from "./component/generate";
import List from "./component/list";


function App() {

  const size = {
    row: [12],
    side: [6, 3, 3],
  };

  useEffect(() => {
    
  }, []);

  return (
    <Container>
      <Current />
      <Generate />
      <Account />
      <List />
      <Contact />
    </Container>
  );
}

export default App;
