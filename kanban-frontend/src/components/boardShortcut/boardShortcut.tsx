import { useNavigate } from "react-router-dom";
import type { Board } from "../../pages/main/main";
import "./boardShortcut.css";

type Props = Board & {
  OnDelete: (board: Board) => void;
  OnEdit: (board: Board) => void;
};

export const BoardShortcut = ({
  id,
  title,
  publicId,
  description,
  OnDelete,
  OnEdit,
}: Props) => {
  const navigate = useNavigate();

  const onClick = () => navigate(`/board/${publicId}`);

  const copyPublicId = async (event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    await navigator.clipboard.writeText(publicId);
  };

  const onDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    OnDelete({ id, title, publicId, description });
  };

  const onEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    OnEdit({ id, title, publicId, description });
  };

  return (
    <div className="board-shortcut" onClick={onClick}>
      <h2 className="board-shortcut__title">
        {title}{" "}
        <span
          className="board-shortcut__public_id"
          onClick={copyPublicId}
          role="button"
        >
          #{publicId}
        </span>
      </h2>
      <hr />
      <p className="board-shortcut__description">{description}</p>
      <div className="board-shortcut__controls">
        <button
          className="board-shortcut__control"
          onClick={onDelete}
        >
          delete
        </button>
        <button className="board-shortcut__control" onClick={onEdit}>
          edit
        </button>
      </div>
    </div>
  );
};
