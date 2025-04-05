import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ShoppingCart, Warehouse, Users } from "lucide-react";

function Home() {
  return (
    <div className="min-h-screen bg-base-100">
      
      {/* Hero Section */}
      <section className="hero min-h-screen bg-green-100 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-4xl space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-green-900 leading-tight">
            Empowering Farmers, Buyers & Storage Owners
          </h1>
          <p className="text-lg text-green-800">
            AgriConnect is a revolutionary platform for trading fresh produce, booking cold storage, and managing agricultural transactions with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn btn-primary">Get Started</Link>
            <Link to="/login" className="btn btn-outline">Explore Products</Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-green-900">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[
            { icon: <ShoppingCart className="size-12 text-green-600 mx-auto" />, title: "Farmers", desc: "List your fresh produce, set prices, and reach buyers directly." },
            { icon: <Users className="size-12 text-green-600 mx-auto" />, title: "Buyers", desc: "Browse listings, bid on products, and purchase fresh produce." },
            { icon: <Warehouse className="size-12 text-green-600 mx-auto" />, title: "Storage Owners", desc: "Rent out cold storage space and manage bookings efficiently." },
          ].map((item, index) => (
            <div key={index} className="card bg-base-200 shadow-md p-6 rounded-lg">
              {item.icon}
              <h3 className="text-lg md:text-xl font-semibold mt-4">{item.title}</h3>
              <p className="text-base-content/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-green-50 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-green-900">Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 text-center">
          {[
            "Secure Transactions",
            "Real-Time Bidding",
            "Cold Storage Booking",
            "Wallet & Payments",
            "Verified Users",
            "Instant Notifications",
          ].map((feature, index) => (
            <div key={index} className="card bg-base-200 shadow-md p-6 rounded-lg">
              <CheckCircle className="size-12 text-green-600 mx-auto" />
              <h3 className="text-lg md:text-xl font-semibold mt-4">{feature}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-green-900">What Our Users Say</h2>
        <div className="flex flex-col gap-6 mt-8">
          {[
            { name: "Rajesh Kumar", role: "Farmer", feedback: "AgriConnect helped me sell my produce at a great price!" },
            { name: "Meera Singh", role: "Buyer", feedback: "The bidding feature is amazing. Got fresh vegetables at best rates!" },
            { name: "Amit Patel", role: "Storage Owner", feedback: "Managing cold storage bookings has never been easier." },
          ].map((testimonial, index) => (
            <div key={index} className="bg-base-200 p-6 rounded-lg shadow-md">
              <p className="text-lg italic">"{testimonial.feedback}"</p>
              <h4 className="text-lg font-semibold mt-2">{testimonial.name}</h4>
              <p className="text-sm text-base-content/70">{testimonial.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 bg-green-200 text-center px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-green-900">Join AgriConnect Today</h2>
        <p className="text-lg text-green-800 max-w-3xl mx-auto mt-4">
          Whether you're a farmer, buyer, or storage owner, AgriConnect is your all-in-one platform for seamless agricultural trade.
        </p>
        <div className="mt-6">
          <Link to="/register" className="btn btn-primary btn-lg">Sign Up Now</Link>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-neutral text-white py-6 text-center">
        <p>&copy; {new Date().getFullYear()} AgriConnect. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
