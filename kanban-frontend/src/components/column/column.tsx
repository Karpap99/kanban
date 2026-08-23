import { useState } from "react";
import { CardItem } from "../card/card";
import type { Card } from "../card/card";
import "./column.css";

type Props = {
  title: string;
  color: string;
  status: string;
  cards: Card[];
  OpenModal: (status: string, card?: Card) => void;
  OnDelete: (card: Card) => void;
  OnDragStart: (card: Card) => void;
  OnDragOver: (event: React.DragEvent<HTMLElement>) => void;
  OnDrop: (status: string, index: number) => void;
};

export const Column = ({
  title,
  color,
  status,
  cards,
  OpenModal,
  OnDelete,
  OnDragStart,
  OnDragOver,
  OnDrop,
}: Props) => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleDragEnter = () => {
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLElement>) => {
    const nextElement = event.relatedTarget as Node | null;
    if (!nextElement || !event.currentTarget.contains(nextElement)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (status: string, index: number) => {
    setIsDragOver(false);
    OnDrop(status, index);
  };

  return (
    <section
      className={`kanban-column${isDragOver ? " kanban-column--drag-over" : ""}`}
      style={{ "--column-color": color } as React.CSSProperties}
      onDragOver={OnDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={() => handleDrop(status, cards.length)}
    >
      <header className="kanban-column__header">
        <h2 className="kanban-column__title">{title}</h2>
        <span className="kanban-column__count">{cards.length}</span>
      </header>
      <div className="kanban-column__cards">
        {cards.map((card, index) => (
          <CardItem
            key={card.id}
            card={card}
            index={index}
            status={status}
            OnEdit={() => OpenModal(status, card)}
            OnDelete={OnDelete}
            OnDragStart={OnDragStart}
            OnDragOver={OnDragOver}
            OnDrop={handleDrop}
          />
        ))}
          <button
            className="kanban-column__add"
            type="button"
            onClick={() => OpenModal(status)}
          >
            + Add card
          </button>
      </div>
    </section>
  );
};
