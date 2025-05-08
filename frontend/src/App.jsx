import { Box } from '@chakra-ui/react';
import {Route, Routes} from "react-router-dom";
import AddDragonPage from './pages/AddDragonPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';


function App() {
    return (
        <Box minH={"100vh"}>
            {<Navbar />}
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/add-dragon" element={<AddDragonPage />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </Box>
    )
}

export default App