import "./boardShortcut.css";

type Props = {
  title: string;
  description: string;
  id: string;
};

export const BoardShortcut = ({ title, description, id }: Props) => {
  return (
    <div className="board-shortcut">
      <h2 className="board-shortcut__title">
        {title} <span className="board-shortcut__public_id">#{id}</span>
      </h2>
      <hr />
      <p className="board-shortcut__description">{description}</p>
      <div className="board-shortcut__controls">
        <button className="board-shortcut__control">delete</button>
        <button className="board-shortcut__control">edit</button>
      </div>
    </div>
  );
};
