import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getProfile } from "../../redux/slices/profileSlice";
import { Loader } from "lucide-react";
import ErrorComponent from "../../components/common/ErrorComponent";


const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { profile, loading, error } = useSelector((state) => state.profile);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }
  if(error){
    <ErrorComponent message={error} />
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
      <div className="card w-full max-w-md sm:max-w-lg bg-white shadow-lg p-6 rounded-xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-primary mb-4">
          My Profile
        </h1>

        {/* Loading State */}
        {loading ? (
          <p className="text-center text-gray-500">Loading profile...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <>
            {/* Profile Picture */}
            <div className="flex justify-center">
              {profile?.profilePic ? (
                <img
                  src={profile.profilePic}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border border-gray-300 shadow-sm object-cover"
                />
              ) : (
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-24 h-24">
                    <span className="text-3xl">
                      {profile?.user?.fullName?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Information */}
            <div className="mt-4 space-y-2">
              <p className="text-lg font-medium text-gray-700">
                <strong>Name:</strong> {profile?.user?.fullName || "N/A"}
              </p>
              <p className="text-lg font-medium text-gray-700">
                <strong>Email:</strong> {profile?.user?.email || "N/A"}
              </p>
              <p className="text-lg font-medium text-gray-700">
                <strong>Contact:</strong> {profile?.contactNumber || "N/A"}
              </p>
              <p className="text-lg font-medium text-gray-700">
                <strong>Language:</strong> {profile?.languagePreference || "English"}
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => navigate("/profile/update")}
                className="btn btn-primary w-full"
              >
                Update Profile
              </button>

              <button
                onClick={() => navigate(-1)}
                className="btn btn-secondary w-full"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
