import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardHeader from "../../components/DashboardHeader";
import api from "../../state/api";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setMessage("Invalid or missing verification token.");
      setIsError(true);
      setIsLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const response = await api.verifyEmail(token);
        setMessage(response || "Email verified successfully!");
        setIsError(false);
      } catch (err) {
        setMessage(
          err.message === "Invalid verification token"
            ? "Invalid or expired verification token."
            : "Verification failed. Please try again."
        );
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader pageTitle="POS System - Email Verification" />
      <main className="flex-grow flex items-center justify-center p-4 ml-[250px]">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Email Verification
          </h2>
          {isLoading ? (
            <p className="text-gray-600">Verifying your email...</p>
          ) : (
            <>
              <p
                className={`text-lg ${
                  isError ? "text-red-600" : "text-green-600"
                } mb-6`}
              >
                {message}
              </p>
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default VerifyEmail;