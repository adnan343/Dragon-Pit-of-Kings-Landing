import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardBody,
  Text,
  Avatar,
  Stack,
  Button,
  useBreakpointValue,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const Riders = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  const isDesktop = useBreakpointValue({ base: false, lg: true }); // Check if it's a desktop view

  useEffect(() => {
    // Fetch users from the API
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/users");
        const result = await response.json();

        if (result.success) {
          const riders = result.data.filter(
            (user) => user.userType === "Dragon Rider"
          );
          setUsers(riders);
        } else {
          toast({
            title: "Error",
            description: "Unable to fetch users.",
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

    fetchUsers();
  }, [toast]);

  return (
    <Box py={8} px={{ base: 4, lg: 10 }} maxW="1300px" mx="auto">
      <Text
        fontSize={{ base: "2xl", sm: "3xl" }}
        fontWeight="bold"
        mb={6}
        textAlign="center"
      >
        Dragon Riders
      </Text>

      {loading ? (
        <Text fontSize="xl" textAlign="center" color="gray.500">
          Loading riders...
        </Text>
      ) : (
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={6}
        >
          {users.map((user) => (
            <Card
              key={user._id}
              borderWidth={1}
              borderRadius="md"
              boxShadow="lg"
              bg="white"
              _hover={{ transform: "scale(1.05)", boxShadow: "xl" }}
              transition="all 0.3s ease-in-out"
            >
              <CardBody>
                <Stack spacing={4} textAlign="center">
                  <Text fontSize="xl" fontWeight="bold" color="gray.800">
                    {user.name}
                  </Text>
                  <Text fontSize="lg" color="gray.500">
                    @{user.username}
                  </Text>
                  <Text fontSize="md" color="gray.600">
                    User Type: {user.userType}
                  </Text>
                  <Button
                    colorScheme="red"
                    variant="solid"
                    onClick={() => navigate(`/profile/${user._id}`)}
                  >
                    View Profile
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Riders;
