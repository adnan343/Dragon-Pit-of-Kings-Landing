import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
    Divider,
    Badge,
    Grid,
    GridItem,
} from '@chakra-ui/react';
import axios from 'axios';

const DragonDetails = () => {
    const { id } = useParams();
    const [dragon, setDragon] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDragonDetails = async () => {
            try {
                const response = await axios.get(`/api/dragons/${id}`);
                setDragon(response.data.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching dragon details:', error);
                setLoading(false);
            }
        };

        fetchDragonDetails();
    }, [id]);

    if (loading) {
        return <Text>Loading...</Text>;
    }

    if (!dragon) {
        return <Text>Dragon not found</Text>;
    }

    const calculateWinRate = () => {
        const totalFights = dragon.fighting.wins + dragon.fighting.losses;
        return totalFights === 0 ? 0 : ((dragon.fighting.wins / totalFights) * 100).toFixed(1);
    };

    return (
        <Container maxW="container.xl" py={8}>
            <Stack spacing={6}>
                <Box textAlign="center">
                    <Heading size="2xl" mb={4}>{dragon.name}</Heading>
                    <Image
                        src={dragon.image}
                        alt={dragon.name}
                        borderRadius="lg"
                        maxH="400px"
                        mx="auto"
                    />
                </Box>

                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                    <GridItem>
                        <Box p={6} borderWidth={1} borderRadius="lg">
                            <Heading size="md" mb={4}>Health Status</Heading>
                            <Progress
                                value={(dragon.health.currentHealth / dragon.health.maxHealth) * 100}
                                colorScheme={dragon.health.currentHealth > 50 ? "green" : "red"}
                                mb={2}
                            />
                            <Text>
                                {dragon.health.currentHealth}/{dragon.health.maxHealth} HP - {dragon.health.healthStatus}
                            </Text>
                        </Box>
                    </GridItem>

                    <GridItem>
                        <Box p={6} borderWidth={1} borderRadius="lg">
                            <Heading size="md" mb={4}>Combat Statistics</Heading>
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
                            <Heading size="md" mb={4}>Feeding Information</Heading>
                            <Stack spacing={3}>
                                <Text>
                                    <strong>Hunger Level:</strong>{' '}
                                    <Badge colorScheme={
                                        dragon.feeding.hungerLevel === 'Satiated' ? 'green' :
                                            dragon.feeding.hungerLevel === 'Content' ? 'blue' :
                                                dragon.feeding.hungerLevel === 'Hungry' ? 'yellow' :
                                                    'red'
                                    }>
                                        {dragon.feeding.hungerLevel}
                                    </Badge>
                                </Text>
                                <Text><strong>Preferred Food:</strong> {dragon.feeding.preferredFood}</Text>
                                <Text><strong>Last Fed:</strong> {new Date(dragon.feeding.lastFed).toLocaleString()}</Text>
                            </Stack>
                        </Box>
                    </GridItem>

                    <GridItem>
                        <Box p={6} borderWidth={1} borderRadius="lg">
                            <Heading size="md" mb={4}>Dragon Details</Heading>
                            <Stack spacing={3}>
                                <Text><strong>Rider:</strong> {dragon.rider || 'No rider assigned'}</Text>
                                <Text><strong>Age:</strong> {dragon.age} years</Text>
                                <Text><strong>Size:</strong> {dragon.size}</Text>
                                <Text><strong>Description:</strong> {dragon.description}</Text>
                            </Stack>
                        </Box>
                    </GridItem>
                </Grid>
            </Stack>
        </Container>
    );
};

export default DragonDetails;