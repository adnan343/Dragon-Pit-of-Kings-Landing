import React, { useEffect, useState } from "react";
import {
  Box,
  Image,
  Text,
  Flex,
  Spinner,
  Badge,
  SimpleGrid,
  Heading,
  VStack,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";

const Fights = () => {
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3000/api/fights")
      .then((res) => res.json())
      .then((data) => {
        setFights(data.fights || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch fights:", err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "yellow";
    }
  };

  const bgCard = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  if (loading)
    return (
      <Flex justify="center" mt="10">
        <Spinner size="xl" />
      </Flex>
    );

  return (
    <Box maxW="7xl" mx="auto" p={6}>
      <Heading textAlign="center" mb={8}>
        Dragon Fights
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 1 }} spacing={8}>
        {fights.map((fight) => (
          <Box
            key={fight._id}
            p={6}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            bg={bgCard}
            boxShadow="md"
            transition="transform 0.3s, box-shadow 0.3s"
            _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
          >
            {/* Header */}
            <Flex justify="space-between" mb={4} align="center">
              <Text fontSize="sm" color="gray.500">
                {new Date(fight.fightDate).toLocaleString()}
              </Text>
              <Badge colorScheme={getStatusColor(fight.status)} variant="solid">
                {fight.status.toUpperCase()}
              </Badge>
            </Flex>

            {/* Main Fight Grid */}
            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              justify="space-between"
            >
              {/* Challenger */}
              <VStack spacing={2} align="center">
                <Image
                  src={fight.challenger.dragon.image}
                  alt={fight.challenger.dragon.name}
                  boxSize="150px"
                  objectFit="cover"
                />
                <Text fontWeight="bold">{fight.challenger.dragon.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  Rider: {fight.challenger.rider.username}
                </Text>
              </VStack>

              {/* VS + Result */}
              <VStack spacing={1} textAlign="center" mx={4}>
                <Text fontSize="2xl" fontWeight="bold">
                  VS
                </Text>

                {/* Check for Draw or Cancelled */}
                {fight.status === "cancelled" ? (
                  <Badge colorScheme="red">Cancelled</Badge>
                ) : fight.result.isDraw ? (
                  <Badge colorScheme="yellow">Draw</Badge>
                ) : (
                  <>
                    <Text color="green.400">
                      Winner: {fight.result.winner?.name}
                    </Text>
                    <Text color="red.400">
                      Loser: {fight.result.loser?.name}
                    </Text>
                  </>
                )}

                {/* Show score only if it's not a draw or cancelled */}
                {!fight.status === "cancelled" && !fight.result.isDraw && (
                  <Text fontSize="sm" color="gray.400">
                    Score: {fight.result.winnerScore} -{" "}
                    {fight.result.loserScore}
                  </Text>
                )}
              </VStack>

              {/* Opponent */}
              <VStack spacing={2} align="center">
                <Image
                  src={fight.opponent.dragon.image}
                  alt={fight.opponent.dragon.name}
                  boxSize="150px"
                  objectFit="cover"
                />
                <Text fontWeight="bold">{fight.opponent.dragon.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  Rider: {fight.opponent.rider.username}
                </Text>
              </VStack>
            </Flex>

            {/* Fight Details */}
            <Divider my={4} />
            <Box fontSize="sm" color="gray.600">
              <Text>
                <strong>Location:</strong> {fight.fightDetails.location}
              </Text>
              <Text>
                <strong>Rounds:</strong> {fight.fightDetails.rounds}
              </Text>
              <Text>
                <strong>Notes:</strong> {fight.fightDetails.notes}
              </Text>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default Fights;
