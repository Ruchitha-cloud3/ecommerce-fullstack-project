import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
       e.preventDefault();
       try {
        const response = await axios.post(
            "http://localhost:5000/api/auth/login",
            {
                email,
                password
            }
        );
        console.log(response.data);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/home");
        alert(response.data.message);
        
       }catch (error) {
        console.log(error);
        alert("Login failed");
       }
    };
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-6">login</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input type="email" placeholder="Enter your email" value={email} onChange={(e) =>
                        setEmail(e.target.value)} className="w-full border p-3 rounded"></input>
                </div>
                <div>
                    <label className="block mb-1 font-medium">Password</label>
                    <input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-3 rounded"></input>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded font-semibold">Login</button>
                </form>
            </div>
        </div>
    );
}
export default Login;