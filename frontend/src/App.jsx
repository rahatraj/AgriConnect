import Navbar from './components/navbars/Navbar';
import GuestNavbar from './components/navbars/GuestNavbar';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchCurrentUser, setAuthChecked, clearUserState } from './redux/slices/userSlice';
import { Loader } from 'lucide-react';
import FloatingChatbot from './chatbot/FloatingChatbot';

function App() {
  const dispatch = useDispatch();
  const { authChecked, isLoggedIn } = useSelector((state) => state.users);


  const hasClientLoginFlag = localStorage.getItem("isLoggedIn") === "true";
  useEffect(() => {
    const checkAuth = async () => {
      if (!authChecked && hasClientLoginFlag) {
        try {
          await dispatch(fetchCurrentUser()).unwrap();
        } catch (error) {
          // If fetch fails, clear the state
          dispatch(clearUserState());
        }finally{
          dispatch(setAuthChecked(true));
        }
      }
    };

    checkAuth();
  }, [dispatch, authChecked, isLoggedIn]);

  useEffect(() => {
    if (authChecked && isLoggedIn) {
      const timer = setTimeout(() => {
        dispatch({ type: "socket/connectSocket" });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [dispatch, authChecked, isLoggedIn]);

  if (!authChecked && hasClientLoginFlag) {
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
        {isLoggedIn && <FloatingChatbot />}
        <Toaster position="bottom-right" reverseOrder={false} />
      </div>
    </>
  );
}

export default App;
