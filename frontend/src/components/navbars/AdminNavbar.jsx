import React from "react";
import { useDispatch, useSelector } from "react-redux";
import BaseNavbar from "./BaseNavbar";
import { userLogout } from "../../redux/slices/userSlice";
import { 
    LayoutDashboard, Users, FileText, Wallet, 
    Banknote
} from "lucide-react";

function AdminNavbar() {
    const dispatch = useDispatch();
    const { data } = useSelector((state) => state.users);

    const links = [
        { label: "Dashboard", path: "/admin-dashboard", icon: <LayoutDashboard size={18} /> },
        { label: "Manage Users", path: "/manage-users", icon: <Users size={18} /> },
        { label: "Manage Transactions", path: "/manage-transactions", icon: <FileText size={18} /> },
        { label: "Wallet", path: "/wallet", icon: <Wallet size={18} /> },
        { label: "Payout", path: "/payout", icon: <Banknote size={18} /> },
    ];

    return (
        <BaseNavbar 
            links={links} 
            user={data?.user} 
            onLogout={() => dispatch(userLogout())} 
        />
    );
}

export default AdminNavbar;
