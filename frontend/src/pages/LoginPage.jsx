import { useState } from 'react';
import {
    Box,
    Button,
    Container,
    FormControl,
    FormLabel,
    Heading,
    Input,
    Stack,
    Text,
    useToast,
    InputGroup,
    InputRightElement
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const toast = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.username || !formData.password) {
            toast({
                title: 'Missing fields',
                description: 'Please fill in all the fields',
                status: 'warning',
                duration: 3000,
                isClosable: true
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/users/login', {  // Ensure this matches your backend route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.msg || 'Login failed');
            }

            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(data.data));

            toast({
                title: 'Login successful',
                description: 'Welcome back!',
                status: 'success',
                duration: 3000,
                isClosable: true
            });

            // Redirect to home page
            navigate('/');

        } catch (error) {
            toast({
                title: 'Login failed',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxW="md" py={12}>
            <Box
                p={8}
                borderWidth={1}
                borderRadius="lg"
                boxShadow="lg"
            >
                <Stack spacing={4}>
                    <Heading as="h1" size="xl" textAlign="center" mb={4}>
                        Login
                    </Heading>

                    <form onSubmit={handleSubmit}>
                        <Stack spacing={4}>
                            <FormControl id="username" isRequired>
                                <FormLabel>Username</FormLabel>
                                <Input
                                    name="username"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter your username"
                                />
                            </FormControl>

                            <FormControl id="password" isRequired>
                                <FormLabel>Password</FormLabel>
                                <InputGroup>
                                    <Input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                    />
                                    <InputRightElement width="4.5rem">
                                        <Button
                                            h="1.75rem"
                                            size="sm"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? 'Hide' : 'Show'}
                                        </Button>
                                    </InputRightElement>
                                </InputGroup>
                            </FormControl>

                            <Button
                                type="submit"
                                colorScheme="red"
                                size="lg"
                                isLoading={loading}
                                loadingText="Logging in..."
                                mt={4}
                            >
                                Login
                            </Button>
                        </Stack>
                    </form>

                    <Text mt={4} textAlign="center">
                        Don't have an account yet? Register (Coming Soon)
                    </Text>
                </Stack>
            </Box>
        </Container>
    );
};

export default LoginPage;