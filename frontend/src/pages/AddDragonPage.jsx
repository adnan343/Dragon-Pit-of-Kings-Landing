import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  Heading,
  useToast,
} from "@chakra-ui/react";

const AddDragonPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    size: "",
    description: "",
  });

  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name ||
      !formData.age ||
      !formData.size ||
      !formData.description
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/dragons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: "Dragon Added",
          description: "Your dragon has been successfully added!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setFormData({
          name: "",
          age: "",
          size: "",
          description: "",
        });
      } else {
        throw new Error("Failed to add dragon");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="600px" mx="auto" p={6}>
      <VStack spacing={4} align="stretch">
        <Heading size="lg" textAlign="center">
          Add a New Dragon
        </Heading>
        <form onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel htmlFor="name">Dragon Name</FormLabel>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter dragon name"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="age">Dragon Age</FormLabel>
            <Input
              id="age"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              placeholder="Enter dragon age"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="size">Dragon Size</FormLabel>
            <Select
              id="size"
              name="size"
              value={formData.size}
              onChange={handleChange}
            >
              <option value="">Select size</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel htmlFor="description">Dragon Description</FormLabel>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your dragon"
              size="sm"
            />
          </FormControl>

          <Button colorScheme="teal" type="submit" mt={4} width="full">
            Add Dragon
          </Button>
        </form>
      </VStack>
    </Box>
  );
};

export default AddDragonPage;
