import Footer from "@components/Footer";
import Header from "@components/Header";
import "@styles/App.css";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
