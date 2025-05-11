import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Select,
  Button,
  Text,
  useToast,
  Flex,
  Image,
  Divider,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
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
  useColorModeValue,
  SimpleGrid,
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

  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:3000/api/dragons/all"
        );

        if (response.data.success) {
          const allDragonsData = response.data.data;
          setAllDragons(allDragonsData);
          setMyDragons(allDragonsData.filter((d) => d.rider === user.userId));
          setOtherDragons(
            allDragonsData.filter((d) => d.rider && d.rider !== user.userId)
          );
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
    setSelectedDragonDetails(
      allDragons.find((d) => d._id === selectedDragon) || null
    );
  }, [selectedDragon, allDragons]);

  useEffect(() => {
    setSelectedOpponentDetails(
      allDragons.find((d) => d._id === selectedOpponent) || null
    );
  }, [selectedOpponent, allDragons]);

  const calculateWinRate = (dragon) => {
    const total =
      dragon.fighting.wins + dragon.fighting.losses + dragon.fighting.draws;
    return total === 0
      ? "0.0"
      : ((dragon.fighting.wins / total) * 100).toFixed(1);
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

      const response = await axios.post(
        "http://localhost:3000/api/fights/initiate",
        {
          challengerDragonId: selectedDragon,
          opponentDragonId: selectedOpponent,
          riderId: user.userId,
          location,
          notes,
        }
      );

      if (response.data.success) {
        toast({
          title: "Fight Initiated",
          description: "The fight has been successfully scheduled.",
          status: "success",
          duration: 4000,
        });
        navigate("/fights");
      }
    } catch (error) {
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

  if (user.userType !== "Dragon Rider") {
    return (
      <Box maxW="7xl" mx="auto" p={6}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              Only Dragon Riders can initiate fights. Please contact an admin if
              this is a mistake.
            </AlertDescription>
          </Box>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Flex justify="center" mt="10">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (myDragons.length === 0) {
    return (
      <Box maxW="7xl" mx="auto" p={6}>
        <Alert status="warning" variant="subtle" borderRadius="md" mb={4}>
          <AlertIcon />
          <Box>
            <AlertTitle>No Dragons Available</AlertTitle>
            <AlertDescription>
              You don't have any dragons. Please acquire one before initiating a
              fight.
            </AlertDescription>
          </Box>
        </Alert>
        <Button colorScheme="blue" onClick={() => navigate("/")}>
          Browse Dragons
        </Button>
      </Box>
    );
  }

  return (
    <Box maxW="7xl" mx="auto" p={6}>
      <Heading textAlign="center" mb={8}>
        Initiate a Dragon Fight
      </Heading>

      <form onSubmit={handleSubmit}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          {[
            {
              label: "Your Dragon",
              dragons: myDragons,
              selected: selectedDragon,
              setSelected: setSelectedDragon,
              details: selectedDragonDetails,
              color: "blue.500",
            },
            {
              label: "Opponent Dragon",
              dragons: otherDragons,
              selected: selectedOpponent,
              setSelected: setSelectedOpponent,
              details: selectedOpponentDetails,
              color: "red.500",
            },
          ].map(({ label, dragons, selected, setSelected, details, color }) => (
            <Box
              key={label}
              bg={bgCard}
              border="1px solid"
              borderColor={borderColor}
              borderRadius="lg"
              p={6}
              boxShadow="md"
            >
              <FormControl isRequired mb={4}>
                <FormLabel>{label}</FormLabel>
                <Select
                  placeholder={`Select ${label.toLowerCase()}`}
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                >
                  {dragons.map((dragon) => (
                    <option key={dragon._id} value={dragon._id}>
                      {dragon.name} - {dragon.size} - Age: {dragon.age}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {details && (
                <Box mt={4} p={4} borderWidth={1} borderRadius="md">
                  <HStack spacing={4} mb={4}>
                    <Image
                      src={details.image}
                      alt={details.name}
                      boxSize="100px"
                      objectFit="cover"
                      borderRadius="md"
                    />
                    <VStack align="flex-start" spacing={1}>
                      <Heading size="md">{details.name}</Heading>
                      <Text fontSize="sm">Size: {details.size}</Text>
                      <Text fontSize="sm">Age: {details.age} years</Text>
                      <Badge
                        colorScheme={
                          details.health.healthStatus === "Excellent"
                            ? "green"
                            : details.health.healthStatus === "Good"
                            ? "blue"
                            : details.health.healthStatus === "Fair"
                            ? "yellow"
                            : "red"
                        }
                      >
                        {details.health.healthStatus}
                      </Badge>
                    </VStack>
                  </HStack>

                  <Divider my={3} />

                  <StatGroup>
                    <Stat>
                      <StatLabel>Health</StatLabel>
                      <StatNumber>
                        {details.health.currentHealth}/
                        {details.health.maxHealth}
                      </StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Wins</StatLabel>
                      <StatNumber>{details.fighting.wins}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Losses</StatLabel>
                      <StatNumber>{details.fighting.losses}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Draws</StatLabel>
                      <StatNumber>{details.fighting.draws}</StatNumber>
                    </Stat>
                    <Stat>
                      <StatLabel>Win Rate</StatLabel>
                      <StatNumber>{calculateWinRate(details)}%</StatNumber>
                    </Stat>
                  </StatGroup>
                </Box>
              )}
            </Box>
          ))}
        </SimpleGrid>

        <Box
          mt={8}
          bg={bgCard}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="lg"
          p={6}
          boxShadow="md"
        >
          <FormControl mb={4}>
            <FormLabel>Fight Location</FormLabel>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Notes</FormLabel>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any special instructions or notes for the fight..."
              resize="vertical"
            />
          </FormControl>

          <Button type="submit" colorScheme="teal" isLoading={submitting}>
            Initiate Fight
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default InitiateFight;
