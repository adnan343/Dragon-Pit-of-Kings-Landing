import { Container, Flex, Button, Text, HStack, Menu, MenuButton, MenuList, MenuItem } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user data exists in localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
    };

    // Check if the user is admin
    const isAdmin = user && user.userType === 'admin';

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
                                {user.name} ({user.userType})
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