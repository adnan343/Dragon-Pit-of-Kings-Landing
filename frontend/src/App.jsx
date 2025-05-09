import { Box } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AddDragonPage from "./pages/AddDragonPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import Riders from "./pages/Riders";
import Fights from "./pages/Fights";
import InitiateFight from "./pages/InitiateFight";
import DragonDetails from "./components/DragonDetails";
import ProfilePage from "./pages/ProfilePage";
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
          <Route path="/profile/:userId" element={<ProfilePage />} />
          <Route path="/riders" element={<Riders />} />
          <Route path="/dragons/:id" element={<DragonDetails />} />
          <Route path="/fights" element={<Fights />} />
          <Route path="/initiate-fight" element={<InitiateFight />} />
        </Routes>
      </Box>
    </AuthProvider>
  );
}

export default App;
