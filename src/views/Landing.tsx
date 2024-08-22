import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { startBroadcast } from "@redux/slices/broadcastSlice";
import { startViewing } from "@redux/slices/viewerSlice";
import { useNavigate } from "react-router-dom";

type Props = {};
const Landing: React.FC<Props> = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleStartBroadcast = () => {
    dispatch(startBroadcast());
    navigate("/feed", { state: { feedId: "feed", role: "broadcaster" } });
    console.log("start broadcast");
  };

  const handleStartViewing = () => {
    dispatch(startViewing());
    navigate("/feed", { state: { feedId: "feed", role: "viewer" } });
    console.log("start viewing");
  };

  return (
    <section className="landing-section">
      <div className="hero-container">
        <h1>{t("landing.hero.title")}</h1>
        <button className="feed-btn" onClick={handleStartBroadcast}>
          {t("landing.hero.startFeed")}
        </button>
        <button className="feed-btn" onClick={handleStartViewing}>
          {t("landing.hero.watchFeed")}
        </button>
      </div>
    </section>
  );
};

export default Landing;
