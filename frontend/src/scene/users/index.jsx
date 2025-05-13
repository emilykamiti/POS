import React from "react";
import { useGetUsersQuery } from "../../state/api"; // Adjust path based on your project structure
import Header from "../../components/Header"; // Adjust path

const User = ({ id, name, username, email, roles, isVerified }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{name}</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Username: {username}</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Email: {email}</p>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
          Verified: {isVerified ? "Yes" : "No"}
        </p>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">
          Roles: {roles?.map((role) => role.name).join(", ") || "N/A"}
        </p>
      </div>
    </div>
  );
};

const Users = () => {
  const { data, isLoading } = useGetUsersQuery();
  const { mode } = useSelector((state) => state.global); // Access theme mode

  return (
    <div className={`p-6 min-h-screen ${mode === "dark" ? "dark" : ""} bg-gray-100 dark:bg-gray-900`}>
      <div className="max-w-7xl mx-auto">
        <Header title="USERS" subtitle="List of all users" />
        {isLoading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Loading...</p>
        ) : data?.length > 0 ? (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.map((user) => (
              <User
                key={user.id}
                id={user.id}
                name={user.name}
                username={user.username}
                email={user.email}
                roles={user.roles}
                isVerified={user.isVerified}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default Users;
