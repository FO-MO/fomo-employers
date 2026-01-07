"use client";
import axios from "axios";
import { getAuthTokenCookie } from "./cookies";

//JSON---->
export async function fetchFromBackend(
  endpoint: string,
  {
    backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL,
    token = getAuthTokenCookie(),
    options = {},
  }: {
    backendUrl?: string;
    token?: string | null;
    options?: Record<string, unknown>;
  } = {}
) {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {}),
      },
      ...options,
    };

    const response = await axios.get(`${backendUrl}/api/${endpoint}`, config);

    console.log(`Fetched ${endpoint}:`, response.data.data);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// POST request function for Strapi backend
export async function postFetchFromBackend(
  endpoint: string,
  payload: Record<string, unknown>,
  {
    backendUrl = process.env.NEXT_PUBLIC_STRAPI_URL,
    token = getAuthTokenCookie(),
  }: {
    backendUrl?: string;
    token?: string | null;
  } = {}
) {
  try {
    console.log(`🚀 POST to ${endpoint}:`, payload);

    const response = await axios.post(
      `${backendUrl}/api/${endpoint}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`📡 Response from ${endpoint}:`, response.data);
    console.log(`✅ Successfully posted to ${endpoint}:`, response.data.data);
    return response.data; // Return full response for POST requests
  } catch (error) {
    console.error(`💥 Error posting to ${endpoint}:`, error);
    throw error;
  }
}

// DELETE request for college job application...
export async function deletecollegejobposting(id: string) {
  const token = getAuthTokenCookie();
  try {
    const response = await axios.delete(
      `${backendurl}/collegejobpostings/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Deleted:", response.data);
  } catch (err) {
    console.log(err);
  }
}

// DELETE request for global job application..
export async function deleteglobaljobposting(id: string) {
  const token = getAuthTokenCookie();

  // Try both possible endpoints
  const endpoints = [`${backendurl}/api/globaljobpostings/${id}`];

  for (const endpoint of endpoints) {
    try {
      console.log("Attempting to delete global job posting with ID:", id);
      console.log("Using URL:", endpoint);
      console.log("Token exists:", token ? "yes" : "no");

      const response = await axios.delete(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Delete response:", response.data);
      return response.data;
    } catch (err) {
      console.log(`Failed with endpoint ${endpoint}:`, err);
      if (axios.isAxiosError(err)) {
        console.log("Status:", err.response?.status);
        console.log("Response data:", err.response?.data);
      }

      // If this is the last endpoint, throw the error
      if (endpoint === endpoints[endpoints.length - 1]) {
        throw err;
      }
    }
  }
}

//PUT request for global job application..
export async function putglobaljobposting(
  id: string,
  payload: Record<string, unknown>
) {
  const token = getAuthTokenCookie();
  try {
    console.log(`🔄 PUT to globaljobpostings/${id}:`, payload);

    const response = await axios.put(
      `${backendurl}/api/globaljobpostings/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`📡 PUT Response:`, response.data);
    return response.data;
  } catch (err) {
    console.error("Error updating global job posting:", err);
    if (axios.isAxiosError(err)) {
      console.log("Status:", err.response?.status);
      console.log("Response data:", err.response?.data);
    }
    throw err;
  }
}

export const backendurl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://tbs9k5m4-1337.inc1.devtunnels.ms";
