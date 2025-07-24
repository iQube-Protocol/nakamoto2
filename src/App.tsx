
import React from "react";
import AppProviders from "./components/providers/AppProviders";
import AppRouter from "./components/routing/AppRouter";
import GlobalMediaIframe from "./components/media/GlobalMediaIframe";
import { useGlobalMedia } from "./hooks/use-global-media";

const App = () => {
  console.log("Rendering root App component");
  const { isMediaVisible } = useGlobalMedia();
  
  return (
    <AppProviders>
      <AppRouter />
      <GlobalMediaIframe isVisible={isMediaVisible} />
    </AppProviders>
  );
};

export default App;
