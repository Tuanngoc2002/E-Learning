import axios from "axios";
import { determineUserRole, createRoleObject } from "@/lib/auth-utils";

export const getCurrentUser = async (jwt: string) => {
  try {
    // First, get the basic user data
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    
    console.log("Current user response:", res.data);
    
    if (!res.data) {
      throw new Error("User data is missing from response");
    }
    
    const userData = res.data;
    
    // For Strapi users-permissions, role is usually at userData.role but may not be populated
    // Let's first check if role exists and has the right structure
    if (userData.role && userData.role.id) {
      console.log("User role found directly:", userData.role);
      return userData;
    }
    
    // If role is not populated, we need to get the user's role ID from the JWT or fetch it separately
    console.log("Role not found directly, fetching user's role...");
    
    try {
      // Try to get user role by fetching from users endpoint with populate
      const userWithRoleRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userData.id}?populate=role`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });
      
      console.log("User with role response:", userWithRoleRes.data);
      
      if (userWithRoleRes.data && userWithRoleRes.data.role) {
        userData.role = userWithRoleRes.data.role;
        return userData;
      }
    } catch (userError) {
      console.warn("Could not fetch user with role:", userError);
    }
    
    // If we still don't have role, try to get all roles and determine user's role
    try {
      console.log("Attempting to fetch roles and determine user role...");
      
      // Get all roles
      const rolesRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/users-permissions/roles`);
      console.log("Available roles:", rolesRes.data);
      
      if (rolesRes.data && rolesRes.data.roles) {
        // Use utility function to determine role type
        const roleType = determineUserRole(userData);
        
        // Find matching role from available roles
        const matchedRole = rolesRes.data.roles.find((role: any) => role.type === roleType);
        
        if (matchedRole) {
          userData.role = matchedRole;
          console.log("Assigned role based on user pattern:", matchedRole);
          return userData;
        }
        
        // Last resort: assign first available role
        if (rolesRes.data.roles.length > 0) {
          userData.role = rolesRes.data.roles[0];
          console.log("Assigned first available role:", rolesRes.data.roles[0]);
        }
      }
    } catch (rolesError) {
      console.error("Error fetching roles:", rolesError);
    }
    
    // Final fallback - create a default role object based on user info
    if (!userData.role) {
      console.log("Creating fallback role based on user info");
      const roleType = determineUserRole(userData);
      userData.role = createRoleObject(roleType);
      console.log("Created fallback role:", userData.role);
    }
    
    return userData;
  } catch (error: any) {
    console.error("Error fetching current user:", error);
    throw new Error(error?.response?.data?.error?.message || "Failed to fetch user data");
  }
};
