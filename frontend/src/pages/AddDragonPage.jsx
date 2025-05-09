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
  Image,
  Flex,
  Text,
  Spinner,
  FormHelperText,
} from "@chakra-ui/react";

const AddDragonPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    size: "",
    description: "",
    image: "", // This will store the Cloudinary URL after upload or a directly entered URL
  });

  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Clear the selected file and preview if the user types in the image URL field
    if (name === "image" && file) {
      setFile(null);
      setPreviewUrl(null);
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      setFile(selectedFile);
      // Clear the image URL input field if a file is selected
      setFormData((prevData) => ({
        ...prevData,
        image: "",
      }));

      // Create preview URL for the image
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result);
      };
      fileReader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const uploadToCloudinary = async () => {
    if (!file) return null;

    setIsUploading(true);

    const cloudinaryCloudName = "dwz4xjrqe"; // Replace with your actual Cloudinary cloud name
    const cloudinaryUploadPreset = "default"; // Replace with your actual unsigned upload preset

    // *** IMPORTANT ***
    // Ensure you have an *unsigned* upload preset configured in your Cloudinary dashboard.
    // The preset name used here ("ml_default" or your chosen name) must match.
    // Unsigned uploads are required for direct client-side uploads like this without a backend signature.
    // Go to Cloudinary Dashboard -> Settings -> Upload -> Upload presets and create/configure one.

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", cloudinaryUploadPreset);
      // Cloud name is typically part of the URL for unsigned uploads,
      // but including it in FormData is also common and doesn't hurt.
      // formData.append("cloud_name", cloudinaryCloudName); // Often not strictly needed for unsigned via URL

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.secure_url) {
          return data.secure_url;
        } else {
          // If response is OK but no secure_url, something is unexpected
          throw new Error(
            "Cloudinary upload successful but no secure_url found."
          );
        }
      } else {
        // If response is not OK, read the error from the response body
        const errorData =
          data?.error?.message || "Unknown Cloudinary upload error";
        throw new Error(`Cloudinary upload failed: ${errorData}`);
      }
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message, // Show the specific error message
        status: "error",
        duration: 5000, // Increased duration to read the error
        isClosable: true,
      });
      return null;
    } finally {
      setIsUploading(false);
    }
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
        description: "Please fill in all required fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Determine the image URL to submit
    let imageUrl = formData.image; // Start with the URL from the input field

    try {
      // If a file was selected, upload it to Cloudinary first
      if (file) {
        imageUrl = await uploadToCloudinary();
        // If upload failed, imageUrl will be null, stop the submission
        if (!imageUrl) {
          return;
        }
      } else if (!formData.image) {
        // If no file is selected AND the image URL field is empty,
        // you might want to handle this case (e.g., allow no image or require one)
        // For now, we'll proceed without an image URL if neither is provided.
        console.log("No image file selected and no image URL provided.");
      }

      // Prepare data for API submission
      const dragonData = {
        ...formData,
        image: imageUrl || "", // Use the uploaded URL or the input URL, default to empty string if neither
      };

      // Submit data to API
      // console.log("Submitting dragon data:", dragonData); // Log data being sent
      const response = await fetch("http://localhost:3000/api/dragons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dragonData),
      });

      if (response.ok) {
        toast({
          title: "Dragon Added",
          description: "Your dragon has been successfully added!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Reset form
        setFormData({
          name: "",
          age: "",
          size: "",
          description: "",
          image: "",
        });
        setFile(null);
        setPreviewUrl(null);
      } else {
        const errorData = await response.json();
        const errorMessage = errorData?.message || "Failed to add dragon";
        throw new Error(errorMessage);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000, // Increased duration for error messages
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
          <FormControl isRequired mb={4}>
            <FormLabel htmlFor="name">Dragon Name</FormLabel>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter dragon name"
            />
          </FormControl>

          <FormControl isRequired mb={4}>
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

          <FormControl isRequired mb={4}>
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

          <FormControl isRequired mb={4}>
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

          {/* Image Upload Field */}
          <FormControl mb={4}>
            <FormLabel htmlFor="dragonImage">Dragon Image File</FormLabel>
            <Input
              id="dragonImage"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              p={1}
              // Disable if a URL is already entered
              isDisabled={!!formData.image}
            />
            <FormHelperText>Upload an image of your dragon</FormHelperText>
          </FormControl>

          {/* Image preview */}
          {previewUrl && (
            <Box mb={4}>
              <Text mb={2} fontWeight="medium">
                Preview:
              </Text>
              <Image
                src={previewUrl}
                alt="Dragon preview"
                maxH="200px"
                borderRadius="md"
              />
            </Box>
          )}

          <Button
            colorScheme="teal"
            type="submit"
            mt={4}
            width="full"
            isLoading={isUploading} // Use isUploading for button loading state
            loadingText="Uploading Image..." // Text while image is uploading
          >
            Add Dragon
          </Button>
        </form>
      </VStack>
    </Box>
  );
};

export default AddDragonPage;
