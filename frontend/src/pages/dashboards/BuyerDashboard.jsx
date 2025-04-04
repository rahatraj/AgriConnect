import React, { useEffect, useMemo,useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { fetchBuyerStats, updateBidLive } from "../../redux/slices/bidSlice";
import { toast } from "react-hot-toast";
import { getSocket } from "../../redux/middlewares/socketMiddleware";
import { Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Line,
  LineChart 

} from "recharts";
import ErrorComponent from "../../components/common/ErrorComponent";

function BuyerDashboard() {
  const { t } = useTranslation()
  const dispatch = useDispatch();
  const socket = getSocket();
  const navigate = useNavigate();
  const { data } = useSelector((state) => state.users);
  const { buyerStats, loading, error } = useSelector((state) => state.bids);
  const notifications = useSelector((state) => state.notifications.notifications);
  const [showError, setShowError] = useState(true);

  useEffect(() => {
    dispatch(fetchBuyerStats());
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;

    const handleBidUpdate = (bidData) => {
      dispatch(updateBidLive(bidData));
    };

    const handleBidClosed = (closedBid) => {
      toast.success(`Bidding closed for ${closedBid?.bidId}!`);
    };

    socket.on("bidUpdate", handleBidUpdate);
    socket.on("bidClosed", handleBidClosed);

    return () => {
      socket.off("bidUpdate", handleBidUpdate);
      socket.off("bidClosed", handleBidClosed);
    };
  }, [socket, dispatch]);

  useEffect(() => {
    if (notifications.length > 0) {
      toast.success(notifications[0].message);
    }
  }, [notifications])
  
  const dashboardData = useMemo(
    () => ({
      totalActiveBids: buyerStats?.totalActiveBids || 0,
      wonBids: buyerStats?.wonBids || 0,
      lostBids : buyerStats?.lostBids || 0,
      recentBids: buyerStats?.recentBids || [],
      recommendedBids : buyerStats?.recommendedBids || [],
      walletBalance: buyerStats?.walletBalance || 0,
    }),
    [buyerStats]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  
 if((dashboardData?.totalActiveBids !== 0 && dashboardData?.lostBids !== 0
    && dashboardData?.recentBids !== 0 && dashboardData?.wonBids) && (error && showError) ){
      return <ErrorComponent message={error} onDismiss={() => setShowError(false)} />;
 }
  const bidData = dashboardData.recentBids.map((bid) => ({
    name: bid.bidTitle,
    amount: bid.bidAmount,
  }));

  const pieData = [
    { name: "Active Bids", value: dashboardData.totalActiveBids },
    { name: "Won Bids", value: dashboardData.wonBids },
    { name: "Lost Bids", value: dashboardData.lostBids },
  ];

  const COLORS = ["#8884d8", "#82ca9d", "#F87272"];

  const bidPerformanceData = dashboardData.recentBids.map((bid) => ({
    date: new Date(bid.bidTime).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
    amount: bid.bidAmount,
  }));

  const sortedBidPerformanceData = [...bidPerformanceData].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
 
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Welcome, {data?.user?.fullName}
      </h2>
      <button className="btn btn-secondary" onClick={() => navigate(-1)}>
        Go Back
      </button>

      {/* Stats Overview */}
      <h2 className="lg:text-2xl font-semibold mt-3">Bid Stats</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {[
          { label: "Active Bids", value: dashboardData.totalActiveBids },
          { label: "Total Won Bids", value: dashboardData.wonBids },
          { label: "Totol Lost Bids", value: dashboardData.lostBids },
          { label: "Wallet Balance", value: `₹${dashboardData.walletBalance}` },
        ].map((stat, index) => (
          <div key={index} className="stat bg-white shadow-lg rounded-lg p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <h3 className="text-xl font-bold">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Recommended Bids Table */}
      <div className="bg-white p-4 shadow-lg rounded-lg mt-6">
        <h3 className="text-lg font-semibold text-center mb-2">Recommended Bids</h3>
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Bid Title</th>
              <th className="border p-2">Category</th>
              <th className="border p-2">Amount</th>
              <th className="border p-2">Deadline</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.recommendedBids.map((bid) => (
              <tr key={bid._id} className="text-center">
                <td className="border p-2">{bid?.productName}</td>
                <td className="border p-2">{bid?.category}</td>
                <td className="border p-2">₹{bid?.basePrice}</td>
                <td className="border p-2">{new Date(bid?.biddingDeadLine).toLocaleDateString("en-IN")}</td>
                <td className="border p-2">
                  <button className="btn btn-primary" onClick={() => navigate(`/bid-details/${bid._id}`)}>
                    View Bid
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Bar Chart for Recent Bids */}
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold text-center mb-2">Recent Bids</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bidData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart for Active vs Won Bids */}
        <div className="bg-white p-4 shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold text-center mb-2">Bid Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart for Bid Performance Over Time */}
        <div className="bg-white p-4 shadow-lg rounded-lg mt-6">
          <h3 className="text-lg font-semibold text-center mb-2">
            Bid Performance Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sortedBidPerformanceData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="amount" stroke="#ff7300" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 lg:mt-10">
          <Link 
              to={`/bid-products`}
              className="btn btn-primary">
              Start Bid
          </Link>
          <Link 
              to={`/bid-history`}
              className="btn btn-secondary">
              View My Bids
          </Link>
          <Link 
              to={`/wallet`}
              className="btn btn-accent">
              Add Funds
          </Link>
        </div>
    </div>
  );
}

export default BuyerDashboard;
