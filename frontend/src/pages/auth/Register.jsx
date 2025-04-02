import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { userRegister } from '../../redux/slices/userSlice';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Lock, Mail, Loader2, User, Key } from 'lucide-react';

const formInitial = {
    fullName: "",
    email: "",
    password: "",
    role: "",
    passCode: ""
};

function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading } = useSelector((state) => state.users);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState(formInitial);

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            toast.error("Full name is required");
            return false;
        }
        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error("Invalid email format");
            return false;
        }
        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return false;
        }
        if (!formData.role) {
            toast.error("Please select a role");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const result = await dispatch(userRegister(formData));
        if (result.meta.requestStatus === "fulfilled") {
            toast.success("Account created successfully!");
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-green-100 p-6">
            <div className="card bg-white/35 shadow-2xl w-full max-w-lg p-6 rounded-2xl backdrop-blur-md bg-opacity-0">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-primary">Create Your Account</h1>
                    <p className="text-base-content/70">Join AgriConnect and start trading today!</p>
                </div>
                <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Full Name</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 size-5" />
                            <input type="text" className="input input-bordered w-full pl-10" placeholder="Enter full name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Email</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 size-5" />
                            <input type="text" className="input input-bordered w-full pl-10" placeholder="Enter email address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Password</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 size-5" />
                            <input type={showPassword ? "text" : "password"} className="input input-bordered w-full pl-10" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                            <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/40" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">I am a </span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                            {["Farmer", "Buyer", "StorageOwner", "Admin"].map((role) => (
                                <label key={role} className="flex items-center gap-2 border rounded-lg p-2 cursor-pointer">
                                    <input type="radio" name="role" value={role} checked={formData.role === role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} />
                                    {role}
                                </label>
                            ))}
                        </div>
                    </div>
                    {formData.role === "Admin" && (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">PassCode</span>
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40 size-5" />
                                <input type="text" className="input input-bordered w-full pl-10" placeholder="Enter provided passcode" value={formData.passCode} onChange={(e) => setFormData({ ...formData, passCode: e.target.value })} />
                            </div>
                        </div>
                    )}
                    <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="size-5 animate-spin" /> Creating Account...</> : "Create Account"}
                    </button>
                </form>
                <p className="text-center font-bold mt-4 text-base-content/70">
                    Already have an account? <Link to="/login" className="link link-primary">Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
