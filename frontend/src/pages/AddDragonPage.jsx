import {Box} from '@chakra-ui/react';
import {Route, Routes, Navigate} from "react-router-dom";
import AddDragonPage from "./AddDragonPage";
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import Navbar from '../components/Navbar';
import {useState, useEffect} from 'react';

// Protected route component
const AdminRoute = ({children}) => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    const isAdmin = user && user.userType === 'admin';

    if (!isAdmin) {
        return <Navigate to="/login"/>;
    }

    return children;
};

function App() {
    return (
        <Box minH={"100vh"}>
            {<Navbar/>}
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/add-dragon" element={
                    <AdminRoute>
                        <AddDragonPage/>
                    </AdminRoute>
                }/>
                <Route path="/login" element={<LoginPage/>}/>
            </Routes>
        </Box>
    )
}

export default App;