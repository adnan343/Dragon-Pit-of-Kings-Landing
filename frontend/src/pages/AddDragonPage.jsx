import { Box, Container, Heading, Text } from "@chakra-ui/react";

const AddDragonPage = () => {
    return (
        <Container maxW="1140px" py={8}>
            <Box p={6} borderRadius="lg" borderWidth="1px">
                <Heading as="h1" size="xl" mb={4}>
                    Add New Dragon
                </Heading>
                <Text>Form will be implemented here</Text>
            </Box>
        </Container>
    );
};

export default AddDragonPage;