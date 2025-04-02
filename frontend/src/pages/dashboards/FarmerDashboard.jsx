import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFarmerStats, updateBidLive } from "../../redux/slices/bidSlice";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart, Line } from "recharts";
import { Link } from "react-router-dom";
import { getSocket } from "../../redux/middlewares/socketMiddleware";
import ErrorComponent from "../../components/common/ErrorComponent";

const FarmerDashboard = () => {
  const dispatch = useDispatch();
   const { data } = useSelector((state) => state.users);
  const isConnected = useSelector((state) => state.socket.isConnected);
  const [socket, setSocket] = useState(null);

  const { farmerStats, loading, error } = useSelector((state) => state.bids);
  const { notifications } = useSelector((state)=> state.notifications.notifications)

  useEffect(() => {
    if (isConnected) {
      const socketInstance = getSocket();
      setSocket(socketInstance);
    }
  }, [isConnected]);

  useEffect(() => {
    dispatch(fetchFarmerStats());
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    socket.on("bidUpdate", (bidData) => dispatch(updateBidLive(bidData)));
    socket.on("bidClosed", (closedBid) => toast.success(`Bidding closed for ${closedBid?.bidId}!`));

    return () => {
      socket.off("bidUpdate");
      socket.off("bidClosed");
    };
  }, [socket, dispatch]);

  useEffect(() => {
    if (notifications?.length > 0) {
      toast.success(notifications[0].message);
    }
  }, [notifications])

  const dashboardData = useMemo(() => ({
    totalActiveBids: farmerStats?.totalActiveBids || 0,
    totalCompletedBids: farmerStats?.totalCompletedBids || 0,
    totalEarnings: farmerStats?.totalEarnings || 0,
    walletBalance: farmerStats?.walletBalance || 0,
    recentBids: farmerStats?.recentBids || [],
    earningsData: farmerStats?.earningsHistory || [],
  }), [farmerStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <ErrorComponent message={error} />;
  }

  const pieData = [
    { name: "Active Bids", value: dashboardData.totalActiveBids },
    { name: "Completed Bids", value: dashboardData.totalCompletedBids }
  ];
  const COLORS = ["#8884d8", "#82ca9d"];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">
        Welcome, {data?.user?.fullName}
      </h2>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        Back
      </button>

      {/* Stats Overview */}
      <h2 className="lg:text-2xl font-semibold mt-3">Bid Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Active Bids", value: dashboardData.totalActiveBids },
          { label: "Completed Bids", value: dashboardData.totalCompletedBids },
          { label: "Total Earnings", value: `₹${dashboardData.totalEarnings}` },
          { label: "Wallet Balance", value: `₹${dashboardData.walletBalance}` },
        ].map((stat, index) => (
          <div key={index} className="bg-white shadow-lg rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <h3 className="text-xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-center">Earnings Trend Weekly</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={dashboardData.earningsData}>
              <XAxis dataKey="weekStart" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" barSize={30} fill={COLORS[1]} />
              <Line type="monotone" dataKey="total" stroke={COLORS[0]} strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2 text-center">Bids Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-lg mt-6">
        <h3 className="text-lg font-semibold mb-2 text-center">Recent Bids</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dashboardData.recentBids}>
            <XAxis dataKey="productName" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="bidAmount" fill={COLORS[1]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-center">
        <Link to="/create-product" className="btn btn-primary w-full">Add New Product</Link>
        <Link to="/ongoing-bids" className="btn btn-secondary w-full">View My Bids</Link>
        <Link to="/wallet" className="btn btn-accent w-full">Withdraw Money</Link>
      </div>
    </div>
  );
};

export default FarmerDashboard;
