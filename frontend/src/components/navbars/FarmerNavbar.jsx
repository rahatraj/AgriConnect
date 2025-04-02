import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import BaseNavbar from './BaseNavbar';
import { userLogout } from '../../redux/slices/userSlice';
import { 
    ShoppingBag, Wallet, User, 
    Gavel, ClipboardList, Store, 
    Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FarmerNavbar() {
    const dispatch = useDispatch();
    const { data } = useSelector((state) => state.users);

    const links = [
        { label: "Dashboard", path: "/farmer/dashboard", icon: <ShoppingBag size={18} /> },
        { label: "My Products", path: "/farmer/products", icon: <ClipboardList size={18} /> },
        { label: "My Bids", path: "/ongoing-bids", icon: <Gavel size={18} /> },
        { label: "Wallet", path: "/wallet", icon: <Wallet size={18} /> },
        { label: "Profile", path: "/profile", icon: <User size={18} /> },
    ];

    const storageLinks = [
        { label: "Book Storage", path: "/book-storage", icon: <Store size={18} /> },
        { label: "My Storage Bookings", path: "/my-storage-bookings", icon: <ClipboardList size={18} /> }
    ];

    return (
        <>
        
            <BaseNavbar 
                links={links} 
                user={data?.user} 
                onLogout={() => dispatch(userLogout())} 
                dropdowns={[
                    // { label: "Bidding", icon: <Gavel size={18} />, links: biddingLinks },
                    { label: "Storage", icon: <Store size={18} />, links: storageLinks }
                ]}
            />
        </>
    );
}
