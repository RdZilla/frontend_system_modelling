import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import PrivateRoute from './components/auth/PrivateRoute.tsx';
import Experiment from "./pages/Experiment.tsx";
import CreateExperiment from "./pages/CreateExperiment.tsx";
import ExperimentDetails from "./pages/ExperimentDetails.tsx";
import UserConfigPage from "./pages/UserConfigPage.tsx";
import CustomFunctionsPage from "./pages/CustomFunctionsPage.tsx";
import Register from "./pages/Register.tsx";

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Home />
                        </PrivateRoute>
                    }
                />
                <Route path="/experiment" element={
                    <PrivateRoute>
                        <Experiment />
                    </PrivateRoute>} />

                <Route path="/create-experiment" element={
                    <PrivateRoute>
                        <CreateExperiment />
                    </PrivateRoute>} />

                <Route path="/experiment/:id" element={
                    <PrivateRoute>
                        <ExperimentDetails />
                    </PrivateRoute>} />

                <Route path="/configuration" element={
                    <PrivateRoute>
                        <UserConfigPage />
                    </PrivateRoute>} />

                <Route path="/configuration/:id" element={
                    <PrivateRoute>
                        <UserConfigPage />
                    </PrivateRoute>} />

                <Route path="/function" element={
                    <PrivateRoute>
                        <CustomFunctionsPage />
                    </PrivateRoute>} />

                <Route path="*" element={<Navigate to="/dashboard" />} />

                <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
        </Router>
    );
};

export default App;
