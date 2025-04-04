import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, userLogin } from '../../redux/slices/userSlice';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Loader2 } from 'lucide-react';
import ErrorComponent from '../../components/common/ErrorComponent';

const formInitial = {
    email: "",
    password: "",
};

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data,isLoading, error, isLoggedIn } = useSelector((state) => state.users);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState(formInitial);
    const [showError, setShowError] = useState(true);

    useEffect(()=> {
        if (isLoggedIn && data?.user?.role && window.location.pathname === "/login") {
            switch (data.user.role) {
                case "Farmer": navigate('/farmer/dashboard'); break;
                case "Buyer": navigate('/buyer-dashboard'); break;
                case "StorageOwner": navigate('/storage-dashboard'); break;
                case "Admin": navigate('/admin-dashboard'); break;
                default: navigate('/');
            }
        }
    }, [data?.user?.role, navigate,isLoggedIn])
    const validateForm = () => {
        if (!formData.email.trim()) {
            toast.error("email is required");
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error("invalid email");
            return false;
        }
        if (!formData.password) {
            toast.error("password is required");
            return false;
        }
        if (formData.password.length < 8) {
            toast.error("password length must be 8 characters long");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;
        try {
            await dispatch(userLogin(formData)).unwrap();
            await dispatch(fetchCurrentUser());
            setFormData(formInitial)
        } catch (error) {
            toast.error("Login failed. Please try again")
        }
    };
    if (error && showError) {
        return <ErrorComponent message={error} onDismiss={() => setShowError(false)} />;
    }
    return (
    <div 
        className="min-h-screen flex items-center justify-center bg-cover bg-center bg-green-100 p-6">
        <div className="card bg-white shadow-2xl w-full max-w-md p-6 rounded-2xl backdrop-blur-md bg-opacity-0">
            
        {/* Heading */}
        <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">Welcome Back!</h1>
            <p className="text-base-content/70">Login to continue using AgriConnect</p>
        </div>

        {/* Form */}
        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
            
            {/* Email Field */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Email</span>
                </label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 size-5" />
                    <input 
                        type="text"
                        className="input input-bordered w-full pl-10"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
            </div>

            {/* Password Field */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 size-5" />
                    <input 
                        type={showPassword ? "text" : "password"}
                        className="input input-bordered w-full pl-10"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button 
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                </div>
            </div>

                {/* Login Button */}
                <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="size-5 animate-spin" />
                            Logging in...
                        </>
                    ) : "Login"
                    }
                </button>
            </form>

            {/* Register Link */}
            <p className="text-center mt-4 text-base-content/70">
                Don't have an account?", {" "}
                <Link to="/register" className="link link-primary">
                    SignUp
                </Link>
            </p>
        </div>
    </div>
    );
}

export default Login;
