import { Button, CircularProgress } from '@mui/material';
import { Box } from '@mui/system';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ParentContext } from '../App';
import { apiBaseUrl } from '../config';

const Home = () => {
    // States
    const [loadingUser,setLoadingUser] = useState(true);
    const navigate = useNavigate();

    // Context
    const {ovsUser,setOvsUser} = useContext(ParentContext);

    // Useeffects
    
    return (
        <div>
            <div>
                <h1>Home</h1>
                <Button
                variant="contained"
                size="small"
                color="error"
                style={{marginLeft:"2rem"}}
                onClick={()=> {
                    localStorage.removeItem("ovs_user");
                    navigate("/login");
                    setOvsUser(null);
                }}>
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default Home;