import { Container, Flex, Button, Text, HStack } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const Navbar = () => {
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
                    <Button
                        as={RouterLink}
                        to="/login"
                        colorScheme="red"
                    >
                        Login
                    </Button>
                </HStack>
            </Flex>
        </Container>
    );
};

export default Navbar;
