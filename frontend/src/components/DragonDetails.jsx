import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Stack,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Badge,
  Grid,
  GridItem,
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  HStack,
  Spinner,
  Center,
} from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const DragonDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [dragon, setDragon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [riderDetails, setRiderDetails] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isAcquireAlertOpen, setIsAcquireAlertOpen] = useState(false);
  const cancelRef = useRef();

  // Get user information from AuthContext using the useAuth hook
  const { user } = useAuth();
  const isAdmin = user && user.userType === "admin";
  const isRider = user && user.userType === "Dragon Rider";
  const hasRider = dragon?.rider;
  const isCurrentUserRider = dragon?.rider === user?.username;

  useEffect(() => {
    const fetchDragonDetails = async () => {
      try {
        const response = await axios.get(`/api/dragons/${id}`);
        setDragon(response.data.data);
        setLoading(false);

        // Fetch rider details if there's a rider assigned
        if (response.data.data.rider) {
          const riderResponse = await axios.get(
            `/api/users/${response.data.data.rider}`
          );
          setRiderDetails(riderResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching dragon details:", error);
        setLoading(false);
      }
    };

    fetchDragonDetails();
  }, [id]);

  const handleDeleteClick = () => {
    setIsAlertOpen(true);
  };

  const handleAcquireClick = () => {
    setIsAcquireAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`/api/dragons/${id}`);
      toast({
        title: "Dragon deleted",
        description:
          "The dragon has been successfully removed from the database.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/"); // Redirect to home page after deletion
    } catch (error) {
      console.error("Error deleting dragon:", error);
      toast({
        title: "Error",
        description: "Failed to delete the dragon. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
      setIsAlertOpen(false);
    }
  };

  const handleAcquireConfirm = async () => {
    setIsAcquiring(true);
    try {
      // const response = await axios.put(`/api/dragons/${id}`, {
      //   rider: user.username,
      // });
      console.log(user);
      console.log(id);

      setDragon((prev) => ({
        ...prev,
        rider: user.username,
      }));

      toast({
        title: "Dragon acquired",
        description: `You are now the rider of ${dragon.name}!`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error acquiring dragon:", error);
      toast({
        title: "Error",
        description: "Failed to acquire this dragon. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAcquiring(false);
      setIsAcquireAlertOpen(false);
    }
  };

  const handleReleaseConfirm = async () => {
    setIsAcquiring(true);
    try {
      const response = await axios.put(`/api/dragons/${id}`, {
        rider: null,
      });

      setDragon((prev) => ({
        ...prev,
        rider: null,
      }));

      toast({
        title: "Dragon released",
        description: `You have released ${dragon.name}.`,
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error releasing dragon:", error);
      toast({
        title: "Error",
        description: "Failed to release this dragon. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAcquiring(false);
      setIsAcquireAlertOpen(false);
    }
  };

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!dragon) {
    return <Text>Dragon not found</Text>;
  }

  const calculateWinRate = () => {
    const totalFights = dragon.fighting.wins + dragon.fighting.losses;
    return totalFights === 0
      ? 0
      : ((dragon.fighting.wins / totalFights) * 100).toFixed(1);
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={6}>
        <Box textAlign="center" position="relative">
          <Heading size="2xl" mb={4}>
            {dragon.name}
          </Heading>
          <Image
            src={dragon.image}
            alt={dragon.name}
            borderRadius="lg"
            maxH="400px"
            mx="auto"
          />

          {/* Action Buttons */}
          <HStack mt={4} justifyContent="flex-end">
            {isRider && !hasRider && (
              <Button
                colorScheme="green"
                onClick={handleAcquireClick}
                isLoading={isAcquiring}
                loadingText="Acquiring..."
              >
                Acquire Dragon
              </Button>
            )}

            {isRider && isCurrentUserRider && (
              <Button
                colorScheme="orange"
                onClick={handleAcquireClick}
                isLoading={isAcquiring}
                loadingText="Releasing..."
              >
                Release Dragon
              </Button>
            )}

            {isAdmin && (
              <Button
                colorScheme="red"
                onClick={handleDeleteClick}
                isLoading={isDeleting}
                loadingText="Deleting..."
              >
                Delete Dragon
              </Button>
            )}
          </HStack>
        </Box>

        <Grid templateColumns={["1fr", null, "repeat(2, 1fr)"]} gap={6}>
          <GridItem>
            <Box p={6} borderWidth={1} borderRadius="lg">
              <Heading size="md" mb={4}>
                Health Status
              </Heading>
              <Progress
                value={
                  (dragon.health.currentHealth / dragon.health.maxHealth) * 100
                }
                colorScheme={dragon.health.currentHealth > 50 ? "green" : "red"}
                mb={2}
              />
              <Text>
                {dragon.health.currentHealth}/{dragon.health.maxHealth} HP -{" "}
                {dragon.health.healthStatus}
              </Text>
            </Box>
          </GridItem>

          <GridItem>
            <Box p={6} borderWidth={1} borderRadius="lg">
              <Heading size="md" mb={4}>
                Combat Statistics
              </Heading>
              <StatGroup>
                <Stat>
                  <StatLabel>Wins</StatLabel>
                  <StatNumber>{dragon.fighting.wins}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Losses</StatLabel>
                  <StatNumber>{dragon.fighting.losses}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Win Rate</StatLabel>
                  <StatNumber>{calculateWinRate()}%</StatNumber>
                </Stat>
              </StatGroup>
            </Box>
          </GridItem>

          <GridItem>
            <Box p={6} borderWidth={1} borderRadius="lg">
              <Heading size="md" mb={4}>
                Feeding Information
              </Heading>
              <Stack spacing={3}>
                <Text>
                  <strong>Hunger Level:</strong>{" "}
                  <Badge
                    colorScheme={
                      dragon.feeding.hungerLevel === "Satiated"
                        ? "green"
                        : dragon.feeding.hungerLevel === "Content"
                        ? "blue"
                        : dragon.feeding.hungerLevel === "Hungry"
                        ? "yellow"
                        : "red"
                    }
                  >
                    {dragon.feeding.hungerLevel}
                  </Badge>
                </Text>
                <Text>
                  <strong>Preferred Food:</strong>{" "}
                  {dragon.feeding.preferredFood}
                </Text>
                <Text>
                  <strong>Last Fed:</strong>{" "}
                  {new Date(dragon.feeding.lastFed).toLocaleString()}
                </Text>
              </Stack>
            </Box>
          </GridItem>

          <GridItem>
            <Box p={6} borderWidth={1} borderRadius="lg">
              <Heading size="md" mb={4}>
                Dragon Details
              </Heading>
              <Stack spacing={3}>
                <Text>
                  <strong>Rider:</strong>{" "}
                  {riderDetails ? (
                    <Link to={`/profile/${riderDetails.id}`}>
                      <Badge colorScheme="purple">{riderDetails.name}</Badge>
                    </Link>
                  ) : (
                    "No rider assigned"
                  )}
                </Text>
                <Text>
                  <strong>Age:</strong> {dragon.age} years
                </Text>
                <Text>
                  <strong>Size:</strong> {dragon.size}
                </Text>
                <Text>
                  <strong>Description:</strong> {dragon.description}
                </Text>
              </Stack>
            </Box>
          </GridItem>
        </Grid>
      </Stack>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Dragon
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete {dragon.name}? This action cannot
              be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteConfirm}
                ml={3}
                isLoading={isDeleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Acquire/Release Confirmation Dialog */}
      <AlertDialog
        isOpen={isAcquireAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsAcquireAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {isCurrentUserRider ? "Release Dragon" : "Acquire Dragon"}
            </AlertDialogHeader>

            <AlertDialogBody>
              {isCurrentUserRider
                ? `Are you sure you want to release ${dragon.name}? Another rider may claim this dragon.`
                : `Are you sure you want to become the rider of ${dragon.name}?`}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsAcquireAlertOpen(false)}
              >
                Cancel
              </Button>
              <Button
                colorScheme={isCurrentUserRider ? "orange" : "green"}
                onClick={
                  isCurrentUserRider
                    ? handleReleaseConfirm
                    : handleAcquireConfirm
                }
                ml={3}
                isLoading={isAcquiring}
              >
                {isCurrentUserRider ? "Release" : "Acquire"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default DragonDetails;
