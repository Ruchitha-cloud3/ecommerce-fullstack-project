import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Signup() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(
                "ecommerce-fullstack-project-production-7599.up.railway.app/api/auth/register",
                {
                    name,
                    email,
                    password
                }

            );
            console.log(response.data);
            alert("Registration successful!");
            navigate("./login");
        } catch (error) {
            console.error(error);
            alert("Registration failed");
        }    
      
    };
    return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bh-white p-8 round-lg shadow-lg">
            <h1 className="text-3xl font-bold text-center mb-6">Create Account</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <input type="text" placeholder="Enter your name" value={name} onChange={(e) =>
                        setName(e.target.value)}
                        className="w-full border p-3 rounded"></input>     
                </div>
                <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-3 rounded"></input> 
                </div>
                <div>
                    <label className="block mb-1 font-medium">Password</label>
                    <input typr="password" placeholder="Enter your password" value={password} onChange={(e) =>
                        setPassword(e.target.value)}
                        className="w-full border p-3 rounded"></input>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-3 roundede font-semibold">Sign Up</button>


            </form>
            <p>
                Already have an account? <a href="/login">Login</a>
            </p>
        </div>
        
    </div>
    );

}
export default Signup;