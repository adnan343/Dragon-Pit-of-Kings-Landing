import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  Avatar,
  Stack,
  Button,
  useToast,
  Spinner,
  Badge,
  VStack,
  Divider,
  Flex,
  Center,
} from "@chakra-ui/react";

const ProfilePage = () => {
  const { userId } = useParams(); // Get userId from the URL
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the user data based on userId
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/users/${userId}`
        );
        const result = await response.json();

        if (result.success) {
          setUser(result.data);
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

    fetchUser();
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

        <VStack align="start" spacing={4} w="full" mb={6}>
          <Text fontSize="lg" fontWeight="bold" color="gray.600">
            Acquired Dragons:
          </Text>
          {user.acquiredDragons && user.acquiredDragons.length > 0 ? (
            <VStack align="start" spacing={1}>
              {user.acquiredDragons.map((dragonId, index) => (
                <Text key={index} color="gray.700">
                  Dragon {index + 1}: {dragonId}
                </Text>
              ))}
            </VStack>
          ) : (
            <Text color="gray.500">No dragons acquired yet.</Text>
          )}
          <Text fontSize="lg" fontWeight="bold" color="gray.600">
            Member Since:
          </Text>
          <Text fontSize="lg" color="gray.500">
            {new Date(user.createdAt).toLocaleDateString()}
          </Text>
        </VStack>

        <Divider my={4} />

        <Button colorScheme="red" onClick={() => navigate("/riders")}>
          Back to Riders
        </Button>
      </Flex>
    </Box>
  );
};

export default ProfilePage;
