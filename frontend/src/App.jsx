import { Box } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import AddDragonPage from "./pages/AddDragonPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Riders from "./pages/Riders";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider

function App() {
  return (
    <AuthProvider>
      {" "}
      {/* Wrap the app with AuthProvider */}
      <Box minH={"100vh"}>
        <Navbar /> {/* Cleaned up the rendering of Navbar */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/add-dragon" element={<AddDragonPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/riders" element={<Riders />} />
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;
