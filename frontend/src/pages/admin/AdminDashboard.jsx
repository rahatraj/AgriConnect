import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Users, 
  Package, 
  Gavel, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Clock,
  Settings,
  Loader
} from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import { fetchAllDetails } from '../../redux/slices/adminSlice';
import { Link } from 'react-router-dom';
import ErrorComponent from '../../components/common/ErrorComponent';

function AdminDashboard() {
  const dispatch = useDispatch()
  const { allDetails, loading, error } = useSelector((state)=> state.admin)
  const { notifications } = useSelector((state)=> state.notifications.notifications)

  // Mock data for demonstration
  useEffect(() => {
     dispatch(fetchAllDetails())
  }, [dispatch]);

  useEffect(() => {
    if (notifications?.length > 0) {
      toast.success(notifications[0]?.message);
    }
  }, [notifications])

  const dashboardData = useMemo(()=> ({
      totalUsers : allDetails?.data?.totalUser || 0,
      totalBids : allDetails?.data?.totalBids || 0,
      totalProducts : allDetails?.data?.totalProducts || 0,
      completedTransactions : allDetails?.data?.completedTransactions || 0,
      pendingVerifications : 5,
      systemHealth : "Healthy"
  }), [allDetails])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <ErrorComponent message={error}/>;
  }
  return (
    <div className="p-6 min-h-screen bg-base-100">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h2 className="text-xl md:text-3xl font-extrabold text-primary">Admin Dashboard</h2>
        <p className="md:text-lg text-gray-600 mt-2">
          Monitor and manage your AgriConnect platform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={dashboardData?.totalUsers}
          icon={<Users className="w-6 h-6" />}
          trend="+12%"
          color="blue"
        />
        <StatCard
          title="Total Bids"
          value={dashboardData?.totalBids}
          icon={<Gavel className="w-6 h-6" />}
          trend="+5%"
          color="green"
        />
        <StatCard
          title="Total Products"
          value={dashboardData?.totalProducts}
          icon={<Package className="w-6 h-6" />}
          trend="+8%"
          color="purple"
        />
        <StatCard
          title="Completed Transactions"
          value={dashboardData?.completedTransactions}
          icon={<DollarSign className="w-6 h-6" />}
          trend="+15%"
          color="yellow"
        />
        <StatCard
          title="Pending Verifications"
          value={dashboardData?.pendingVerifications}
          icon={<AlertCircle className="w-6 h-6" />}
          trend="-2%"
          color="red"
        />
        <StatCard
          title="System Health"
          value={dashboardData?.systemHealth}
          icon={<CheckCircle className="w-6 h-6" />}
          trend="Stable"
          color="green"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management Card */}
        <div className="card bg-white shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-lg font-bold text-primary">
              <Users className="w-5 h-5 mr-2" />
              User Management
            </h3>
            <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
            <div className="card-actions justify-end mt-4">
              <Link 
                to='/manage-users'
                className="btn btn-primary"
              >Manage Users</Link>
            </div>
          </div>
        </div>

        {/* Bid Management Card */}
        <div className="card bg-white shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-lg font-bold text-primary">
              <Gavel className="w-5 h-5 mr-2" />
              Bid Management
            </h3>
            <p className="text-gray-600">Monitor and manage active bids</p>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-primary">View Bids</button>
            </div>
          </div>
        </div>

        {/* Product Management Card */}
        <div className="card bg-white shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-lg font-bold text-primary">
              <Package className="w-5 h-5 mr-2" />
              Product Management
            </h3>
            <p className="text-gray-600">Manage products and categories</p>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-primary">Manage Products</button>
            </div>
          </div>
        </div>

        {/* Transaction History Card */}
        <div className="card bg-white shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-lg font-bold text-primary">
              <DollarSign className="w-5 h-5 mr-2" />
              Transaction History
            </h3>
            <p className="text-gray-600">View and manage transaction records</p>
            <div className="card-actions justify-end mt-4">
              <Link 
                to='/manage-transactions'
                className="btn btn-primary"
              >View Transactions</Link>
            </div>
          </div>
        </div>

        {/* System Settings Card */}
        <div className="card bg-white shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-lg font-bold text-primary">
              <Settings className="w-5 h-5 mr-2" />
              System Settings
            </h3>
            <p className="text-gray-600">Configure platform settings and preferences</p>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-primary">Configure</button>
            </div>
          </div>
        </div>

        {/* Reports Card */}
        <div className="card bg-white shadow-xl">
          <div className="card-body">
            <h3 className="card-title text-lg font-bold text-primary">
              <TrendingUp className="w-5 h-5 mr-2" />
              Reports & Analytics
            </h3>
            <p className="text-gray-600">View platform analytics and reports</p>
            <div className="card-actions justify-end mt-4">
              <button className="btn btn-primary">View Reports</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard; 