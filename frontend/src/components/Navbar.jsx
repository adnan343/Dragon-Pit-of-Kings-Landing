import {
  Container,
  Flex,
  Button,
  Text,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Importing useAuth for context
import { useEffect } from "react";

const Navbar = () => {
  const { user, logout } = useAuth(); // Use AuthContext to get the user and logout function
  const navigate = useNavigate();

  // Check if the user is admin
  const isAdmin = user && user.userType === "admin";

  const handleLogout = () => {
    logout(); // Call logout from AuthContext
    navigate("/"); // Redirect to home page after logout
  };

  return (
    <Container maxW={"1140px"} px={4}>
      <Flex
        h={16}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDir={{
          base: "column",
          sm: "row",
        }}
      >
        <Text
          fontSize={{ base: "22", sm: "28" }}
          fontWeight={"bold"}
          textTransform={"uppercase"}
          textAlign={"center"}
          bgGradient={"linear(to-r, red.500, orange.400)"}
          bgClip={"text"}
        >
          <RouterLink to={"/"}>Dragon Pit of King's Landing 🐉</RouterLink>
        </Text>

        <HStack spacing={4}>
          <Button as={RouterLink} to="/" colorScheme="red" variant="ghost">
            Home
          </Button>
          <Button
            as={RouterLink}
            to="/riders"
            colorScheme="red"
            variant="ghost"
          >
            Riders
          </Button>

          <Button
            as={RouterLink}
            to="/fights"
            colorScheme="red"
            variant="ghost"
          >
            Fights
          </Button>

          {isAdmin && (
            <Button
              as={RouterLink}
              to="/add-dragon"
              colorScheme="red"
              variant="ghost"
            >
              Add Dragon
            </Button>
          )}

          {user ? (
            <Menu>
              <MenuButton as={Button} colorScheme="red">
                {user.username} ({user.userType})
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to={`/profile/${user.userId}`}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Button as={RouterLink} to="/login" colorScheme="red">
              Login
            </Button>
          )}
        </HStack>
      </Flex>
    </Container>
  );
};

export default Navbar;
