import { BrowserRouter, Route, Routes } from "react-router";
import "./App.css";
import { Main } from "./pages/main/main";
import { BoardPage } from "./pages/board/board";
import { Layout } from "./components/layout/layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="" element={<Layout></Layout>}>
          <Route path="" index element={<Main/>}/>
          <Route path="/board/:id" element={<BoardPage/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
