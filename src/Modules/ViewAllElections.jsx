import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TableSortLabel, Tooltip } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { apiBaseUrl } from '../config';

// Initial sortig type for table data
const headCells = [
  { id: 'electiontitle', numeric: false, label: 'Title' },
  { id: 'electiontype', numeric: true, label: 'Type' },
  { id: 'registrationstartdate', numeric: true, label: 'Registration Start' },
  { id: 'registrationenddate', numeric: true, label: 'Registration End' },
  { id: 'electionstartdate', numeric: true, label: 'Election Start' },
  { id: 'electionenddate', numeric: true, label: 'Election End' },
  { id: 'createdby', numeric: true, label: 'Created By' }
];
function descendingComparator(a, b, orderBy) {
  if(typeof a[orderBy] === 'string') {
    if (b[orderBy].trim().toLowerCase() < a[orderBy].trim().toLowerCase()) {
      return -1;
    }
    if (b[orderBy].trim().toLowerCase() > a[orderBy].trim().toLowerCase()) {
        return 1;
    }
    return 0;
  }
  else if(typeof a[orderBy] === 'number') {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
  }
  else {
    if (b[orderBy].name === undefined) {
      return 1;
    }
    if (a[orderBy].name === undefined) {
      return -1;
    }
    if (b[orderBy]?.name?.trim()?.toLowerCase() < a[orderBy]?.name?.trim()?.toLowerCase()) {
      return -1;
    }
    if (b[orderBy]?.name?.trim()?.toLowerCase() > a[orderBy]?.name?.trim()?.toLowerCase()) {
        return 1;
    }
    return 0;
  }
}
function getComparator(order, orderBy) {
  return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
}
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const ViewAllElections = () => {
    // Clasess
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('datetime');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [allElections,setAllElections] = useState([]);

    // Helper functions
    const getAllElections = ()=> {
        axios({
            method: "POST",
            url: `${apiBaseUrl}/elections/get_all_populated`,
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify({}),
          })
            .then((res) => {
              res.data.results
                ? setAllElections(res.data.results)
                : setAllElections([]);
                console.log(res.data.results);
            })
            .catch((err) => {
              console.log(err);
        });
    }
    const createSortHandler = (property) => (event) => {
      handleRequestSort(event, property);
    };
    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };
    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
    // Useeffects
    useEffect(()=> {
        getAllElections();
    },[])
    return (
        <div>
            <div>
                <Paper elevation={2}>
                    <TableContainer style={{maxHeight:"70vh"}}>
                        <Table
                        size="small"
                        stickyHeader 
                        aria-label="sticky table"
                        >
                        <TableHead TableRow>
                            <TableRow>
                            {headCells.map((headCell) => {
                                return (
                                <TableCell
                                    style={{ backgroundColor: "#6c63ff" }}
                                    key={headCell.id}
                                    align={headCell.numeric ? 'right' : 'left'}
                                    sortDirection={orderBy === headCell.id ? order : false}
                                >
                                    <Tooltip title={`${(order==='asc')? 'ascending' : 'descending' }`}>
                                        <TableSortLabel
                                            active={orderBy === headCell.id}
                                            direction={orderBy === headCell.id ? order : 'asc'}
                                            onClick={createSortHandler(headCell.id)}
                                        >
                                    
                                        {headCell.label}
                                        {orderBy === headCell.id ? (
                                            <span hidden>
                                                {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                            </span>
                                        ) : null}
                                        </TableSortLabel>
                                    </Tooltip>
                                </TableCell>
                                )})}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stableSort(allElections, getComparator(order, orderBy)).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)?.map((row) => (
                                <TableRow hover key={row?._id}>
                                    <TableCell>
                                    {row?.electiontitle}
                                    </TableCell>
                                    <TableCell align="right">{row?.electiontype}</TableCell>
                                    <TableCell align="right">{new Date(row?.registrationstartdate).toLocaleString()}</TableCell>
                                    <TableCell align="right">{new Date(row?.registrationenddate).toLocaleString()}</TableCell>
                                    <TableCell align="right">{new Date(row?.electionstartdate).toLocaleString()}</TableCell>
                                    <TableCell align="right">{new Date(row?.electionenddate).toLocaleString()}</TableCell>
                                    <TableCell align="right">
                                    {row?.createdby?.username}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                    rowsPerPageOptions={[10, 25, 50]}
                    component="div"
                    count={allElections.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </div>
        </div>
    );
};

export default ViewAllElections;