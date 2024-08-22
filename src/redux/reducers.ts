import { combineReducers } from "redux";
import pageReducer from "@redux/slices/pageSlice";
import menuReducer from "@redux/slices/menuSlice";
import languageReducer from "@redux/slices/languageSlice";
import broadcastReducer from "@redux/slices/broadcastSlice";
import viewerSlice from "@redux/slices/viewerSlice";
import webrtcReducer from "@redux/slices/webrtcSlice";

const rootReducer = combineReducers({
  pages: pageReducer,
  menu: menuReducer,
  lang: languageReducer,
  broadcast: broadcastReducer,
  viewer: viewerSlice,
  webrtc: webrtcReducer,
});

export default rootReducer;
