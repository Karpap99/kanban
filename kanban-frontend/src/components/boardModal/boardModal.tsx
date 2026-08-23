import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import "./boardModal.css";
import { publicInstance } from "../../common/api";

type BoardData = {
  id: string;
  title: string;
  description: string;
};

type Props = {
  Close: () => void;
  OnSuccess?: () => void | Promise<void>;
  board?: BoardData;
};

export const BoardModal = ({ Close, OnSuccess, board }: Props) => {
  const editMode = !!board;
  const [title, setTitle] = useState<string>(board?.title ?? "");
  const [description, setDescription] = useState<string>(
    board?.description ?? "",
  );
  const [titleError, setTitleError] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setTitle(board?.title ?? "");
      setDescription(board?.description ?? "");
      setTitleError(false);
    };

    load();
  }, [board]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const titleValue = title.trim();
    const hasError = titleValue.length < 3;
    setTitleError(() => hasError);

    if (hasError) return;

    const payload = {
      title: titleValue,
      description: description.trim(),
    };

    try {
      if (editMode) {
        await publicInstance.patch(`board/${board?.id}`, payload);
      } else {
        await publicInstance.post("board/", payload);
      }
      await OnSuccess?.();
      Close();
    } catch (error) {
      console.error(error);
    }
  };

  return createPortal(
    <div className="board-modal">
      <form className="board-modal__form" onSubmit={submit}>
        <div className="board-modal__field">
          <label className="board-modal__field-label" htmlFor="board-title">
            Title
          </label>
          <input
            id="board-title"
            className="board-modal__input"
            name="title"
            value={title}
            onChange={(e) => {
              const value = e.target.value;
              setTitle(value);
              setTitleError(value.trim().length < 3);
            }}
          />
          {titleError && (
            <div className="board-modal__error" id="board-title-error">
              Title must be at least 3 characters.
            </div>
          )}
        </div>
        <div className="board-modal__field">
          <label
            className="board-modal__field-label"
            htmlFor="board-description"
          >
            Description
          </label>
          <textarea
            id="board-description"
            className="board-modal__textarea"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="board-modal__actions">
          <button
            className="board-modal__button board-modal__button--submit"
            type="submit"
          >
            {editMode ? "Save" : "Create"}
          </button>
          <button
            className="board-modal__button board-modal__button--cancel"
            type="button"
            onClick={Close}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
};
