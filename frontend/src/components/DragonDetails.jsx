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
  Select,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
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
  const [isHealing, setIsHealing] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isAcquireAlertOpen, setIsAcquireAlertOpen] = useState(false);
  const [isHealAlertOpen, setIsHealAlertOpen] = useState(false);
  const [isFeedAlertOpen, setIsFeedAlertOpen] = useState(false);
  const [healAmount, setHealAmount] = useState(10);
  const [selectedFood, setSelectedFood] = useState("Meat");
  const cancelRef = useRef();
  const [hasRider, setHasRider] = useState(false);
  const [isCurrentUserRider, setIsCurrentUserRider] = useState(false);
  const [fights, setFights] = useState([]);

  // Get user information from AuthContext using the useAuth hook
  const { user } = useAuth();
  const isAdmin = user && user.userType === "admin";
  const isRider = user && user.userType === "Dragon Rider";
  const isKeeper = user && user.userType === "Dragon Keeper";

  useEffect(() => {
    const fetchDragonDetails = async () => {
      try {
        // Fetch dragon data
        const dragonResponse = await axios.get(
          `http://localhost:3000/api/dragons/${id}`
        );
        const dragonData = dragonResponse.data.data;
        setDragon(dragonData);

        // Check if dragon has a rider
        const dragonHasRider =
          dragonData.rider !== null && dragonData.rider !== undefined;
        setHasRider(dragonHasRider);

        // Fetch rider details if there's a rider assigned
        if (dragonHasRider) {
          try {
            const riderResponse = await axios.get(
              `http://localhost:3000/api/users/${dragonData.rider}`
            );
            setRiderDetails(riderResponse.data.data);
          } catch (error) {
            console.error("Error fetching rider details:", error);
          }
        }
        const fetchDragonFights = async (dragonId) => {
          try {
            const fightsResponse = await axios.get(
              `http://localhost:3000/api/fights/dragon/${dragonId}`
            );
            if (fightsResponse.data.success) {
              setFights(fightsResponse.data.fights);
            }
          } catch (error) {
            console.error("Error fetching dragon fights:", error);
          }
        };

        // Check if current user is the rider
        if (user && dragonHasRider) {
          try {
            // Fetch current user data to get their acquired dragons
            const userResponse = await axios.get(
              `http://localhost:3000/api/users/${user.userId}`
            );
            const userData = userResponse.data.data;

            // Check if this dragon is in the user's acquired dragons list
            const isUserRider =
              userData.acquiredDragons &&
              userData.acquiredDragons.includes(dragonData._id);

            setIsCurrentUserRider(isUserRider);
          } catch (error) {
            console.error("Error fetching user data:", error);
            setIsCurrentUserRider(false);
          }
        }
        await fetchDragonFights(id);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dragon details:", error);
        setLoading(false);
      }
    };

    fetchDragonDetails();
  }, [id, user]);

  const handleDeleteClick = () => {
    setIsAlertOpen(true);
  };

  const handleAcquireClick = () => {
    setIsAcquireAlertOpen(true);
  };

  const handleHealClick = () => {
    setIsHealAlertOpen(true);
  };

  const handleFeedClick = () => {
    setIsFeedAlertOpen(true);
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
      // POST request to /api/acquire to acquire the dragon
      const response = await axios.post("/api/acquire", {
        userId: user.userId, // Use user.userId for the user ID
        dragonId: id, // Use dragon.id for the dragon ID
      });

      setDragon((prev) => ({
        ...prev,
        rider: user.userId, // Update the rider in the local state
      }));

      // Update the state variables
      setHasRider(true);
      setIsCurrentUserRider(true);

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
      // POST request to /api/acquire/remove to release the dragon
      const response = await axios.post("/api/acquire/remove", {
        userId: user.userId, // Use user.userId for the user ID
        dragonId: id, // Use dragon.id for the dragon ID
      });

      setDragon((prev) => ({
        ...prev,
        rider: null, // Remove the rider in the local state
      }));

      // Update the state variables
      setHasRider(false);
      setIsCurrentUserRider(false);
      setRiderDetails(null);

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

  const handleHealConfirm = async () => {
    setIsHealing(true);
    try {
      // POST request to heal the dragon
      const response = await axios.post(
        `http://localhost:3000/api/dragons/${id}/heal`,
        {
          healAmount: healAmount,
        }
      );

      // Update the dragon's health in local state
      setDragon((prev) => ({
        ...prev,
        health: {
          ...prev.health,
          currentHealth: Math.min(
            prev.health.currentHealth + healAmount,
            prev.health.maxHealth
          ),
        },
      }));

      toast({
        title: "Dragon healed",
        description: `You have healed ${dragon.name} for ${healAmount} HP.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error healing dragon:", error);
      toast({
        title: "Error",
        description: "Failed to heal this dragon. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsHealing(false);
      setIsHealAlertOpen(false);
    }
  };

  const handleFeedConfirm = async () => {
    setIsFeeding(true);
    try {
      // POST request to feed the dragon
      const response = await axios.post(
        `http://localhost:3000/api/dragons/${id}/feed`,
        {
          foodType: selectedFood,
          feederId: user.userId,
        }
      );

      // Update the dragon's feeding status in local state
      setDragon((prev) => ({
        ...prev,
        feeding: {
          ...prev.feeding,
          hungerLevel: "Satiated",
          lastFed: new Date().toISOString(),
        },
      }));

      toast({
        title: "Dragon fed",
        description: `You have fed ${dragon.name} with ${selectedFood}.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error feeding dragon:", error);
      toast({
        title: "Error",
        description: "Failed to feed this dragon. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsFeeding(false);
      setIsFeedAlertOpen(false);
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

  // Calculate health percentage
  const healthPercentage =
    (dragon.health.currentHealth / dragon.health.maxHealth) * 100;
  const needsHealing = healthPercentage < 80;

  // Check if dragon needs feeding
  const needsFeeding = dragon.feeding.hungerLevel !== "Satiated";

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
            {/* Dragon Keeper Buttons */}
            {isKeeper && needsHealing && (
              <Button
                colorScheme="blue"
                onClick={handleHealClick}
                isLoading={isHealing}
                loadingText="Healing..."
              >
                Heal Dragon
              </Button>
            )}

            {isKeeper && needsFeeding && (
              <Button
                colorScheme="teal"
                onClick={handleFeedClick}
                isLoading={isFeeding}
                loadingText="Feeding..."
              >
                Feed Dragon
              </Button>
            )}

            {/* Dragon Rider Buttons */}
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

            {/* Admin Buttons */}
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
                value={healthPercentage}
                colorScheme={healthPercentage > 50 ? "green" : "red"}
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
          <GridItem colSpan={2}>
            <Box p={6} borderWidth={1} borderRadius="lg">
              <Heading size="md" mb={4}>
                Recent Fights
              </Heading>
              {fights.length > 0 ? (
                <Stack spacing={4}>
                  {fights.slice(0, 3).map((fight) => (
                    <Box
                      key={fight._id}
                      p={3}
                      borderWidth={1}
                      borderRadius="md"
                    >
                      <HStack justifyContent="space-between" mb={2}>
                        <Text fontWeight="bold">
                          {new Date(fight.fightDate).toLocaleDateString()}
                        </Text>
                        <Badge
                          colorScheme={
                            fight.status === "completed"
                              ? fight.result.isDraw
                                ? "blue"
                                : fight.result.winner === dragon._id
                                ? "green"
                                : "red"
                              : "gray"
                          }
                        >
                          {fight.status === "completed"
                            ? fight.result.isDraw
                              ? "Draw"
                              : fight.result.winner === dragon._id
                              ? "Victory"
                              : "Defeat"
                            : "Cancelled"}
                        </Badge>
                      </HStack>

                      <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                        <GridItem>
                          <Text fontSize="sm" fontWeight="medium">
                            {fight.challenger.dragon._id === dragon._id
                              ? "You"
                              : fight.challenger.dragon.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Rider: {fight.challenger.rider.username}
                          </Text>
                        </GridItem>

                        <GridItem textAlign="center">
                          {fight.status === "completed" ? (
                            <Text fontWeight="bold">
                              {fight.result.isDraw
                                ? `${fight.result.winnerScore} - ${fight.result.loserScore}`
                                : fight.result.winner ===
                                  fight.challenger.dragon._id
                                ? `${fight.result.winnerScore} - ${fight.result.loserScore}`
                                : `${fight.result.loserScore} - ${fight.result.winnerScore}`}
                            </Text>
                          ) : (
                            <Text fontStyle="italic">Cancelled</Text>
                          )}
                          <Text fontSize="xs">
                            {fight.fightDetails.rounds}{" "}
                            {fight.fightDetails.rounds === 1
                              ? "round"
                              : "rounds"}
                          </Text>
                        </GridItem>

                        <GridItem textAlign="right">
                          <Text fontSize="sm" fontWeight="medium">
                            {fight.opponent.dragon._id === dragon._id
                              ? "You"
                              : fight.opponent.dragon.name}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Rider: {fight.opponent.rider.username}
                          </Text>
                        </GridItem>
                      </Grid>

                      {fight.fightDetails.notes && (
                        <Text fontSize="xs" mt={2} color="gray.500">
                          Notes: {fight.fightDetails.notes}
                        </Text>
                      )}
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Text>No fight history available for this dragon.</Text>
              )}
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

      {/* Heal Confirmation Dialog */}
      <AlertDialog
        isOpen={isHealAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsHealAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Heal Dragon
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text mb={4}>How much would you like to heal {dragon.name}?</Text>
              <FormControl>
                <FormLabel>Heal Amount</FormLabel>
                <NumberInput
                  min={1}
                  max={dragon.health.maxHealth - dragon.health.currentHealth}
                  value={healAmount}
                  onChange={(valueString) =>
                    setHealAmount(parseInt(valueString))
                  }
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsHealAlertOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleHealConfirm}
                ml={3}
                isLoading={isHealing}
              >
                Heal
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Feed Confirmation Dialog */}
      <AlertDialog
        isOpen={isFeedAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsFeedAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Feed Dragon
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text mb={4}>What would you like to feed {dragon.name}?</Text>
              <FormControl>
                <FormLabel>Food Type</FormLabel>
                <Select
                  value={selectedFood}
                  onChange={(e) => setSelectedFood(e.target.value)}
                >
                  <option value="Meat">Meat</option>
                  <option value="Fish">Fish</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  {dragon.feeding.preferredFood && (
                    <option value={dragon.feeding.preferredFood}>
                      {dragon.feeding.preferredFood} (Preferred)
                    </option>
                  )}
                </Select>
              </FormControl>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsFeedAlertOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleFeedConfirm}
                ml={3}
                isLoading={isFeeding}
              >
                Feed
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
};

export default DragonDetails;
