import { Sidebar, Menu, MenuItem, SubMenu } from 'react-pro-sidebar';
import "../css/App.css";
export default function AdminNavbar() {



    const wroclawApi = async () =>{
        window.alert("LOADING DATA FROM WROCLAW API!");
       await fetch(`${process.env.REACT_APP_URL}/api/events/data`);
        window.alert("DATA LOADED SUCCESFULLY");
    }



    const globalApi = async () =>{
        window.alert("LOADING DATA FROM GLOBAL API!");
        await fetch(`${process.env.REACT_APP_URL}/api/events/global-data`);
        window.alert("DATA LOADED SUCCESFULLY");
    }


    return (<>
            <header>
                <a href="/home" className="logo">Event Helper</a>
                <ul>
                    <li>
                        <a href="/user/user-list">Users list</a>
                    </li>
                    <li>
                        <a href="/event/event-list">Events list</a>
                    </li>
                    <li>
                        <a onClick={wroclawApi}>Update Wroclaw data </a>
                    </li>
                    <li>
                        <a onClick={globalApi}>Update Global data </a>
                    </li>
                    <li>
                        <a id="user-name" href="/home">Home</a>
                    </li>

                </ul>
            </header>
        </>
    )
}