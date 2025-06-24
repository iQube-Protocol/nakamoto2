
import React from "react";
import AppProviders from "./components/providers/AppProviders";
import { AppRouter } from "./components/routing/AppRouter";

const App = () => {
  console.log("Rendering root App component");
  
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};

export default App;
