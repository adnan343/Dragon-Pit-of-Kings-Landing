import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Button,
  Text,
  useToast,
  Flex,
  Image,
  Stack,
  Divider,
  Grid,
  GridItem,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Card,
  CardHeader,
  CardBody,
  Textarea,
  Input,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const InitiateFight = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [myDragons, setMyDragons] = useState([]);
  const [allDragons, setAllDragons] = useState([]);
  const [otherDragons, setOtherDragons] = useState([]);

  const [selectedDragon, setSelectedDragon] = useState("");
  const [selectedOpponent, setSelectedOpponent] = useState("");
  const [location, setLocation] = useState("Dragon Arena");
  const [notes, setNotes] = useState("");

  const [selectedDragonDetails, setSelectedDragonDetails] = useState(null);
  const [selectedOpponentDetails, setSelectedOpponentDetails] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch all dragons
        const response = await axios.get(
          "http://localhost:3000/api/dragons/all"
        );

        if (response.data.success) {
          const allDragonsData = response.data.data;
          setAllDragons(allDragonsData);

          // Filter dragons that belong to the current user
          const userDragons = allDragonsData.filter(
            (dragon) => dragon.rider === user.userId
          );
          setMyDragons(userDragons);

          // Filter dragons that have riders but don't belong to the current user
          const otherRiderDragons = allDragonsData.filter(
            (dragon) => dragon.rider && dragon.rider !== user.userId
          );
          setOtherDragons(otherRiderDragons);
        }
      } catch (error) {
        console.error("Error fetching dragons:", error);
        toast({
          title: "Error",
          description: "Failed to fetch dragons. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.userId, toast]);

  useEffect(() => {
    // Update selected dragon details when selection changes
    if (selectedDragon) {
      const dragonDetails = allDragons.find(
        (dragon) => dragon._id === selectedDragon
      );
      setSelectedDragonDetails(dragonDetails);
    } else {
      setSelectedDragonDetails(null);
    }
  }, [selectedDragon, allDragons]);

  useEffect(() => {
    // Update selected opponent details when selection changes
    if (selectedOpponent) {
      const opponentDetails = allDragons.find(
        (dragon) => dragon._id === selectedOpponent
      );
      setSelectedOpponentDetails(opponentDetails);
    } else {
      setSelectedOpponentDetails(null);
    }
  }, [selectedOpponent, allDragons]);

  const handleDragonChange = (e) => {
    setSelectedDragon(e.target.value);
  };

  const handleOpponentChange = (e) => {
    setSelectedOpponent(e.target.value);
  };

  const calculateWinRate = (dragon) => {
    const totalFights =
      dragon.fighting.wins + dragon.fighting.losses + dragon.fighting.draws;
    return totalFights === 0
      ? 0
      : ((dragon.fighting.wins / totalFights) * 100).toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDragon || !selectedOpponent) {
      toast({
        title: "Validation Error",
        description: "Please select both your dragon and an opponent.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);

      const requestBody = {
        challengerDragonId: selectedDragon,
        opponentDragonId: selectedOpponent,
        riderId: user.userId,
        location: location,
        notes: notes,
      };

      const response = await axios.post(
        "http://localhost:3000/api/fights/initiate",
        requestBody
      );

      if (response.data.success) {
        toast({
          title: "Fight Initiated",
          description: "The fight has been successfully scheduled.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        // Redirect to the fight details page or another appropriate page
        navigate("/fights");
      }
    } catch (error) {
      console.error("Error initiating fight:", error);
      toast({
        title: "Error",
        description: "Failed to initiate fight. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // If user is not a Dragon Rider, show access denied message
  if (user.userType !== "Dragon Rider") {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" variant="solid" borderRadius="md">
          <AlertIcon />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            Only Dragon Riders can initiate fights. Please contact an
            administrator if you believe this is an error.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (myDragons.length === 0) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning" variant="subtle" borderRadius="md">
          <AlertIcon />
          <AlertTitle>No Dragons Available</AlertTitle>
          <AlertDescription>
            You don't have any dragons assigned to you. Please acquire a dragon
            first before initiating a fight.
          </AlertDescription>
        </Alert>

        <Button mt={4} colorScheme="blue" onClick={() => navigate("/")}>
          Browse Dragons
        </Button>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" mb={8} textAlign="center">
        Initiate a Dragon Fight
      </Heading>

      <form onSubmit={handleSubmit}>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
          {/* Your Dragon Selection */}
          <GridItem>
            <Card>
              <CardHeader bg="blue.500" color="white" borderTopRadius="md">
                <Heading size="md">Select Your Dragon</Heading>
              </CardHeader>

              <CardBody>
                <FormControl isRequired mb={4}>
                  <FormLabel>Your Dragon</FormLabel>
                  <Select
                    placeholder="Select your dragon"
                    value={selectedDragon}
                    onChange={handleDragonChange}
                  >
                    {myDragons.map((dragon) => (
                      <option key={dragon._id} value={dragon._id}>
                        {dragon.name} - {dragon.size} - Age: {dragon.age}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {selectedDragonDetails && (
                  <Box mt={4} p={4} borderWidth={1} borderRadius="md">
                    <HStack spacing={4} mb={4}>
                      <Image
                        src={selectedDragonDetails.image}
                        alt={selectedDragonDetails.name}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                        fallbackSrc="https://via.placeholder.com/100?text=Dragon"
                      />
                      <VStack align="flex-start" spacing={1}>
                        <Heading size="md">
                          {selectedDragonDetails.name}
                        </Heading>
                        <Text fontSize="sm">
                          Size: {selectedDragonDetails.size}
                        </Text>
                        <Text fontSize="sm">
                          Age: {selectedDragonDetails.age} years
                        </Text>
                        <Badge
                          colorScheme={
                            selectedDragonDetails.health.healthStatus ===
                            "Excellent"
                              ? "green"
                              : selectedDragonDetails.health.healthStatus ===
                                "Good"
                              ? "blue"
                              : selectedDragonDetails.health.healthStatus ===
                                "Fair"
                              ? "yellow"
                              : "red"
                          }
                        >
                          {selectedDragonDetails.health.healthStatus}
                        </Badge>
                      </VStack>
                    </HStack>

                    <Divider my={3} />

                    <StatGroup>
                      <Stat>
                        <StatLabel>Health</StatLabel>
                        <StatNumber>
                          {selectedDragonDetails.health.currentHealth}/
                          {selectedDragonDetails.health.maxHealth}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Win Rate</StatLabel>
                        <StatNumber>
                          {calculateWinRate(selectedDragonDetails)}%
                        </StatNumber>
                      </Stat>
                    </StatGroup>

                    <StatGroup mt={3}>
                      <Stat>
                        <StatLabel>Wins</StatLabel>
                        <StatNumber>
                          {selectedDragonDetails.fighting.wins}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Losses</StatLabel>
                        <StatNumber>
                          {selectedDragonDetails.fighting.losses}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Draws</StatLabel>
                        <StatNumber>
                          {selectedDragonDetails.fighting.draws}
                        </StatNumber>
                      </Stat>
                    </StatGroup>
                  </Box>
                )}
              </CardBody>
            </Card>
          </GridItem>

          {/* Opponent Dragon Selection */}
          <GridItem>
            <Card>
              <CardHeader bg="red.500" color="white" borderTopRadius="md">
                <Heading size="md">Select Opponent Dragon</Heading>
              </CardHeader>

              <CardBody>
                <FormControl isRequired mb={4}>
                  <FormLabel>Opponent Dragon</FormLabel>
                  <Select
                    placeholder="Select opponent dragon"
                    value={selectedOpponent}
                    onChange={handleOpponentChange}
                  >
                    {otherDragons.map((dragon) => (
                      <option key={dragon._id} value={dragon._id}>
                        {dragon.name} - {dragon.size} - Age: {dragon.age}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {selectedOpponentDetails && (
                  <Box mt={4} p={4} borderWidth={1} borderRadius="md">
                    <HStack spacing={4} mb={4}>
                      <Image
                        src={selectedOpponentDetails.image}
                        alt={selectedOpponentDetails.name}
                        boxSize="100px"
                        objectFit="cover"
                        borderRadius="md"
                        fallbackSrc="https://via.placeholder.com/100?text=Dragon"
                      />
                      <VStack align="flex-start" spacing={1}>
                        <Heading size="md">
                          {selectedOpponentDetails.name}
                        </Heading>
                        <Text fontSize="sm">
                          Size: {selectedOpponentDetails.size}
                        </Text>
                        <Text fontSize="sm">
                          Age: {selectedOpponentDetails.age} years
                        </Text>
                        <Badge
                          colorScheme={
                            selectedOpponentDetails.health.healthStatus ===
                            "Excellent"
                              ? "green"
                              : selectedOpponentDetails.health.healthStatus ===
                                "Good"
                              ? "blue"
                              : selectedOpponentDetails.health.healthStatus ===
                                "Fair"
                              ? "yellow"
                              : "red"
                          }
                        >
                          {selectedOpponentDetails.health.healthStatus}
                        </Badge>
                      </VStack>
                    </HStack>

                    <Divider my={3} />

                    <StatGroup>
                      <Stat>
                        <StatLabel>Health</StatLabel>
                        <StatNumber>
                          {selectedOpponentDetails.health.currentHealth}/
                          {selectedOpponentDetails.health.maxHealth}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Win Rate</StatLabel>
                        <StatNumber>
                          {calculateWinRate(selectedOpponentDetails)}%
                        </StatNumber>
                      </Stat>
                    </StatGroup>

                    <StatGroup mt={3}>
                      <Stat>
                        <StatLabel>Wins</StatLabel>
                        <StatNumber>
                          {selectedOpponentDetails.fighting.wins}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Losses</StatLabel>
                        <StatNumber>
                          {selectedOpponentDetails.fighting.losses}
                        </StatNumber>
                      </Stat>
                      <Stat>
                        <StatLabel>Draws</StatLabel>
                        <StatNumber>
                          {selectedOpponentDetails.fighting.draws}
                        </StatNumber>
                      </Stat>
                    </StatGroup>
                  </Box>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Fight Details */}
        <Card mt={8}>
          <CardHeader bg="purple.500" color="white" borderTopRadius="md">
            <Heading size="md">Fight Details</Heading>
          </CardHeader>

          <CardBody>
            <FormControl mb={4}>
              <FormLabel>Location</FormLabel>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter fight location"
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Notes</FormLabel>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about this fight"
                rows={4}
              />
            </FormControl>
          </CardBody>
        </Card>

        {/* Battle Preview */}
        {selectedDragonDetails && selectedOpponentDetails && (
          <Card mt={8}>
            <CardHeader bg="orange.500" color="white" borderTopRadius="md">
              <Heading size="md">Battle Preview</Heading>
            </CardHeader>

            <CardBody>
              <Flex
                direction={{ base: "column", md: "row" }}
                justifyContent="space-between"
                alignItems="center"
              >
                <Flex direction="column" alignItems="center" flex={1}>
                  <Image
                    src={selectedDragonDetails.image}
                    alt={selectedDragonDetails.name}
                    boxSize="150px"
                    objectFit="cover"
                    borderRadius="md"
                    fallbackSrc="https://via.placeholder.com/150?text=Dragon"
                  />
                  <Text mt={2} fontWeight="bold" fontSize="lg">
                    {selectedDragonDetails.name}
                  </Text>
                  <Text>
                    Win Rate: {calculateWinRate(selectedDragonDetails)}%
                  </Text>
                </Flex>

                <Box
                  textAlign="center"
                  fontSize="24px"
                  fontWeight="bold"
                  mx={4}
                >
                  VS
                </Box>

                <Flex direction="column" alignItems="center" flex={1}>
                  <Image
                    src={selectedOpponentDetails.image}
                    alt={selectedOpponentDetails.name}
                    boxSize="150px"
                    objectFit="cover"
                    borderRadius="md"
                    fallbackSrc="https://via.placeholder.com/150?text=Dragon"
                  />
                  <Text mt={2} fontWeight="bold" fontSize="lg">
                    {selectedOpponentDetails.name}
                  </Text>
                  <Text>
                    Win Rate: {calculateWinRate(selectedOpponentDetails)}%
                  </Text>
                </Flex>
              </Flex>
            </CardBody>
          </Card>
        )}

        {/* Submit Button */}
        <Box mt={8} textAlign="center">
          <Button
            type="submit"
            colorScheme="red"
            size="lg"
            isLoading={submitting}
            loadingText="Initiating Fight"
            isDisabled={!selectedDragon || !selectedOpponent}
          >
            Initiate Fight
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default InitiateFight;
