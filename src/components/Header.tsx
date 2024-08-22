import Nav from "@components/Nav";

type Props = {};

const Header: React.FC<Props> = () => {
  return (
    <header className="header">
      <Nav></Nav>
    </header>
  );
};

export default Header;
