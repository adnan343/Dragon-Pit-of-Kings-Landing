import { useState, useEffect } from "react";
import {
    Box,
    Container,
    Grid,
    Heading,
    Text,
    Image,
    Badge,
    Flex,
    Skeleton,
    useColorModeValue
} from "@chakra-ui/react";
import axios from "axios";

const DragonCard = ({ dragon }) => {
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");

    return (
        <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            borderColor={borderColor}
            bg={cardBg}
            boxShadow="md"
            transition="transform 0.3s"
            _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
        >
            <Image
                src={dragon.image || "https://via.placeholder.com/300x200?text=Dragon"}
                alt={dragon.name}
                height="200px"
                width="100%"
                objectFit="cover"
            />
            <Box p={4}>
                <Flex justify="space-between" align="center" mb={2}>
                    <Heading as="h3" size="md">
                        {dragon.name}
                    </Heading>
                    <Badge colorScheme="red" fontSize="0.8em" borderRadius="full" px={2}>
                        {dragon.age} years old
                    </Badge>
                </Flex>
                <Text color="gray.500" fontSize="sm">
                    Size: {dragon.size}
                </Text>
                <Text mt={2} noOfLines={2}>
                    {dragon.description}
                </Text>
                <Text mt={2} color="gray.600" fontStyle={dragon.rider ? "normal" : "italic"}>
                    {dragon.rider ? "Has a rider" : "Available for riding"}
                </Text>
            </Box>
        </Box>
    );
};

const HomePage = () => {
    const [dragons, setDragons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDragons = async () => {
            try {
                setLoading(true);
                console.log("Fetching dragons from API...");

                // Try with explicit URL for testing
                const response = await axios.get("http://localhost:3000/api/dragons");
                console.log("API Response:", response);

                if (response.data && response.data.data) {
                    console.log("Dragon data found:", response.data.data);
                    setDragons(response.data.data);
                } else {
                    console.error("Unexpected data format:", response.data);
                    setDragons([]);
                }
                setLoading(false);
            } catch (err) {
                console.error("Error details:", err);

                // Fallback to test data if API fails
                console.log("Using fallback test data...");
                const testDragons = [
                    {
                        _id: '1',
                        name: 'Drogon',
                        size: 'Large',
                        age: 8,
                        description: 'Black dragon with red accents, fierce and loyal'
                    },
                    {
                        _id: '2',
                        name: 'Rhaegal',
                        size: 'Medium',
                        age: 7,
                        description: 'Green scales, more docile than his siblings'
                    },
                    {
                        _id: '3',
                        name: 'Viserion',
                        size: 'Medium',
                        age: 7,
                        description: 'Cream and gold colored dragon, curious and intelligent'
                    }
                ];
                setDragons(testDragons);
                setLoading(false);
                // Keep error message in the UI for debugging
                setError(`API Error: ${err.message}. Using test data instead.`);
            }
        };


        fetchDragons();
    }, []);

    return (
        <Container maxW="1140px" py={8}>
            <Box textAlign="center" mb={10}>
                <Heading
                    as="h1"
                    size="2xl"
                    mb={4}
                    bgGradient="linear(to-r, red.500, orange.400)"
                    bgClip="text"
                >
                    Welcome to Dragon Sanctuary
                </Heading>
                <Text fontSize="xl" maxW="800px" mx="auto">
                    Discover magnificent dragons seeking companionship and adventure
                </Text>
            </Box>

            {loading ? (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                    {[...Array(6)].map((_, i) => (
                        <Box key={i} borderWidth="1px" borderRadius="lg" overflow="hidden">
                            <Skeleton height="200px" />
                            <Box p={4}>
                                <Skeleton height="20px" mb={2} />
                                <Skeleton height="15px" mb={2} />
                                <Skeleton height="15px" mb={2} />
                                <Skeleton height="15px" />
                            </Box>
                        </Box>
                    ))}
                </Grid>
            ) : error ? (
                <Box textAlign="center" p={6} color="red.500">
                    <Text>{error}</Text>
                </Box>
            ) : (
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
                    {dragons.map((dragon) => (
                        <DragonCard key={dragon._id} dragon={dragon} />
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default HomePage;
