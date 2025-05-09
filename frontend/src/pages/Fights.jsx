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
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Input,
  FormControl,
  FormLabel,
  Switch,
  useToast,
  Select,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";

const Fights = () => {
  const { user } = useAuth();
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFight, setSelectedFight] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState({});
  const toast = useToast();

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

  const handleOpenForm = (fight) => {
    setSelectedFight(fight);
    setFormData({
      fightId: fight._id,
      riderId: fight.challenger.rider._id,
      challengerScore: 0,
      opponentScore: 0,
      rounds: 1,
      winnerDragonId: fight.challenger.dragon._id,
      isDraw: false,
    });
    onOpen();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...formData };
      if (payload.isDraw) delete payload.winnerDragonId;

      const res = await fetch("http://localhost:3000/api/fights/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update fight");

      toast({ title: "Fight updated.", status: "success", duration: 3000 });
      onClose();

      const refreshed = await fetch(
        "http://localhost:3000/api/fights"
      ).then((r) => r.json());
      setFights(refreshed.fights || []);
    } catch (err) {
      console.error(err);
      toast({ title: "Error updating fight", status: "error", duration: 3000 });
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
            _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
          >
            <Flex justify="space-between" mb={4} align="center">
              <Text fontSize="sm" color="gray.500">
                {new Date(fight.fightDate).toLocaleString()}
              </Text>
              <Badge colorScheme={getStatusColor(fight.status)} variant="solid">
                {fight.status.toUpperCase()}
              </Badge>
            </Flex>

            <Flex
              direction={{ base: "column", md: "row" }}
              align="center"
              justify="space-between"
            >
              <VStack spacing={2}>
                <Image
                  src={fight.challenger.dragon.image}
                  alt={fight.challenger.dragon.name}
                  boxSize="150px"
                />
                <Text fontWeight="bold">{fight.challenger.dragon.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  Rider: {fight.challenger.rider.username}
                </Text>
              </VStack>

              <VStack mx={4} spacing={1} textAlign="center">
                <Text fontSize="2xl" fontWeight="bold">
                  VS
                </Text>
                {fight.status === "cancelled" ? (
                  <Badge colorScheme="red">Cancelled</Badge>
                ) : fight.status === "pending" ? (
                  <>
                    <Badge colorScheme="yellow">Pending</Badge>
                    {[
                      fight.challenger.rider._id,
                      fight.opponent.rider._id,
                    ].includes(user?.userId) && (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        mt={2}
                        onClick={() => handleOpenForm(fight)}
                      >
                        Update Result
                      </Button>
                    )}
                  </>
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
                {fight.status !== "cancelled" && !fight.result?.isDraw && (
                  <Text fontSize="sm" color="gray.400">
                    Score: {fight.result.winnerScore} -{" "}
                    {fight.result.loserScore}
                  </Text>
                )}
              </VStack>

              <VStack spacing={2}>
                <Image
                  src={fight.opponent.dragon.image}
                  alt={fight.opponent.dragon.name}
                  boxSize="150px"
                />
                <Text fontWeight="bold">{fight.opponent.dragon.name}</Text>
                <Text fontSize="sm" color="gray.500">
                  Rider: {fight.opponent.rider.username}
                </Text>
              </VStack>
            </Flex>

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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Fight Result</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Challenger Score</FormLabel>
              <Input
                type="number"
                name="challengerScore"
                value={formData.challengerScore}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Opponent Score</FormLabel>
              <Input
                type="number"
                name="opponentScore"
                value={formData.opponentScore}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Rounds</FormLabel>
              <Input
                type="number"
                name="rounds"
                value={formData.rounds}
                onChange={handleChange}
              />
            </FormControl>
            <FormControl display="flex" alignItems="center" mb={3}>
              <FormLabel mb="0">Is Draw?</FormLabel>
              <Switch
                name="isDraw"
                isChecked={formData.isDraw}
                onChange={handleChange}
              />
            </FormControl>
            {!formData.isDraw && (
              <FormControl mb={3}>
                <FormLabel>Winner</FormLabel>
                <Select
                  name="winnerDragonId"
                  value={formData.winnerDragonId}
                  onChange={handleChange}
                >
                  <option value={selectedFight?.challenger.dragon._id}>
                    {selectedFight?.challenger.dragon.name}
                  </option>
                  <option value={selectedFight?.opponent.dragon._id}>
                    {selectedFight?.opponent.dragon.name}
                  </option>
                </Select>
              </FormControl>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Fights;
