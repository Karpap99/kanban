import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import { Main } from "./pages/main";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" index element={<Main/>}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
