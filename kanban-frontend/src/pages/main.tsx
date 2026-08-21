import { useEffect, useState } from "react";
import { publicInstance } from "../common/api";
import { BoardShortcut } from "../components/boardShortcut/boardShortcut";

export const Main = () => {
  const [boards, setBoards] = useState<any[]>([]);

  const fetchBoards = async () => {
    try {
      const response = await publicInstance.get("/board");

      console.log(response);

      setBoards(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  return (
    <>
      {boards.map((value) => (
        <BoardShortcut id={value.id} title={value.title} description={value.description}></BoardShortcut>
      ))}
    </>
  );
};
