import Button from "@components/Button";
import Feed from "@components/Feed";

type Props = {};

const Landing: React.FC<Props> = () => {
  return (
    <section className="landing-section">
      <h1>Landing</h1>
      <Feed />
      <Button title="" text="Play" />
    </section>
  );
};

export default Landing;
