import { Alert, Autocomplete, Button, Chip, Collapse, Divider, FormControl, Grid, IconButton, InputLabel, List, ListItem, ListItemButton, ListItemText, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { DateTimePicker, LocalizationProvider } from '@mui/lab';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import { IoIosAddCircle } from "react-icons/io";
import axios from 'axios';
import { apiBaseUrl } from '../config';
import { CircularProgress, Box } from '@mui/material';
import { ParentContext } from '../App';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import { MdFileUpload } from "react-icons/md";

// View Modes
const viewModesView = "VIEW";
const viewModesNew = "NEW";
const viewModesEdit = "EDIT";
const viewModesEditable = "EDITABLE";

// Initial contest data 
const initialContestData = {
    createdby: null,
    electiontitle: "",
    electiontype: "",
    electionstartdate: null,
    electionenddate: null,
    registrationstartdate: null,
    registrationenddate: null,
    positions: [],
}
// Initial single position
const initialSinglePosition = {
    positiontitle: "",
    candidatesnumber: 0,
    candidates: [],
    symbols: [],
}
// Initial candidate symbol
const intialCandidateSymbol = {
    username: "",
    photobase64: null,
    photopath: "",
    photoextension: "",
}
const CreateElection = () => {
    // States
    const [self,setSelf] = useState(initialContestData);
    const [currentView, setCurrentView] = useState(viewModesView);
    const [message,setMessage] = useState("");
    const [message2,setMessage2] = useState("");
    const [openSuccess,setOpenSuccess] = useState(false);
    const [openSuccess2,setOpenSuccess2] = useState(false);
    const [openFailure,setOpenFailure] = useState(false);
    const [openFailure2,setOpenFailure2] = useState(false);
    const [singlePosition,setSinglePosition] = useState(initialSinglePosition);
    const [allPositions,setAllPositions] = useState([]);
    const [singleCandidate,setSingleCandidate] = useState(null);
    const [singleCandidateSymbol,setSingleCandidateSymbol] = useState(intialCandidateSymbol);
    const [allUsers,setAllUsers] = useState([]);
    const [loading,setLoading] = useState(true);
    const [selectedPosition,setSelectedPosition] = useState(null);
    const currentDateTime = new Date();

    // Context 
    const {ovsUser,setOvsUser} = useContext(ParentContext);

    // Helper functions
    const encodeFileBase64 = async (registerData) => {
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
        const newRegisterData = { ...registerData, photobase64: photo, photoextension: photoExtension};
        return newRegisterData;
    }   
    const showFailure = (msg)=> {
        setOpenFailure(true);
        setOpenSuccess(false);
        setMessage(msg);
    }
    const showSuccess = (msg)=> {
        setOpenFailure(false);
        setOpenSuccess(true);
        setMessage(msg);
    }
    const clearSuccessFailure = ()=> {
        setOpenFailure(false);
        setOpenSuccess(false);
        setOpenFailure2(false);
        setOpenSuccess2(false);
    }
    const clearFields = ()=> {
        setSelf(initialContestData);
        setSinglePosition(initialSinglePosition);
        setSingleCandidate(null);
        setAllPositions([]);
        setSelectedPosition(null);
    }
    const addPositionHandler = ()=> {
        const found = allPositions.find(ps => ps?.positiontitle===singlePosition?.positiontitle);
        if(found) {
            setMessage2("Can't Add Duplicate Position");
            setOpenSuccess2(false);
            setOpenFailure2(true);
            return;
        }
        setOpenFailure2(false);
        setOpenSuccess2(false);
        const newAllPositions = [...allPositions,singlePosition];
        setSelectedPosition(singlePosition);
        setAllPositions(newAllPositions);
        setSinglePosition(initialSinglePosition);
    }
    const deletePositionHandler = (selected)=> {
        const newAllPositions = allPositions.filter(allPos => allPos?.positiontitle !== selected?.positiontitle);
        setAllPositions(newAllPositions);
        if(selected?.positiontitle === selectedPosition?.positiontitle) setSelectedPosition(null);
    }
    const addCandidateHandler = ()=> {
        const newAllPositions = [...allPositions];
        const pos = newAllPositions.find(allpos => allpos?.positiontitle === selectedPosition?.positiontitle);
        const newCandidates = [...pos.candidates];
        const newSymbols = [...pos.symbols];
        const found = newCandidates.find(newcd=> newcd?.username ===singleCandidate?.username);
        if(found) {
            setOpenFailure2(true);
            setOpenSuccess2(false);
            setMessage2("Cannot Add Duplicate Candidate To Same Position");
            setSingleCandidate(null);
            setSingleCandidateSymbol(intialCandidateSymbol);
            return;
        }
        const found2 = allPositions.find(pos => pos.candidates.find(newcd=> newcd.username === singleCandidate.username));
        if(found2) {
            setOpenFailure2(true);
            setOpenSuccess2(false);
            setMessage2("This Candidate is Already Added To Another Position");
            setSingleCandidate(null);
            setSingleCandidateSymbol(intialCandidateSymbol);
            return;
        }
        singleCandidateSymbol.username=singleCandidate.username;
        newSymbols.push(singleCandidateSymbol);
        newCandidates.push(singleCandidate);
        pos.candidates = newCandidates;
        pos.symbols=newSymbols;
        setAllPositions(newAllPositions);   
        setSingleCandidate(null);
        setSingleCandidateSymbol(intialCandidateSymbol);
        setOpenFailure2(false);
        setOpenSuccess2(false);
    }
    const deleteCandidateHandler = (selected)=> {
        const newAllPositions = [...allPositions]
        newAllPositions.map(pos => {
            pos.candidates = pos.candidates.filter( cd=> cd?.username !== selected?.username);
            pos.symbols = pos.symbols.filter(sm => sm?.username !== selected?.username)
        })
        setAllPositions(newAllPositions);
    }
    const getAllUsers = ()=> {
        axios({
            method: "POST",
            url: `${apiBaseUrl}/users/get_all`,
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify({
                registeredisused:true,
                registered:true,
            }),
          })
            .then((res) => {
                setLoading(false);
                if(res.data.results) {
                    setAllUsers(res.data.results.filter(rs=>rs?.username !== ovsUser?.username));
                }
            })
            .catch((err) => {
                setLoading(false);
                err?.response?.data ? showFailure(err.response.data) : showFailure("Something Went Wrong. Please Try Again Later!");
        });
    }
    const createElection = async ()=> {
        const newAllpositions = [];
        allPositions.map((pos,i)=> {
            const newObj = {}
            newObj.candidates = pos.candidates;
            newObj.candidatesnumber = pos.candidatesnumber;
            newObj.positiontitle = pos.positiontitle;
            newObj.symbols = pos.symbols;
            newAllpositions.push(newObj);
        })
        const data = JSON.parse(JSON.stringify(self));
        data.positions = newAllpositions;
        data.createdby = ovsUser?._id;
        let newSymbols = [];
        for(const pos of data.positions) {
            const newCandidates = [];
            pos?.candidates?.map(cd => newCandidates.push(cd?._id));
            pos.candidates=newCandidates;
            newSymbols = [];
            const len = pos?.symbols?.length;
            for(const sm of pos?.symbols) {
                const encoded = await encodeFileBase64(sm);
                newSymbols.push(encoded);
            }
            pos.symbols = newSymbols;
        }
        console.log(data);
        console.log(JSON.stringify(data));
        // return;  
        axios({
            method: "POST",
            url: `${apiBaseUrl}/elections/new`,
            headers: {
              "Content-Type": "application/json",
            },  
            data: JSON.stringify(data),
          })
            .then(() => {
                showSuccess("Election Created Successfully");
                // clearFields();
            })
            .catch((err) => {
                err?.response?.data ? showFailure(err.response.data) : showFailure("Something Went Wrong. Please Try Again Later!");
        });
    }
    // Useeffects
    useEffect(()=> {
        getAllUsers();
    },[])
    return (
        <>
        {
            loading ? 
            <Box sx={{ display: 'flex',height:"100vh",width:"100vw",alignItems:"center",justifyContent:"center" }}>
                <CircularProgress />
            </Box> : 
            <div style={{padding:"1.5rem"}}>
                <div style={{display:'flex',alignItems:'center'}}>
                    <Button
                        size='small'
                        style={{marginRight:"1rem"}}
                        disabled={currentView !== viewModesView}
                        onClick={() => {
                            setCurrentView(viewModesNew)
                            clearSuccessFailure();
                        }}
                        variant="contained"
                        color="secondary"
                    > CREATE NEW ELECTION
                    </Button>
                    <Button
                        size='small'
                        style={{marginRight:"1rem"}}
                        disabled={currentView !== viewModesEditable}
                        onClick={() => {
                            setCurrentView(viewModesEdit);
                        }}
                        variant="contained"
                        color="secondary"
                    >
                        EDIT
                    </Button>
                    <Button
                        size='small'
                        style={{marginRight:"1rem"}}
                        disabled={ currentView !== viewModesNew && currentView !== viewModesEdit }
                        variant="contained"
                        color="primary"
                        onClick={()=>{
                            clearSuccessFailure();
                            createElection();
                            // currentView === viewModesEdit ? modifyJournalEntry() : addJournalEntry();
                        }}
                    >
                        SAVE 
                    </Button>
                    <Button
                        size='small'
                        onClick={() => {
                            setCurrentView(viewModesView);
                            clearSuccessFailure();
                            clearFields();
                        }}
                        variant="contained"
                        color="inherit"
                        >
                        CANCEL
                    </Button>
                </div>
                <div style={{ marginTop: "1rem",marginBottom:"1rem" }}>
                    <Collapse in={openSuccess}>
                        <Alert
                            action={
                            <IconButton aria-label="close" color="inherit" onClick={() => {setOpenSuccess(false)}}>
                                <CloseIcon fontSize="inherit" />
                            </IconButton>
                            }
                        >{message}
                        </Alert>
                    </Collapse>
                    <Collapse in={openFailure}>
                        <Alert
                            severity="error"
                            action={
                                <IconButton aria-label="close" color="inherit" onClick={() => { setOpenFailure(false)}}>
                                    <CloseIcon fontSize="inherit" />
                                </IconButton>
                            }
                        > {message}
                        </Alert>
                    </Collapse>
                </div>
                <Grid container spacing={2} >
                    <Grid item xs={2}>
                        <TextField
                            disabled={currentView !== viewModesNew && currentView !== viewModesEdit}
                            fullWidth
                            id="standard-required"
                            label="Election Title"
                            variant="outlined"
                            size='small'
                            value={self.electiontitle}
                            onChange={e=> {
                                setSelf({...self,electiontitle:e.target.value});
                            }}
                        />
                    </Grid>
                    <Grid item xs={2}>
                        <FormControl fullWidth size='small'>
                            <InputLabel id="demo-simple-select-label" disabled={currentView !== viewModesNew && currentView !== viewModesEdit}>Election Type</InputLabel>
                            <Select
                                disabled={currentView !== viewModesNew && currentView !== viewModesEdit}
                                labelId="demo-simple-select-label"
                                id="demo-simple-select"
                                value={self.electiontype}
                                label="Election Type"
                                onChange={e=> {
                                    setSelf({...self,electiontype: e.target.value})
                            }}
                            >
                            <MenuItem value={"School"}>For School</MenuItem>
                            <MenuItem value={"College"}>For College</MenuItem>
                            <MenuItem value={"University"}>For University</MenuItem>
                            <MenuItem value={"Other"}>Other</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                minDateTime={currentDateTime}
                                maxDateTime={self.electionstartdate}
                                disablePast={true}
                                disabled={currentView !== viewModesNew && currentView !== viewModesEdit}
                                renderInput={(params) => <TextField {...params} size="small" label="Registration Start Date" />}
                                value={self.registrationstartdate}
                                onChange={(newValue) => {
                                    setSelf({...self,registrationstartdate: newValue})
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                minDateTime={self.registrationstartdate}
                                maxDateTime={self.electionstartdate}
                                disabled={currentView !== viewModesNew && currentView !== viewModesEdit}
                                renderInput={(params) => <TextField {...params} size="small" label="Registration End Date" />}
                                value={self.registrationenddate}
                                onChange={(newValue) => {
                                    setSelf({...self,registrationenddate: newValue})
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                disabled={currentView !== viewModesNew && currentView !== viewModesEdit}
                                renderInput={(params) => <TextField {...params} size="small" label="Election Start Date"/>}
                                value={self.electionstartdate}
                                minDateTime={self.registrationenddate}
                                onChange={(newValue) => {
                                    setSelf({...self,electionstartdate: newValue})
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={2}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DateTimePicker
                                minDateTime={self.electionstartdate || currentDateTime}
                                disabled={currentView !== viewModesNew && currentView !== viewModesEdit}
                                renderInput={(params) => <TextField {...params} size="small" label="Election End Date" />}
                                value={self.electionenddate}
                                onChange={(newValue) => {
                                    setSelf({...self,electionenddate: newValue})
                                }}
                            />
                        </LocalizationProvider>
                    </Grid>
                </Grid>
                <div style={{marginTop:"2rem",padding:"1rem",border:"1px solid",borderRadius:"10px"}}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={2}>
                            <TextField
                                disabled={currentView !== viewModesNew && currentView !== viewModesEdit}
                                fullWidth
                                id="standard-required"
                                label="Position Title"
                                variant="outlined"
                                size='small'
                                value={singlePosition.positiontitle}
                                onChange={e=> {
                                    setSinglePosition({...singlePosition,positiontitle:e.target.value});
                                }}
                            />
                        </Grid>
                        <Grid item xs={2}>
                            <TextField
                                disabled={currentView !== viewModesNew && currentView !== viewModesEdit}
                                fullWidth
                                type="number"
                                inputProps={{min:0}}
                                id="standard-required"
                                label="Number of Candidates"
                                variant="outlined"
                                size='small'
                                value={singlePosition.candidatesnumber}
                                onChange={e=> {
                                    setSinglePosition({...singlePosition,candidatesnumber:parseInt(e.target.value)});
                                }}
                            />
                        </Grid>
                        <Grid item xs={1}>
                            <Button
                                disabled={singlePosition.positiontitle === "" || isNaN(singlePosition.candidatesnumber) || singlePosition.candidatesnumber === 0}
                                onClick={() => {
                                    addPositionHandler();
                                }}
                                variant="contained"
                                color="primary"
                                >
                                <IoIosAddCircle style={{fontSize:"1.3rem"}}/>
                            </Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Collapse in={openSuccess2} style={{padding:0,margin:0}} >
                                <Alert
                                    style={{padding:0,margin:0,paddingLeft:"1rem",paddingRight:"1rem"}}
                                    action={
                                    <IconButton size='small' aria-label="close" color="inherit" onClick={() => {setOpenSuccess2(false)}}>
                                        <CloseIcon fontSize="inherit"/>
                                    </IconButton>
                                    }
                                >{message2}
                                </Alert>
                            </Collapse>
                            <Collapse in={openFailure2} style={{padding:0,margin:0}}>
                                <Alert
                                    style={{padding:0,margin:0,paddingLeft:"1rem",paddingRight:"1rem"}}
                                    severity="error"
                                    action={
                                        <IconButton size='small' aria-label="close" color="inherit" onClick={() => { setOpenFailure2(false)}}>
                                            <CloseIcon fontSize="inherit" />
                                        </IconButton>
                                    }
                                > {message2}
                                </Alert>
                            </Collapse>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2} justifyContent="center">
                        <Grid item xs={4}>
                            <Box sx={{ width: '100%', bgcolor: 'background.paper',marginTop:"1rem" }}>
                                <nav aria-label="main mailbox folders">
                                    <Typography textAlign="center" fontWeight="bold" style={{textDecoration:"underline"}}>Positions</Typography> 
                                    <Box
                                        sx={{ width: '100%', height: 360, bgcolor: 'background.paper',overflowY:"scroll" }}
                                    >
                                        <List>
                                            {
                                                allPositions.map(pos=> {
                                                    return (
                                                        <ListItem
                                                        secondaryAction={
                                                            <IconButton onClick={()=> {
                                                                deletePositionHandler(pos)
                                                            }} edge="end" aria-label="delete">
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        }
                                                        key={pos?.positiontitle} disablePadding style={selectedPosition?.positiontitle === pos?.positiontitle ? {backgroundColor:"#e3f2fd"} : {}}>
                                                            <ListItemButton onClick={()=> setSelectedPosition(pos)}>
                                                                <ListItemText primary={pos.positiontitle} />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    )
                                                })
                                            }
                                        </List>
                                    </Box>
                                </nav>
                            </Box>
                        </Grid>
                        <Grid item xs={8}>
                            <Box sx={{ width: '100%', bgcolor: 'background.paper',marginTop:"1rem" }}>
                                <nav aria-label="main mailbox folders">
                                    <Typography textAlign="center" fontWeight="bold" style={{textDecoration:"underline"}}>Candidates</Typography>
                                        <Grid container spacing={2} style={{paddingTop:"0.5rem"}} alignItems="center" justifyContent="center">
                                            <Grid item xs={3}>
                                                <Autocomplete
                                                    disabled={!selectedPosition || selectedPosition?.candidatesnumber - selectedPosition?.candidates?.length === 0}
                                                    size="small"
                                                    value={singleCandidate}
                                                    onChange={(event, newValue) => {
                                                        newValue? setSingleCandidate(newValue) : setSingleCandidate(null);
                                                    }}
                                                    id="controllable-states-demo"
                                                    fullWidth
                                                    options={allUsers}
                                                    getOptionLabel={(option) => option?.username}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Select User"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Box style={{display:'flex',justifyContent:'flex-start'}}>
                                                    <label htmlFor='photo'>
                                                        {
                                                            <Chip icon={<MdFileUpload style={{transform: "scale(1.8)"}}/>} 
                                                            label={singleCandidateSymbol.photobase64 && typeof(singleCandidateSymbol.photobase64)!=='string'?
                                                            singleCandidateSymbol.photobase64?.name?.substring(0,15) : "Upload Symbol "}  
                                                            clickable 
                                                            color='info' 
                                                            style={{padding:'1rem',width:"10rem",display:"flex",justifyContent:"flex-start"}} 
                                                            disabled={singleCandidate===null || selectedPosition?.candidatesnumber - selectedPosition?.candidates?.length === 0}
                                                            />
                                                        }
                                                    </label>
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        color="inherit"
                                                        style={{marginLeft:'.5rem'}}
                                                        disabled={singleCandidateSymbol.photopath==="" && singleCandidateSymbol.photobase64===null}
                                                        onClick={()=> {
                                                            setSingleCandidateSymbol({...singleCandidateSymbol,photopath: "", photobase64: null})
                                                            }}
                                                        >
                                                        Clear
                                                    </Button>
                                                    <input type="file" id='photo' accept=".png, .jpg" style={{display:'none'}}
                                                    disabled={singleCandidate===null || selectedPosition?.candidatesnumber - selectedPosition?.candidates?.length === 0}
                                                        onChange={e=> {
                                                            setSingleCandidateSymbol({...singleCandidateSymbol,photopath:"",photobase64: (e.target.files?.length) ? (e.target?.files[0]) : null});
                                                            e.target.value = "";
                                                        }}
                                                    />
                                                </Box>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <Button
                                                    disabled={singleCandidate===null || selectedPosition?.candidatesnumber - selectedPosition?.candidates?.length === 0 || (singleCandidateSymbol.photobase64===null && singleCandidateSymbol.photopath==="")}
                                                    onClick={() => {
                                                        addCandidateHandler();
                                                    }}
                                                    variant="contained"
                                                    color="primary"
                                                    >
                                                    <IoIosAddCircle style={{fontSize:"1.3rem"}}/>
                                                </Button>
                                            </Grid>
                                            <Grid item xs={2}>
                                                {   selectedPosition && 
                                                    <Chip label={selectedPosition?.candidatesnumber - selectedPosition?.candidates?.length === 0 ? "No Candidate Remaining" : selectedPosition?.candidatesnumber - selectedPosition?.candidates?.length + " Candidates Remaining"} color={selectedPosition?.candidatesnumber - selectedPosition?.candidates?.length === 0 ?"success": "error"} />
                                                }
                                            </Grid>
                                        </Grid>
                                    <Box
                                        sx={{ width: '100%', height: 300, bgcolor: 'background.paper',overflowY:"scroll" ,marginTop:"1rem"}}
                                    >
                                        <List>
                                            {
                                                selectedPosition?.candidates?.map((cd,i)=> {
                                                    return (
                                                        <nav key={cd?.username} >
                                                            <ListItem
                                                            alignItems="flex-start"
                                                            secondaryAction={
                                                                <IconButton onClick={()=> {
                                                                    deleteCandidateHandler(cd)
                                                                }} edge="end" aria-label="delete">
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            }
                                                            disablePadding
                                                            >
                                                                    <div style={{display:"flex",flexDirection:"column"}}>
                                                                        <ListItemAvatar>
                                                                            <Avatar src={apiBaseUrl+"/"+cd?.photopath} />
                                                                        </ListItemAvatar>
                                                                        <ListItemAvatar>
                                                                            <Avatar src={selectedPosition.symbols[i]?.photopath ? (apiBaseUrl+"/"+""+selectedPosition.symbols[i]?.photopath) : selectedPosition.symbols[i]?.photobase64 ? URL.createObjectURL(selectedPosition.symbols[i]?.photobase64) : ""} alt="Candidate Symbol Image" />
                                                                        </ListItemAvatar>
                                                                    </div>
                                                                <ListItemButton>
                                                                    <ListItemText primary={cd?.username} primaryTypographyProps={{style:{fontWeight:"bold"}}}
                                                                    secondary={
                                                                        <React.Fragment>
                                                                          <Typography color="text.primary">{cd?.fullname}</Typography>
                                                                          <Typography>{cd?.email}</Typography>
                                                                          <Typography>{`${cd?.city}, ${cd?.country}`}</Typography>
                                                                        </React.Fragment>
                                                                      }/>
                                                                </ListItemButton>
                                                            </ListItem>
                                                            <Divider variant="inset" component="li" />
                                                        </nav>
                                                    )
                                                })
                                            }
                                        </List>
                                    </Box>
                                </nav>
                            </Box>
                        </Grid>
                    </Grid>
                </div>
            </div>
        }
        </>
    );
};

export default CreateElection;