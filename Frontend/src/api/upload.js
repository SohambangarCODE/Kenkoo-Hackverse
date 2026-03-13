import axios from "axios";

export const uploadReport = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(
    "https://kenkoo-morpheus.onrender.com/api/upload",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  return res.data;
};
