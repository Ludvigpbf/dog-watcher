import { Link } from "react-router-dom";

type Props = {};

const Nav: React.FC<Props> = () => {
 /*  const openMenu = () => {
    alert("Mmenu clicked");
  }; */

  return (
    <nav className="menu">
      {/*       <button onClick={openMenu}>menu</button>
       */}{" "}
      <Link to="/">Home</Link>
      <Link to="/new-audio">New Audio</Link>
    </nav>
  );
};

export default Nav;
