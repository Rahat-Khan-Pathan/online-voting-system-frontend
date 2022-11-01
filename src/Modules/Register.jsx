import { Alert, Button, Chip, Collapse, Grid, IconButton, Paper, Slide, TextField, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useContext, useEffect, useState } from 'react';
import { MdFileUpload } from "react-icons/md";
import { apiBaseUrl } from '../config';
import CloseIcon from '@mui/icons-material/Close';
import { LoadingButton } from '@mui/lab';
import axios from 'axios';
import { ParentContext } from '../App';
import { useNavigate } from 'react-router-dom';
import RegisterPoster from '../Resources/register-poster.png'

// Initial register data
const initialRegisterData = {
    _id: null,
    email: "",
    fullname: "",
    phonenumber: "",
    address: "",
    city: "",
    country: "",
    photobase64: null,
    photoextension: "",
    photopath: null,
}

const Register = () => {
    // States
    const [registerData,setRegisterData] = useState(initialRegisterData);
    const [openSuccess, setOpenSuccess] = useState(false);
    const [openFailure, setOpenFailure] = useState(false);
    const [message, setMessage] = useState("");
    const [loading,setLoading] = useState(false);
    const [loadingUser,setLoadingUser] = useState(true);
    const navigate = useNavigate();

    // Context 
    const {ovsUser,setOvsUser} = useContext(ParentContext);

    // Helper functions
    const encodeFileBase64 = async () => {
        const toBase64 = (file) => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result instanceof ArrayBuffer ? '' : reader.result);
            reader.onerror = error => reject(error);
        });
        let lastDot;
        let photoExtension = '';
        let photo= '';

        if (registerData.photobase64 !== null && typeof (registerData.photobase64) !== 'string') {
            lastDot = registerData.photobase64.name.lastIndexOf(".");
            photoExtension = registerData.photobase64.name.substring(lastDot + 1);
            photo = await toBase64(registerData.photobase64)
        }

        const newRegisterData = { ...registerData, photobase64: photo, photoextension: photoExtension,email:ovsUser?.email, _id: ovsUser?._id };
        return newRegisterData;
    }   

    const handleRegister= async ()=> {
        const data = await encodeFileBase64(registerData);
        console.log(JSON.stringify(data));
        axios({
            method: "POST",
            url: `${apiBaseUrl}/users/register`,
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify(data),
          })
            .then((res) => {
                setLoading(false);
                setOpenSuccess(true);
                setOpenFailure(false);
                setMessage("Register Successfull");
                setRegisterData(initialRegisterData);
                if(res.data.results) {
                    setOvsUser(res.data.results);
                    navigate("/home");
                }
            })
            .catch((err) => {
                setLoading(false);
                err?.response?.data ? setMessage(err.response.data) : setMessage("Something Went Wrong. Please Try Again Later!");
        });
    }

    // Useeffects
    
    return (
        <>
            <Grid container style={{minHeight:"100vh"}} alignItems="center" flexDirection="row-reverse">
                <Grid item xs={6} style={{backgroundColor:"#EEF2FF",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <Slide direction="left" in mountOnEnter unmountOnExit>
                        <img src={RegisterPoster} alt="" style={{mixBlendMode:"multiply",width:"100%"}} />
                    </Slide>
                </Grid>
                <Grid item xs={6} style={{display:"flex",justifyContent:"center",flexDirection:"column",alignItems:"center"}}>
                    <Grid container>
                        <Grid item xs={12} style={{marginBottom:"1.5rem"}}>
                            <Slide direction="down" in mountOnEnter unmountOnExit>
                                <div>
                                    <Typography variant='h4' style={{fontWeight:"bold",textAlign:"center",fontSize:"1.3rem",marginBottom:"0.2rem"}}>Hello <span style={{color: '#6c63ff'}}>Chief</span>, Please Fill Up The Form</Typography>
                                </div>
                            </Slide>
                        </Grid>
                    </Grid>
                    <div style={{width:"60%"}}> 
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="standard-required"
                                    label="Fullname"
                                    variant="standard"
                                    value={registerData.fullname}
                                    onChange={e=> {
                                        setRegisterData({...registerData,fullname:e.target.value});
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="standard-required"
                                    label="Phone Number"
                                    value={registerData.phonenumber}
                                    variant="standard"
                                    onChange={e=> {
                                        setRegisterData({...registerData,phonenumber:e.target.value});
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="standard-required"
                                    label="Address"
                                    value={registerData.address}
                                    variant="standard"
                                    multiline
                                    onChange={e=> {
                                        setRegisterData({...registerData,address:e.target.value});
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="standard-required"
                                    label="City"
                                    value={registerData.city}
                                    variant="standard"
                                    onChange={e=> {
                                        setRegisterData({...registerData,city:e.target.value});
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    id="standard-required"
                                    label="Country"
                                    value={registerData.country}
                                    variant="standard"
                                    onChange={e=> {
                                        setRegisterData({...registerData,country:e.target.value});
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Box style={{display:'flex',justifyContent:'flex-start'}}>
                                    <label htmlFor='photo'>
                                        {
                                            <Chip icon={<MdFileUpload style={{transform: "scale(1.8)"}}/>} 
                                            label={registerData.photobase64 && typeof(registerData.photobase64)!=='string'?
                                            registerData.photobase64?.name : "Upload Your Photo "}  
                                            clickable 
                                            color='info' 
                                            style={{padding:'1rem'}} 
                                            />
                                        }
                                    </label>
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="inherit"
                                        style={{marginLeft:'.5rem'}}
                                        onClick={()=> {
                                            setRegisterData({...registerData,photopath: null, photobase64: null})
                                            }}
                                        >
                                        Clear
                                    </Button>
                                    <input type="file" id='photo' accept=".png, .jpg" style={{display:'none'}}
                                        onChange={e=> {
                                            setRegisterData({...registerData,photopath:null,photobase64: (e.target.files?.length) ? (e.target?.files[0]) : null});
                                            e.target.value = "";
                                        }}
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12}>
                                <div style={{ margin: 0 }}>
                                    <Collapse in={openSuccess}>
                                    <Alert
                                        action={
                                        <IconButton
                                            aria-label="close"
                                            color="inherit"
                                            size="small"
                                            onClick={() => {
                                            setOpenSuccess(false);
                                            }}
                                        >
                                            <CloseIcon fontSize="inherit" />
                                        </IconButton>
                                        }
                                    >
                                        {message}
                                    </Alert>
                                    </Collapse>
                                    <Collapse in={openFailure}>
                                    <Alert
                                        severity="error"
                                        action={
                                        <IconButton
                                            aria-label="close"
                                            color="inherit"
                                            size="small"
                                            onClick={() => {
                                            setOpenFailure(false);
                                            }}
                                        >
                                            <CloseIcon fontSize="inherit" />
                                        </IconButton>
                                        }
                                    >
                                        {message}
                                    </Alert>
                                    </Collapse>
                                </div>
                            </Grid>
                            <Grid item xs={12}>
                                <LoadingButton
                                    fullWidth
                                    loading={loading}
                                    loadingPosition="start"
                                    variant="outlined"
                                    style={!(!Boolean(registerData.fullname) || !Boolean(registerData.phonenumber) || !Boolean(registerData.address) || !Boolean(registerData.city) || !Boolean(registerData.country) || !Boolean(registerData.photobase64)) ? {backgroundColor:"#6c63ff",color:"white",border:"none",borderRadius:"3rem"} : {border:"none",borderRadius:"3rem",backgroundColor:"#e0e0e0",color:"#adadad"}}
                                    disabled={!Boolean(registerData.fullname) || !Boolean(registerData.phonenumber) || !Boolean(registerData.address) || !Boolean(registerData.city) || !Boolean(registerData.country) || !Boolean(registerData.photobase64)}
                                    onClick={()=>{
                                        
                                        handleRegister();
                                        setLoading(true);
                                    }}
                                >
                                    Submit
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </div>
                </Grid>
            </Grid>
        </>
    );
};

export default Register;