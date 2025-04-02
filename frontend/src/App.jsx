import Navbar from './components/navbars/Navbar';
import GuestNavbar from './components/navbars/GuestNavbar';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchCurrentUser, setAuthChecked, clearUserState } from './redux/slices/userSlice';
import { Loader } from 'lucide-react';

function App() {
  const dispatch = useDispatch();
  const { authChecked, isLoggedIn } = useSelector((state) => state.users);

  // Fetch Current User and handle authentication state
  useEffect(() => {
    const checkAuth = async () => {
      if (!authChecked) {
        try {
          // Try to fetch user data - the token will be automatically sent with the request
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          // If fetch fails, clear the state
          dispatch(clearUserState());
          dispatch(setAuthChecked(true));
        }
      }
    };

    checkAuth();
  }, [dispatch, authChecked]);

  // Connect socket only when user is logged in
  useEffect(() => {
    if (authChecked && isLoggedIn) {
      const timer = setTimeout(() => {
        dispatch({ type: "socket/connectSocket" });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [dispatch, authChecked, isLoggedIn]);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-base-100 min-h-screen">
        {isLoggedIn ? <Navbar /> : <GuestNavbar />}
        <div className="container mx-auto px-2 py-16">
          <AppRoutes />
        </div>
        <Toaster position="top-right" reverseOrder={false} />
      </div>
    </>
  );
}

export default App;
