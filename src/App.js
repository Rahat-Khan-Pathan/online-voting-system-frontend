import './App.css';
import SignUp from './Modules/SignUp';
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Login from './Modules/Login';
import Register from './Modules/Register';
import { createContext, useEffect, useState } from 'react';
import Home from './Modules/Home';
import axios from 'axios';
import { apiBaseUrl } from './config';
import { CircularProgress, Box } from '@mui/material';
import CreateElection from './Modules/CreateElection';
import ViewAllElections from './Modules/ViewAllElections';

const ParentContext = createContext();  
function App() {
  // States
  const [loadingUser,setLoadingUser] = useState(true);
  const [ovsUser,setOvsUser] = useState(null);

  // Helper functions
  const checkUser = (userId)=> {
    axios({
        method: "POST",
        url: `${apiBaseUrl}/users/get_user_by_id/${userId}`,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
            if(res.data.results) {
                setOvsUser(res.data.results);
            }
            setLoadingUser(false); 
        })
        .catch((err) => {
            setLoadingUser(false);  
    });
  }

  // Useeffects
  useEffect(()=>{
    const userId = localStorage.getItem("ovs_user");
    if(!ovsUser && userId) {
      checkUser(userId);
    } else {
      setLoadingUser(false);
    }
},[])
  return (
    <div>
      <ParentContext.Provider value={{ovsUser, setOvsUser}}>
        {  
          loadingUser ? 
          <Box sx={{ display: 'flex',height:"100vh",width:"100vw",alignItems:"center",justifyContent:"center" }}>
              <CircularProgress />
          </Box> : 
          <Router>
            <Routes>
                {/* Home  */}
                <Route path="/" element={ovsUser && ovsUser.registered ? <Home/> : ovsUser && !ovsUser.registered ? <Register/> : <Login/>}></Route>

                {/* Home  */}
                <Route path="/home" element={ovsUser && ovsUser.registered ? <Home/> : ovsUser && !ovsUser.registered ? <Register/> : <Login/>}></Route>

                {/* SignUp  */}
                <Route path='/signUp' element={ovsUser && ovsUser.registered ? <Home/> : ovsUser && !ovsUser.registered ? <Register/> : <SignUp/> }/>

                {/* Login  */}
                <Route path='/login' element={ovsUser && ovsUser.registered ? <Home/> : ovsUser && !ovsUser.registered ? <Register/> : <Login/>}/>

                {/* Register  */}
                <Route path='/register' element={ovsUser && ovsUser.registered ? <Home/> : ovsUser && !ovsUser.registered ? <Register/> : <Login/>}/>

                {/* Create Election  */}
                <Route path='/create-election' element={ovsUser && ovsUser.registered ? <CreateElection/> : ovsUser && !ovsUser.registered ? <Register/> : <Login/>}/>

                {/* View All Elections  */}
                <Route path='/view-all-elections' element={ovsUser && ovsUser.registered ? <ViewAllElections/> : ovsUser && !ovsUser.registered ? <Register/> : <Login/>}/>
            </Routes>
          </Router>
        }
      </ParentContext.Provider>
    </div>
  );
}

export default App;
export {ParentContext};
