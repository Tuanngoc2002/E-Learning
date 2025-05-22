import axios from "axios";

export const getCurrentUser = async (jwt: string) => {
  try {
    const res = await axios.get("http://localhost:1337/api/users/me?populate=*", {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    
    // Log the response to debug
    console.log("Current user response:", res.data);
    
    // Check if the response has the expected structure
    if (!res.data) {
      throw new Error("User data is missing from response");
    }
    
    // Extract user data and ensure it has the required fields
    const userData = res.data;
    
    // If role is not directly on the user object, check if it's in a nested structure
    if (!userData.role) {
      console.log("Role not found directly on user object, checking nested structure");
      
      // Check if role is in a nested structure (common in Strapi responses)
      if (userData.attributes && userData.attributes.role) {
        userData.role = userData.attributes.role;
      } else if (userData.data && userData.data.attributes && userData.data.attributes.role) {
        userData.role = userData.data.attributes.role;
      }
    }
    
    // If we still don't have role information, try to fetch it separately
    if (!userData.role) {
      console.log("Role not found in user data, attempting to fetch role separately");
      try {
        const roleRes = await axios.get("http://localhost:1337/api/users/me?populate=role", {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        
        console.log("Role response:", roleRes.data);
        
        if (roleRes.data && roleRes.data.role) {
          userData.role = roleRes.data.role;
        } else if (roleRes.data && roleRes.data.data && roleRes.data.data.attributes && roleRes.data.data.attributes.role) {
          userData.role = roleRes.data.data.attributes.role;
        }
      } catch (roleError) {
        console.error("Error fetching role separately:", roleError);
      }
    }
    
    // If we still don't have role information, set a default role
    if (!userData.role) {
      console.log("Setting default role as 'user'");
      userData.role = { name: 'user' };
    }
    
    return userData;
  } catch (error: any) {
    console.error("Error fetching current user:", error);
    throw new Error(error?.response?.data?.error?.message || "Failed to fetch user data");
  }
};
