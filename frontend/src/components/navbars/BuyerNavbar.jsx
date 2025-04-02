import React from "react";
import { useDispatch, useSelector } from "react-redux";
import BaseNavbar from "./BaseNavbar";
import { userLogout } from "../../redux/slices/userSlice";
import { 
    ShoppingBag, Wallet, Bell, User, Gavel, 
    ClipboardList, Store, 
    icons
} from "lucide-react";
import { Link } from "react-router-dom";

function BuyerNavbar() {
    const dispatch = useDispatch();
    const { data } = useSelector((state) => state.users);

    const links = [
        { label: "Dashboard", path: "/buyer-dashboard", icon: <ShoppingBag size={18} /> },
        { label: "Browse Products", path: "/bid-products", icon: <ClipboardList size={18} /> },
        { label: "Bid History", path: "/bid-history", icon: <ClipboardList size={18} /> },
        { label: "Wallet", path: "/wallet", icon: <Wallet size={18} /> },
        { label: "Profile", path: "/profile", icon: <User size={18} /> },
        {label : "Storage Booking", path : "/storage-booking", icon : <Store size={18}/>},
    ];

    return (
        <>
            <BaseNavbar 
                links={links} 
                user={data?.user} 
                onLogout={() => dispatch(userLogout())} 
            />
        </>
    );
}

export default BuyerNavbar;
