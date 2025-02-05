import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { GoogleOAuthProvider } from "@react-oauth/google";
import { usePromiseTracker } from "react-promise-tracker";
import { ProgressBar } from "react-loader-spinner";
import { CookiesProvider } from "react-cookie";
import { InstallPromptProvider } from "./components/InstallPromptContext";

let ClientId =
  "768133513066-ui5rbtuorts5bupqdjnegv9gsg2ai9jq.apps.googleusercontent.com";

ReactDOM.render(
  <GoogleOAuthProvider clientId={ClientId}>
    <CookiesProvider>
      <InstallPromptProvider>
        <React.StrictMode>
          <App />
        </React.StrictMode>
      </InstallPromptProvider>
    </CookiesProvider>
  </GoogleOAuthProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
