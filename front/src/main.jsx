import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import LoginPage from "./pages/LoginPage";
import DataPage from "./pages/DataPage";
import ManagementPage from "./pages/ManagementPage";
import PredictionPage from "./pages/PredictionPage";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <LoginPage />,
      },
      {
        path: '/data',
        element: <ProtectedRoute><DataPage /></ProtectedRoute>,
      },
      {
        path: '/manage',
        element: <ProtectedRoute><ManagementPage /></ProtectedRoute>,
      },
      {
        path: '/predict',
        element: <ProtectedRoute><PredictionPage /></ProtectedRoute>,
      },
    ],
  },
]);