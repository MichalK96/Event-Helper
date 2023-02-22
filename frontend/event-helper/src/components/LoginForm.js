import "../css/LoginAndRegister.css";
import {redirect, useNavigate} from "react-router-dom";
import AuthService from "../auth.serivce";
import authSerivce from "../auth.serivce";
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import React, { useState, useEffect } from 'react';
import {GoogleOAuthProvider} from "@react-oauth/google";
import axios from 'axios';

export default function LoginForm({Login, error}) {

    let navigate = useNavigate();

    const [errors, setErrors] = useState("");

    const [ user, setUser ] = useState([]);
    const [ profile, setProfile ] = useState([]);

    useEffect(
        () => {
            if (user) {
                axios
                    .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
                        headers: {
                            Authorization: `Bearer ${user.access_token}`,
                            Accept: 'application/json'
                        }
                    })
                    .then((res) => {
                        setProfile(res.data);
                    })
                    .catch((err) => console.log(err));
            }
        },
        [ user ]
    );

    useEffect(
        () => {
            if (profile){
                console.log("weszlo mi tutaj do profile")
                console.log("mail niby: " + profile.email)
                console.log("name niby: " + profile.name)
                AuthService.login(profile.email, "not_provided_yet").then(r => {
                    if (authSerivce.getCurrentUser()){
                        navigate("/home")
                    }
                })
            }

        }
    )


    const login = useGoogleLogin({
        onSuccess: (codeResponse) => setUser(codeResponse),
        onError: (error) => console.log('Login Failed:', error)
    });

    const [form, setForm] = useState({
        email: "",
        password: ""
    });
    const {email, password} = form;

    function handleChange(e) {
        setForm({...form, [e.target.name]: e.target.value});
    }

    function handleSubmit(e) {
        e.preventDefault();

        AuthService.login(email, password)
            .then(res => {
                console.log("Request complete! response:", res);
                if (authSerivce.getCurrentUser()){
                    navigate('/home')
                }
            }).catch((error) => {
            console.log("login error", error);
            setErrors("login error");
        });
        setErrors("logged in successfully");
        setForm({
            email: "",
            password: ""
        });
    }

    const logOut = () => {
        googleLogout();
        setProfile(null);
    };

    return (
        <>
            <div className="section-1">
                <div className="parent clearfix">
                    <div className="bg-illustration">
                        <a href="/home"><img src={require("../assets/logo-duza-rozdzielczosc-jasne.png")} alt="logo"></img></a>

                        <div className="burger-btn">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>

                    </div>

                    <div className="login">
                        <div className="container">
                            <h1>Login to Event Helper</h1>
                            <h4>{errors}</h4>
                            <div className="login-form">
                                <form onSubmit={handleSubmit}>
                                    {(error !== "") ? (<div className="error">{error}</div>) : ""}
                                    <input type="email" name="email" placeholder="E-mail Address" onChange={handleChange}/>
                                    <input type="password"  name="password" placeholder="Password"  onChange={handleChange}/>

                                    <div className="remember-form">
                                        <a href="/register"><span>Create new account</span></a>
                                    </div>
                                    <div className="forget-pass">
                                        <a href="/forgot-password">Forgot Password ?</a>
                                    </div>

                                    <button type="submit">LOG-IN</button>

                                    {/*{profile ? (*/}
                                    {/*    <div>*/}
                                    {/*        <p>Imie: {profile.name}</p>*/}
                                    {/*        <button onClick={logOut}>Log out</button>*/}
                                    {/*    </div>*/}
                                    {/*) : (*/}
                                    {/*    <button onClick={() => login()}>Sign in with Google 🚀 </button>*/}
                                    {/*)}*/}

                                </form>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </>
    )

}