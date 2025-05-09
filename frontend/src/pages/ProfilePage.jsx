import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Text,
  Button,
  useToast,
  Spinner,
  Badge,
  VStack,
  Divider,
  Flex,
  Center,
  Grid,
  GridItem,
  Stack,
} from "@chakra-ui/react";

const ProfilePage = () => {
  const { userId } = useParams(); // Get userId from the URL
  const [user, setUser] = useState(null);
  const [dragons, setDragons] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  // Fetch the user and their dragon data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${userId}`
        );
        const result = await response.json();

        if (result.success) {
          setUser(result.data);

          // Fetch dragon data if the user has acquired dragons
          if (
            result.data.acquiredDragons &&
            result.data.acquiredDragons.length > 0
          ) {
            const dragonDataPromises = result.data.acquiredDragons.map(
              (dragonId) =>
                fetch(
                  `http://localhost:3000/api/dragons/${dragonId}`
                ).then((res) => res.json())
            );
            const dragonResults = await Promise.all(dragonDataPromises);

            // Filter only successful dragon responses
            const validDragons = dragonResults
              .filter((res) => res.success)
              .map((res) => res.data);
            setDragons(validDragons);
          }
        } else {
          toast({
            title: "Error",
            description: "User not found.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, toast]);

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!user) {
    return (
      <Center h="100vh">
        <Text fontSize="xl" color="gray.500">
          User not found.
        </Text>
      </Center>
    );
  }

  return (
    <Box py={8} px={{ base: 4, lg: 10 }} maxW="900px" mx="auto">
      <Flex direction="column" align="center" justify="center">
        <Text fontSize="3xl" fontWeight="bold" color="gray.800" mb={2}>
          {user.name}
        </Text>
        <Text fontSize="xl" color="gray.600" mb={4}>
          @{user.username}
        </Text>
        <Text fontSize="lg" color="gray.500" mb={6}>
          User Type:{" "}
          <Badge
            colorScheme={user.userType === "Dragon Rider" ? "green" : "blue"}
          >
            {user.userType}
          </Badge>
        </Text>

        {/* Only show the "Acquired Dragons" section if the user is a Dragon Rider */}
        {user.userType === "Dragon Rider" && (
          <VStack align="start" spacing={4} w="full" mb={6}>
            <Text fontSize="lg" fontWeight="bold" color="gray.600">
              Acquired Dragons:
            </Text>

            {/* Grid to display dragon boxes */}
            <Grid
              templateColumns={{
                base: "repeat(1, 1fr)", // 1 column for small screens
                md: "repeat(2, 1fr)", // 2 columns for medium screens
                lg: "repeat(3, 1fr)", // 3 columns for large screens
                xl: "repeat(4, 1fr)", // 4 columns for extra-large screens
              }}
              gap={6} // Space between grid items
              w="full"
            >
              {dragons.length > 0 ? (
                dragons.map((dragon) => (
                  <GridItem key={dragon._id}>
                    <Link to={`/dragons/${dragon._id}`}>
                      <Box
                        p={4}
                        borderWidth={1}
                        borderRadius="md"
                        boxShadow="md"
                        w="full"
                        _hover={{ cursor: "pointer", bg: "gray.100" }} // Optional hover effect
                        h="auto" // Ensure the box height adjusts automatically
                      >
                        <Flex direction="column" align="start">
                          <Text
                            fontSize="lg"
                            fontWeight="bold"
                            color="gray.700"
                          >
                            {dragon.name}
                          </Text>
                          <Text fontSize="md" color="gray.600">
                            Age: {dragon.age} years
                          </Text>
                          <Text fontSize="md" color="gray.600">
                            Size: {dragon.size}
                          </Text>
                        </Flex>
                      </Box>
                    </Link>
                  </GridItem>
                ))
              ) : (
                <Text color="gray.500">No dragons acquired yet.</Text>
              )}
            </Grid>
          </VStack>
        )}

        <Text fontSize="lg" fontWeight="bold" color="gray.600">
          Member Since:
        </Text>
        <Text fontSize="lg" color="gray.500">
          {new Date(user.createdAt).toLocaleDateString()}
        </Text>

        <Divider my={4} />
        <Stack direction="row" spacing={4}>
          <Button colorScheme="red" onClick={() => navigate("/")}>
            Back to HomePage
          </Button>
          <Button colorScheme="red" onClick={() => navigate("/riders")}>
            Recent Fights
          </Button>
          <Button colorScheme="red" onClick={() => navigate("/riders")}>
            Check All the Riders
          </Button>
        </Stack>
      </Flex>
    </Box>
  );
};

export default ProfilePage;
