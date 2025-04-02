import React from 'react';
import { useSelector } from 'react-redux';
import FarmerNavbar from './FarmerNavbar';
import BuyerNavbar from './BuyerNavbar';
import StorageOwnerNavbar from './StorageOwnerNavbar';
import AdminNavbar from './AdminNavbar';
import GuestNavbar from './GuestNavbar';


function Navbar() {
    const { isLoggedIn, data } = useSelector((state) => state.users);
    const role = data?.user?.role;
    
    if(!isLoggedIn) return <GuestNavbar/>
    if(role === "Farmer") return <FarmerNavbar />
    if(role === "Buyer") return <BuyerNavbar />
    if(role === "StorageOwner") return <StorageOwnerNavbar/>
    if(role === "Admin") return <AdminNavbar />
    
    return <GuestNavbar />
 }

export default Navbar;
