import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';
import { useAppContext } from '../../context/AuthContext';

import './RegisterPage.css';

function RegisterPage() {
    const navigate = useNavigate();
    const {setIsLoggedIn} = useAppContext();
    const [showerr, setShowerr] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = async () => {
        try {
            const response = await fetch(`${urlConfig.backendUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password
                })
            })
            
            if(!response.ok){
                setShowerr('Fail to register')
            }

            const json = await response.json();
            if(json.authtoken){
                sessionStorage.setItem('auth-token', json.authtoken);
                sessionStorage.setItem('name', firstName);
                sessionStorage.setItem('email', json.email);
                setIsLoggedIn(true);
                navigate('/')
            }
            
            if(json.error) {
                setShowerr(json.error);
            }
        } catch(error) {
            console.log('Error fetching details: ' + error.message);
        }
    }

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    <div className="register-card p-4 border rounded">
                        <h2 className="text-center mb-4 font-weight-bold">Register</h2>
                        <div className="mb-4">
                            <lable htmlFor="firstName" className="form label">First Name</lable> 
                            <input 
                            id="firstName" text="text" 
                            className="form-control" placeholder="Enter your firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <lable htmlFor="lastName" className="form label">Last Name</lable> 
                            <input 
                            id="lastName" text="text" 
                            className="form-control" placeholder="Enter your last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <lable htmlFor="email" className="form label">Email</lable> 
                            <input 
                            id="email" text="text" 
                            className="form-control" placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            />
                            <div className="text-danger">{showerr}</div>
                        </div>
                        <div className="mb-4">
                            <lable htmlFor="password" className="form label">Password</lable> 
                            <input 
                            id="password" text="text" 
                            className="form-control" placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-primary w-100 mb-3" onClick={handleRegister}>Register</button>
                        <p className="mt-4 text-center">
                            Already a member? <a href="/app/login" className="text-primary">Login</a>
                        </p>

                    </div>
                </div>
            </div>
        </div>

    )//end of return
}

export default RegisterPage;