import React, { useEffect } from "react";
import {
  Box,
  Button,
  Card,
  FileInput,
  TextInput,
  Textarea,
  Title,
  ActionIcon,
  Text,
  Select,
  Group,
} from "@mantine/core";
import { Upload, FloppyDisk, Trash } from "@phosphor-icons/react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import axios from "axios";

axios.defaults.withCredentials = true;
// eslint-disable-next-line no-unused-vars
export default function Compose() {
  const [file, setFile] = React.useState(null);
  const [receiver_username, setReceiverUsername] = React.useState("");
  const [receiver_designation, setReceiverDesignation] = React.useState("");
  const [receiver_designations, setReceiverDesignations] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [description, setDescription] = React.useState("");
  const token = localStorage.getItem("authToken");
  const roles = useSelector((state) => state.user.roles);
  let module = useSelector((state) => state.module.current_module);
  module = module.split(" ").join("").toLowerCase();
  const uploaderRole = useSelector((state) => state.user.role);
  const [designation, setDesignation] = React.useState(uploaderRole);
  const options = roles.map((role) => ({ value: role, label: role }));
  const receiverRoles = Array.isArray(receiver_designations)
    ? receiver_designations.map((role) => ({
        value: role,
        label: role,
      }))
    : [];

  const handleFileChange = (uploadedFile) => {
    setFile(uploadedFile);
  };
  const removeFile = () => {
    setFile(null);
  };
  const postSubmit = () => {
    removeFile();
    setDesignation("");
    setReceiverDesignation("");
    setReceiverDesignations("");
    setReceiverUsername("");
    setSubject("");
    setDescription("");
  };
  useEffect(() => {
    setDesignation(roles);
    console.log(receiverRoles);
  }, [roles, receiverRoles]);
  const fetchRoles = async () => {
    const response = await axios.get(
      `http://localhost:8000/filetracking/api/designations/${receiver_username}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      },
    );
    setReceiverDesignations(response.data.designations);
  };

  const handleSaveDraft = async () => {
    // const response = await axios.post(
    //   "http://localhost:8000/filetracking/api/createdraft/",
    //   {
    //     designation: uploaderRole,
    //     src_module: module,
    //     file,
    //   },
    //   {
    //     headers: {
    //       Authorization: `Token ${token}`,
    //     },
    //   },
    // );
    notifications.show({
      title: "Draft saved successfully",
      message: "The draft has been saved successfully.",
      color: "green",
      position: "top-center",
    });
    postSubmit();
  };
  const handleCreateFile = async () => {
    if (!file) {
      notifications.show({
        title: "Error",
        message: "Please upload a file",
        color: "red",
        position: "top-center",
      });
      // eslint-disable-next-line no-useless-return
      return;
    }

    try {
      const fileAttachment =
        file.upload_file instanceof File
          ? file.upload_file
          : new File([file.upload_file], "uploaded_file", {
              type: "application/octet-stream",
            });
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("description", description);
      formData.append("designation", designation);
      formData.append("receiver_username", receiver_username);
      formData.append("receiver_designation", receiver_designation);
      formData.append("file", fileAttachment); // Ensure this is the file object
      formData.append("src_module", module);
      const response = await axios.post(
        "http://localhost:8000/filetracking/api/file/",
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        },
      );
      if (response.status === 201) {
        notifications.show({
          title: "File sent successfully",
          message: "The file has been sent successfully.",
          color: "green",
          position: "top-center",
        });
        // postSubmit();
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{ backgroundColor: "#F5F7F8", position: "relative" }}
    >
      {/* Icon at Top Right with Text Beneath */}
      <Box
        style={{
          position: "absolute",
          top: "16px",
          right: "16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <ActionIcon
          size="lg"
          variant="outline"
          color="blue"
          onClick={() => handleSaveDraft()}
          title="Save as Draft"
        >
          <FloppyDisk size={20} />
        </ActionIcon>
        <Text color="blue" size="xs" mt={4}>
          Save as Draft
        </Text>
      </Box>

      <Title order={2} mb="md">
        Compose File
      </Title>
      <Box
        component="form"
        onSubmit={(e) => e.preventDefault()}
        style={{
          backgroundColor: "#F5F7F8",
          padding: "16px",
        }}
      >
        <TextInput
          label="Title of File"
          placeholder="Enter file title"
          mb="sm"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />
        <Textarea
          label="Description"
          placeholder="Enter description"
          mb="sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <Select
          label="Designation"
          placeholder="Sender's Designation"
          value={designation}
          data={options}
          mb="sm"
          onChange={(value) => setDesignation(value)}
        />
        <FileInput
          label="Attach file (PDF, JPG, PNG) (MAX: 10MB)"
          placeholder="Upload file"
          accept="application/pdf,image/jpeg,image/png"
          icon={<Upload size={16} />}
          value={file} // Set the file state as the value
          onChange={handleFileChange} // Update file state on change
          mb="sm"
          withAsterisk
        />
        {file && (
          <Group position="apart" mt="sm">
            <Text>{file.name}</Text>
            <Button
              leftIcon={<Trash size={16} />}
              color="red"
              onClick={removeFile}
              compact
            >
              Remove File
            </Button>
          </Group>
        )}
        <TextInput
          label="Forward To"
          placeholder="Enter forward recipient"
          value={receiver_username}
          onChange={(e) => {
            setReceiverDesignation("");
            setReceiverUsername(e.target.value);
          }}
          mb="sm"
        />
        {/* Receiver Designation as a dropdown */}
        <Select
          label="Receiver Designation"
          placeholder="Select designation"
          onClick={() => fetchRoles()}
          value={receiver_designation}
          data={receiverRoles}
          mb="sm"
          onChange={(value) => setReceiverDesignation(value)}
        />

        <Button
          type="submit"
          color="blue"
          style={{
            display: "block",
            margin: "0 auto",
            width: "200px",
          }}
          onClick={handleCreateFile}
        >
          Submit
        </Button>
      </Box>
    </Card>
  );
}
