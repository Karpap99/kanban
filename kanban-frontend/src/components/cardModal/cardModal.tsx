import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { publicInstance } from "../../common/api";
import type { Card } from "../card/card";
import "./cardModal.css";

type Props = {
  Close: () => void;
  OnSuccess?: () => void | Promise<void>;
  boardId: string;
  status: string;
  card?: Card;
};

export const CardModal = ({
  Close,
  OnSuccess,
  boardId,
  status,
  card,
}: Props) => {
  const editMode = !!card;
  const [title, setTitle] = useState<string>(card?.title ?? "");
  const [description, setDescription] = useState<string>(
    card?.description ?? "",
  );
  const [titleError, setTitleError] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setTitle(card?.title ?? "");
      setDescription(card?.description ?? "");
      setTitleError(false);
    };

    load();
  }, [card]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const titleValue = title.trim();
    const hasError = titleValue.length < 3
    setTitleError(() => hasError);

    if (hasError) return;

    const payload = {
      boardId,
      title: titleValue,
      description: description.trim(),
      status,
    };

    try {
      if (editMode) {
        await publicInstance.patch(`card/${card.id}`, payload);
      } else {
        await publicInstance.post("card/", payload);
      }
      await OnSuccess?.();
      Close();
    } catch (error) {
      console.error(error);
    }
  };

  return createPortal(
    <div className="card-modal">
      <form className="card-modal__form" onSubmit={submit}>
        <div className="card-modal__field">
          <label className="card-modal__field-label" htmlFor="card-title">
            Title
          </label>
          <input
            id="card-title"
            className="card-modal__input"
            name="title"
            value={title}
            onChange={(e) => {
              const value = e.target.value;
              setTitle(value);
              setTitleError(value.trim().length < 3);
            }}
          />
          {titleError && (
            <div className="card-modal__error" id="card-title-error">
              Title must be at least 3 characters.
            </div>
          )}
        </div>
        <div className="card-modal__field">
          <label className="card-modal__field-label" htmlFor="card-description">
            Description
          </label>
          <textarea
            id="card-description"
            className="card-modal__textarea"
            name="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="card-modal__actions">
          <button
            className="card-modal__button card-modal__button--submit"
            type="submit"
          >
            {editMode ? "Save" : "Create"}
          </button>
          <button
            className="card-modal__button card-modal__button--cancel"
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
