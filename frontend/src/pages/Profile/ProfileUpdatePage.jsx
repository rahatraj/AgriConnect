import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
// import { updateProfile, getProfile } from "../../redux/slices/profileSlice";
import toast from "react-hot-toast";
import { getProfile, updateProfile } from "../../redux/slices/profileSlice";
import { Loader } from "lucide-react";
import ErrorComponent from "../../components/common/ErrorComponent";

const ProfileUpdatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading, error } = useSelector((state) => state.profile);
  const [showError, setShowError] = useState(true);

  // Local state for form fields
  const [formData, setFormData] = useState({
    contactNumber: "",
    languagePreference: "English",
    profilePic: null,
  });

  const [previewImage, setPreviewImage] = useState(null);

  // Load existing profile data
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setFormData({
        contactNumber: profile?.contactNumber || "",
        languagePreference: profile?.languagePreference || "English",
        profilePic: profile?.profilePic || null,
      });
      setPreviewImage(profile?.profilePic || null);
    }
  }, [profile]);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePic: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle Profile Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.contactNumber) {
      toast.error("Contact number is required.");
      return;
    }

    const updateData = new FormData();
    updateData.append("contactNumber", formData.contactNumber);
    updateData.append("languagePreference", formData.languagePreference);
    if (formData.profilePic instanceof File) {
      updateData.append("profilePic", formData.profilePic);
    }

    const resultAction = await dispatch(updateProfile(updateData));
    if (updateProfile.fulfilled.match(resultAction)) {
      toast.success("Profile updated successfully!");
      navigate("/profile");
    } else {
      toast.error(resultAction.payload || "Profile update failed.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  if (error && showError) {
    return <ErrorComponent message={error} onDismiss={() => setShowError(false)} />;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
      <div className="card w-full max-w-md sm:max-w-lg bg-white shadow-lg p-6 rounded-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-4">
          Edit Profile
        </h1>

        {/* Loading and Error Messages */}
        {loading && <p className="text-center text-gray-500">Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div className="flex flex-col items-center">
            <label className="label">Profile Picture</label>
            <input type="file" accept="image/*" className="file-input file-input-bordered w-full" onChange={handleImageUpload} />
            {previewImage && <img src={previewImage} alt="Preview" className="w-20 h-20 object-cover rounded-full mt-2" />}
          </div>

          {/* Contact Number */}
          <div>
            <label className="label">Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              pattern="[0-9]{10}"
              maxLength="10"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="Enter your contact number"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Language Preference */}
          <div>
            <label className="label">Language Preference</label>
            <select
              name="languagePreference"
              value={formData.languagePreference}
              onChange={handleChange}
              className="select select-bordered w-full"
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Bengali">Bengali</option>
              <option value="Marathi">Marathi</option>
            </select>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-full">
            {loading ? "Updating..." : "Update Profile"}
          </button>

          {/* Back Button */}
          <button type="button" className="btn btn-secondary w-full" onClick={() => navigate("/profile")}>
            Back
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdatePage;
