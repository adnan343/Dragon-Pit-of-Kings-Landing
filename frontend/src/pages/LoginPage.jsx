import { useState } from "react";
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
  InputRightElement,
  Select,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    userType: "", // Added for signup
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false); // Toggle between Login and Signup
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for missing fields in the form
    if (
      !formData.username ||
      !formData.password ||
      (isSignup && !formData.name) ||
      (isSignup && !formData.userType)
    ) {
      toast({
        title: "Missing fields",
        description: "Please fill in all the fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      let url = "/api/users/login"; // Default URL for login
      let method = "POST";
      let body = JSON.stringify(formData);

      // If the user is signing up, change the URL and method
      if (isSignup) {
        url = "/api/users"; // Signup URL
        method = "POST";
        body = JSON.stringify(formData); // Send the signup data
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || "Request failed");
      }

      if (isSignup) {
        // After signup, automatically log in the user
        login(data.data); // Assuming the response returns the user data
        toast({
          title: "Signup successful",
          description: "Welcome aboard!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/"); // Redirect to home or dashboard
      } else {
        login(data.data); // Update the global auth state for login
        toast({
          title: "Login successful",
          description: "Welcome back!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/"); // Redirect to home or dashboard
      }
    } catch (error) {
      toast({
        title: isSignup ? "Signup failed" : "Login failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <Box p={8} borderWidth={1} borderRadius="lg" boxShadow="lg">
        <Stack spacing={4}>
          <Heading as="h1" size="xl" textAlign="center" mb={4}>
            {isSignup ? "Sign Up" : "Login"}
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
                    type={showPassword ? "text" : "password"}
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
                      {showPassword ? "Hide" : "Show"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
              </FormControl>

              {/* Only show this if user is signing up */}
              {isSignup && (
                <>
                  <FormControl id="name" isRequired>
                    <FormLabel>Full Name</FormLabel>
                    <Input
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </FormControl>

                  <FormControl id="userType" isRequired>
                    <FormLabel>User Type</FormLabel>
                    <Select
                      name="userType"
                      value={formData.userType}
                      onChange={handleChange}
                      placeholder="Select user type"
                    >
                      <option value="Dragon Rider">Dragon Rider</option>
                      <option value="Dragon Keeper">Dragon Keeper</option>
                    </Select>
                  </FormControl>
                </>
              )}

              <Button
                type="submit"
                colorScheme="red"
                size="lg"
                isLoading={loading}
                loadingText={isSignup ? "Signing up..." : "Logging in..."}
                mt={4}
              >
                {isSignup ? "Sign Up" : "Login"}
              </Button>
            </Stack>
          </form>

          <Text mt={4} textAlign="center">
            {isSignup ? (
              <>
                Already have an account?{" "}
                <Button
                  variant="link"
                  colorScheme="teal"
                  onClick={() => setIsSignup(false)}
                >
                  Login
                </Button>
              </>
            ) : (
              <>
                Don't have an account yet?{" "}
                <Button
                  variant="link"
                  colorScheme="teal"
                  onClick={() => setIsSignup(true)}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Text>
        </Stack>
      </Box>
    </Container>
  );
};

export default LoginPage;
