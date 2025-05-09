import {useState, useEffect} from "react";
import {useNavigate} from 'react-router-dom';
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
    useColorModeValue,
} from "@chakra-ui/react";
import axios from "axios";
import defaultDragonImage from "../images/default-dragon.png";

const DragonCard = ({dragon}) => {
    const navigate = useNavigate();
    const cardBg = useColorModeValue("white", "gray.800");
    const borderColor = useColorModeValue("gray.200", "gray.700");

    const placeholderUrl = "https://via.placeholder.com/300x200?text=Dragon";
    const handleClick = () => {
        navigate(`/dragons/${dragon._id}`);
    };


    // Check if the image is a placeholder URL and fall back to defaultDragonImage
    const imageToShow =
        dragon.image && dragon.image !== placeholderUrl
            ? dragon.image
            : defaultDragonImage;

    return (
        <Box
            onClick={handleClick} cursor="pointer"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            borderColor={borderColor}
            bg={cardBg}
            boxShadow="md"
            transition="transform 0.3s"
            _hover={{transform: "translateY(-5px)", boxShadow: "lg"}}
        >
            <Image
                src={imageToShow}
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
                <Text
                    mt={2}
                    color="gray.600"
                    fontStyle={dragon.rider ? "normal" : "italic"}
                >
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
                const response = await axios.get(
                    "http://localhost:3000/api/dragons/all"
                );
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
                // Keep error message in the UI for debugging
                setError(`API Error: ${err.message}. Using test data instead.`);
            }
        };

        fetchDragons();
    }, []);

    return (
        <Container maxW="container.xl" py={12}>
            <Flex
                align="center"
                justify="center"
                mb={8}
                bgGradient="linear(to-r, red.500, orange.400)"
                bgClip="text"
            >
                <Heading as="h1" size="2xl">
                    Find Your Legendary Companion
                </Heading>
            </Flex>

            {loading ? (
                <Grid
                    templateColumns={{
                        base: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: "repeat(4, 1fr)",
                    }}
                    gap={8}
                >
                    {[...Array(8)].map((_, i) => (
                        <Box key={i} borderWidth="1px" borderRadius="lg" overflow="hidden">
                            <Skeleton height="200px"/>
                            <Box p={4}>
                                <Skeleton height="20px" mb={2}/>
                                <Skeleton height="15px" mb={2}/>
                                <Skeleton height="15px" mb={2}/>
                                <Skeleton height="15px"/>
                            </Box>
                        </Box>
                    ))}
                </Grid>
            ) : error ? (
                <Box textAlign="center" p={6} color="red.500">
                    <Text>{error}</Text>
                </Box>
            ) : (
                <Grid
                    templateColumns={{
                        base: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                        lg: "repeat(4, 1fr)",
                    }}
                    gap={8}
                >
                    {dragons.map((dragon) => (
                        <DragonCard key={dragon._id} dragon={dragon}/>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default HomePage;
