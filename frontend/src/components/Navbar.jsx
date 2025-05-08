import { Container, Flex, Button, Text, HStack, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <Container maxW={"1140px"} px={4}>
            <Flex
                h={16}
                alignItems={"center"}
                justifyContent={"space-between"}
                flexDir={{
                    base: "column",
                    sm: "row"
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
                    <Button
                        as={RouterLink}
                        to="/"
                        colorScheme="red"
                        variant="ghost"
                    >
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
                    {isAuthenticated && (
                        <Button
                            as={RouterLink}
                            to="/add-dragon"
                            colorScheme="red"
                            variant="ghost"
                        >
                            Add Dragon
                        </Button>
                    )}

                    {isAuthenticated ? (
                        <Menu>
                            <MenuButton as={Button} colorScheme="red">
                                {user.name || user.username}
                            </MenuButton>
                            <MenuList>
                                <MenuItem as={RouterLink} to="/profile">Profile</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </MenuList>
                        </Menu>
                    ) : (
                        <Button
                            as={RouterLink}
                            to="/login"
                            colorScheme="red"
                        >
                            Login
                        </Button>
                    )}
                </HStack>
            </Flex>
        </Container>
    );
};

export default Navbar;