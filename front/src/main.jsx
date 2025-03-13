import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import ConnectionPage from "./pages/ConnectionPage/ConnectionPage.jsx"
import RegistrationPage from "./pages/RegistrationPage/RegistrationPage.jsx";
import Data from "./pages/DataPage/DataPage.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";
import { handleSignUp } from './services/authService';

const router = createBrowserRouter([
 {
element: <App />,
children: [
 {
path: '/',
element: <HomePage />,
 },
 {
path: '/connection',
element: <ConnectionPage />,
 },
 {
path: '/registration',
element: <RegistrationPage handleSignUp={handleSignUp} />,
 },
 {
path: '/data',
element: <Data />,
 },
 ],
 },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
<React.StrictMode>
<RouterProvider router={router} />
</React.StrictMode>
);