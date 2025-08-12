import React from "react";

const User = () => {
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="min-h-screen p-8 bg-black text-white">
      <h1 className="text-3xl mb-4">User Profile</h1>

      {user ? (
        <div>
          <img
            src={user.profilePic || "https://via.placeholder.com/150"}
            alt={user.firstName || "User"}
            className="h-32 w-32 rounded-full mb-4 object-cover"
          />
          <p>
            <strong>Name:</strong> {user.firstName} {user.lastName}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Description:</strong> {user.description || "No description"}
          </p>
          {/* Add more user details here */}
        </div>
      ) : (
        <p>User data not found. Please log in.</p>
      )}
    </div>
  );
};

export default User;
