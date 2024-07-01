import './App.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import DriverMap from './DriverMap';
import Login from './Login';
import DriverProfile from './DriverProfile';
import Pusher from "pusher-js";

const router = createBrowserRouter([
 
  {
    path: '/driver-map',
    element: <DriverMap />
  },
  {
    path: '/',
    element: <Login />
  },{
    path: '/profile',
    element: <DriverProfile />
  },
]);
const App = () => {
  
  return (
    
    <RouterProvider router={router} />
  );
};


export default App;
