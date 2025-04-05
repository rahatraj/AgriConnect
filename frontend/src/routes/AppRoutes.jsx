import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Route,Routes,Navigate } from 'react-router-dom'
import Home from '../pages/Home.jsx'
import Register from '../pages/auth/Register.jsx'
import Login from '../pages/auth/Login.jsx'
import FarmerDashboard from '../pages/dashboards/FarmerDashboard.jsx'
import BuyerDashboard from '../pages/dashboards/BuyerDashboard.jsx'
import StorageOwnerDashboard from '../pages/dashboards/StorageOwnerDashboard.jsx'
import ProtectedRoute from './ProtectedRoutes.jsx'
import ProductsPage from '../pages/farmer/ProudctsPage.jsx'
import CreateProducts from '../components/forms/CreateProducts.jsx'
import StartBiddingForm from '../components/forms/StartBiddingForm.jsx'
import BiddingPage from '../pages/farmer/BiddingPage.jsx'
import WalletPage from '../pages/Wallet/WalletPage.jsx'
import AddFundsPage from '../pages/Wallet/AddFundsPage.jsx'
import TransactionHistory from '../pages/Wallet/TransactionHistory.jsx'
import FundTransfer from '../pages/Wallet/FundTransfer.jsx'
import ProfilePage from '../pages/Profile/ProfilePage.jsx'
import ProfileUpdatePage from '../pages/Profile/ProfileUpdatePage.jsx'
import Settings from '../pages/Settings.jsx'
import ProductViewDetails from '../pages/farmer/ProductViewDetails.jsx'
import ViewDetailsPage from '../pages/BidViewDetailsPage.jsx'
import LiveBiddingPage from '../pages/LiveBiddingPage.jsx'
import AllBidsPage from '../pages/Buyer/AllBidsPage.jsx'
import MyBiddingHistory from '../pages/Buyer/MyBiddingHistory.jsx'
import AdminDashboard from '../pages/admin/AdminDashboard.jsx'
import ManageUsers from '../pages/admin/ManageUsers.jsx'
import ManageTransactions from '../pages/admin/ManageTransactions.jsx'
import BookStorage from '../pages/farmer/BookStorage.jsx'
import MyStorage from '../pages/farmer/MyStorage.jsx'
import StorageBooking from '../pages/Buyer/StorageBooking.jsx'
import Payout from '../pages/admin/Payout.jsx'


function AppRoutes() {
    const { isLoggedIn,data } = useSelector((state)=> state.users)
    const userRole = data?.user?.role;

  return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Login based routes and for every roles */}

                <>
                    {/* wallet related route */}
                    <Route 
                        path='/wallet' 
                        element={
                            <ProtectedRoute allowedRoles={["Farmer", "Buyer", "StorageOwner", "Admin"]}>
                                <WalletPage />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path='/wallet/add-funds' 
                        element={
                            <ProtectedRoute allowedRoles={["Farmer", "Buyer", "StorageOwner", "Admin"]}>
                                <AddFundsPage />
                            </ProtectedRoute>
                        }     
                    />
                    <Route 
                        path='/wallet/getfullhistory' 
                        element={
                            <ProtectedRoute allowedRoles={["Farmer", "Buyer", "StorageOwner", "Admin"]}>
                                <TransactionHistory />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path='/wallet/fundtransfer' 
                        element={
                            <ProtectedRoute allowedRoles={["Farmer", "Buyer", "StorageOwner","Admin"]}>
                                <FundTransfer />
                            </ProtectedRoute>   
                        }
                    />

                    {/* profile related route */}
                    <Route 
                        path='/profile' 
                        element={
                            <ProtectedRoute allowedRoles={["Farmer", "Buyer", "StorageOwner","Admin"]}>
                                <ProfilePage />
                            </ProtectedRoute>     
                        }    
                    />
                    <Route
                        path='/profile/update'
                        element={
                            <ProtectedRoute allowedRoles={["Farmer", "Buyer", "StorageOwner","Admin"]}>
                                <ProfileUpdatePage />
                            </ProtectedRoute>
                        }
                    />
                </>
            
            

            {/* Role-Based Protected Routes */}
                <>
                    <Route 
                        path="/farmer/dashboard" 
                        element={
                            <ProtectedRoute allowedRoles={["Farmer"]}>
                                <FarmerDashboard />
                            </ProtectedRoute>
                        } 
                    />

                    <Route 
                        path="/farmer/products" 
                        element={
                            <ProtectedRoute allowedRoles={["Farmer"]}>
                                <ProductsPage />
                            </ProtectedRoute> 
                        }
                    /> 
                    <Route 
                        path='/create-product'
                        element={
                            <ProtectedRoute allowedRoles={["Farmer"]}>
                                <CreateProducts />
                            </ProtectedRoute>
                        }
                    /> 
                    <Route 
                        path='/product-details/:productId'
                        element={
                            <ProtectedRoute allowedRoles={["Farmer"]}>
                                <ProductViewDetails />
                            </ProtectedRoute>
                        }
                    /> 
                    <Route
                        path='/start-bidding/:productId'
                        element={
                            <ProtectedRoute allowedRoles={["Farmer"]}>
                                <StartBiddingForm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path='/ongoing-bids'
                        element={
                            <ProtectedRoute allowedRoles={["Farmer"]}>
                                <BiddingPage />
                            </ProtectedRoute>
                        }
                    
                    />
                    <Route
                        path='/book-storage'
                        element={
                            <ProtectedRoute allowedRoles={["Farmer"]}>
                                <BookStorage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path='/my-storage-bookings'
                        element={
                            <ProtectedRoute allowedRoles={["Farmer"]}>
                                <MyStorage />
                            </ProtectedRoute>
                        }
                    />

                </>
                
                {/* bidding page view and live bidding share able component for both farmer and buyer */}
                <>
                    <Route
                        path='/bid/check-live/:bidId'
                        element={
                            <ProtectedRoute allowedRoles={["Farmer", "Buyer"]}>
                                <LiveBiddingPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route 
                        path='/bid-details/:bidId'
                        element={
                            <ProtectedRoute allowedRoles={["Farmer", "Buyer"]}>
                                <ViewDetailsPage />
                            </ProtectedRoute>
                        }
                    />
                </>
                <>
                    <Route path="/buyer-dashboard" element={
                        <ProtectedRoute allowedRoles={["Buyer"]}>
                            <BuyerDashboard />
                        </ProtectedRoute>
                    } />
                    <Route 
                        path='/bid-products'
                        element={
                            <ProtectedRoute allowedRoles={["Buyer"]}>
                                <AllBidsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path='/bid-history'
                        element={
                            <ProtectedRoute allowedRoles={["Buyer"]}>
                                <MyBiddingHistory />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path='/storage-booking'
                        element={
                            <ProtectedRoute allowedRoles={["Buyer"]}>
                                <StorageBooking />
                            </ProtectedRoute>
                        }
                    />
                </>

                
 

                <Route path="/storage-dashboard" element={
                    <ProtectedRoute allowedRoles={["StorageOwner"]}>
                        <StorageOwnerDashboard />
                    </ProtectedRoute>
                } />


                <>
                    <Route path="/admin-dashboard" element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <AdminDashboard />
                        </ProtectedRoute>
                        } 
                    />
                    <Route path='/manage-users' element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <ManageUsers />
                        </ProtectedRoute>
                    }
                        
                    />

                    <Route path='/manage-transactions' element={
                        <ProtectedRoute allowedRoles={["Admin"]}>
                            <ManageTransactions />
                        </ProtectedRoute>
                    }
                        
                    />

                    <Route 
                        path="/payout"
                        element={
                            <ProtectedRoute allowedRoles={["Admin"]}>
                                <Payout />
                            </ProtectedRoute>
                        }
                    />
                </>
                

        </Routes>
  )
}

export default AppRoutes