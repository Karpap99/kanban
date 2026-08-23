import { useEffect, useState } from "react";
import { publicInstance } from "../../common/api";
import { BoardShortcut } from "../../components/boardShortcut/boardShortcut";
import "./main.css";
import { BoardModal } from "../../components/boardModal/boardModal";

export type Board = {
  id: string;
  title: string;
  description: string;
  publicId: string;
};

const BOARDS_LIMIT = 12;

export const Main = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const [modal, setModal] = useState<boolean>(false);
  const [editingBoard, setEditingBoard] = useState<Board | null>(null);

  const fetchBoards = async () => {
    try {
      const response = await publicInstance.get("/board", {
        params: {
          search,
          limit: BOARDS_LIMIT,
          page,
        },
      });

      setBoards(response.data.items);
      setTotal(response.data.count);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const load = async () => {
      fetchBoards();
    };
    load();
  }, [search, page]);

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const totalPages = Math.max(1, Math.ceil(total / BOARDS_LIMIT));

  const openModal = (board?: Board) => {
    console.log(board);
    setEditingBoard(board ?? null);
    setModal(true);
  };

  const closeModal = () => {
    setEditingBoard(null);
    setModal(false);
  };

  const deleteBoard = async (board: Board) => {
    try {
      await publicInstance.delete(`board/${board.id}`);
      await fetchBoards();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div className="board-list">
        <div className="board-list__search-wrapper">
          <form className="board-list__search" onSubmit={submitSearch}>
            <input
              placeholder="Search board by ID"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit">Search</button>
            <button type="button" onClick={() => openModal()}>
              +
            </button>
          </form>
        </div>
        <div>
          <h2 style={{ margin: 0 }}>Boards({total}):</h2>
          <div className="board-list__grid">
            {boards.map((board) => (
              <BoardShortcut
                key={board.id}
                id={board.id}
                publicId={board.publicId}
                description={board.description}
                title={board.title}
                OnDelete={deleteBoard}
                OnEdit={() => openModal(board)}
              />
            ))}
          </div>
        </div>

        <div className="board-list__pagination">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((_prev) => _prev - 1)}
          >
            Previous
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((_prev) => _prev + 1)}
          >
            Next
          </button>
        </div>
      </div>
      {modal && (
        <BoardModal
          Close={closeModal}
          OnSuccess={fetchBoards}
          board={editingBoard ?? undefined}
        />
      )}
    </>
  );
};
