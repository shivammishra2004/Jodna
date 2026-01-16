// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

// To learn more about using "swc-react" visit:
// https://opensource.adobe.com/spectrum-web-components/using-swc-react/
import { Button } from "@swc-react/button";
import { Theme } from "@swc-react/theme";
import React from "react";
import "./App.css";
import TestDashboard from "./TestDashboard";

const App = ({ addOnUISdk, sandboxProxy }) => {
    return (
        <Theme system="express" scale="medium" color="light">
            <TestDashboard />
        </Theme>
    );
};

export default App;
