import "./App.css";
import * as React from 'react';
import Button from '@mui/material/Button';
import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import Mint from "./components/Mint";
import { Portfolio } from "./components/Portfolio";
import { SnackbarProvider, VariantType, useSnackbar } from 'notistack';



function App() {


    return (
    <>
      <div className="App">
        <Header />

        <div className="mainWindow" style={{margin: "100px   0 0 0"}}>
          <Routes>
            <Route
              path="/"
              element={
                <Mint />
              }
            />
            <Route
              path="/portfolio"
              element={
                <Portfolio />
              }
            />
          </Routes>
        </div>

          {/*<React.Fragment>*/}
          {/*    <Button onClick={handleClick}>Show snackbar</Button>*/}
          {/*    <Button onClick={handleClickVariant('success')}>Show success snackbar</Button>*/}
          {/*</React.Fragment>*/}

      </div>
    </>
  );
}

export default App;
