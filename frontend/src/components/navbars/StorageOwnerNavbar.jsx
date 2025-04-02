import React from "react";
import { useDispatch, useSelector } from "react-redux";
import BaseNavbar from "./BaseNavbar";
import { userLogout } from "../../redux/slices/userSlice";
import { 
    ShoppingBag, Warehouse, ClipboardList, Wallet, 
    User 
} from "lucide-react";

function StorageOwnerNavbar() {
    const dispatch = useDispatch();
    const { data } = useSelector((state) => state.users);

    const links = [
        { label: "Dashboard", path: "/storage-dashboard", icon: <ShoppingBag size={18} /> },
        { label: "Manage Storage", path: "/manage-storage", icon: <Warehouse size={18} /> },
        { label: "Bookings", path: "/bookings", icon: <ClipboardList size={18} /> },
        { label: "Wallet", path: "/wallet", icon: <Wallet size={18} /> },
        { label: "Profile", path: "/profile", icon: <User size={18} /> }
    ];

    return (
        <BaseNavbar 
            links={links} 
            user={data?.user} 
            onLogout={() => dispatch(userLogout())} 
        />
    );
}

export default StorageOwnerNavbar;
