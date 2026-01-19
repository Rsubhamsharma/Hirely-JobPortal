import { useAuth } from "../context/AuthContext";
import UserDashboard from "../pages/userEmployee/UserDashboard";
import RecruiterDashboard from "../pages/userEmployee/RecruiterDashboard";
import { useNavigate } from "react-router-dom";

function ProfileRouter() {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) return navigate("/login");

    if (user.role === "recruiter") {
        return <RecruiterDashboard />;
    }

    return <UserDashboard />;
}

export default ProfileRouter;
