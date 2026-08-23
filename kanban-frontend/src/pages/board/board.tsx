import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { publicInstance } from "../../common/api";
import { Column } from "../../components/column/column";
import type { Card } from "../../components/card/card";
import { CardModal } from "../../components/cardModal/cardModal";
import "./board.css";
import { useNavigate } from "react-router-dom";

const columns = [
  { title: "To do", color: "#2563eb", status: "todo" },
  { title: "In progress", color: "#d97706", status: "in_progress" },
  { title: "Done", color: "#059669", status: "done" },
];

export const BoardPage = () => {
  const { id } = useParams();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [cardModal, setCardModal] = useState<boolean>(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [cardStatus, setCardStatus] = useState<string>("todo");
  const [draggedCard, setDraggedCard] = useState<Card | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchCards = async () => {
      if (!id) {
        navigate("/");
        return;
      }

      setLoading(true);
      setError(false);
      try {
        const response = await publicInstance.get(`/card/board/${id}`);
        setCards(response.data);
      } catch (requestError) {
        console.error(requestError);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, [id]);

  const cardsByStatus = (status: string) =>
    cards.filter((card) => card.status === status);

  const openCardModal = (status: string, card?: Card) => {
    setEditingCard(card ?? null);
    setCardStatus(status);
    setCardModal(true);
  };

  const closeCardModal = () => {
    setEditingCard(null);
    setCardModal(false);
  };

  const handleDrop = async (targetStatus: string, targetIndex: number) => {
    if (!draggedCard) return;

    const sourceStatus = draggedCard.status ?? "todo";
    const sourceCards = cardsByStatus(sourceStatus);
    const sourceIndex = sourceCards.findIndex(
      (card) => card.id === draggedCard.id,
    );
    const adjustedIndex =
      sourceStatus === targetStatus && sourceIndex < targetIndex
        ? targetIndex - 1
        : targetIndex;
    const nextCards = cards.filter((card) => card.id !== draggedCard.id);
    const destinationCards = nextCards.filter((card) => {
      return card.status === targetStatus;
    });
    const movedCard = {
      ...draggedCard,
      status: targetStatus,
      position: adjustedIndex,
    };
    const destinationId = destinationCards[adjustedIndex]?.id;
    const insertAt = destinationId
      ? nextCards.findIndex((card) => card.id === destinationId)
      : nextCards.length;
    nextCards.splice(insertAt, 0, movedCard);
    setCards(nextCards);
    setDraggedCard(null);

    try {
      await publicInstance.patch(`card/${draggedCard.id}`, {
        status: targetStatus,
        position: adjustedIndex,
      });
    } catch (requestError) {
      console.error(requestError);
      setCards(cards);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const deleteCard = async (card: Card) => {
    try {
      await publicInstance.delete(`card/${card.id}`);
      setCards((_prev) =>
        _prev.filter((currentCard) => currentCard.id !== card.id),
      );
    } catch (requestError) {
      console.error(requestError);
    }
  };

  return (
    <section className="board-page">
      <div className="board-page__heading">
        <div>
          <h2 className="board-page__title">Board: {id}</h2>
        </div>
        {
          <span className="board-page__count">
            {cards ? cards.length : 0} cards
          </span>
        }
      </div>
      {loading && <p className="board-page__message">Loading cards...</p>}
      {error && (
        <p className="board-page__message board-page__message--error">
          Could not call api.
        </p>
      )}
      {!loading && !error && (
        <div className="board-page__columns">
          {columns.map((column) => (
            <Column
              key={column.status}
              title={column.title}
              color={column.color}
              status={column.status}
              cards={cardsByStatus(column.status)}
              OpenModal={openCardModal}
              OnDelete={deleteCard}
              OnDragStart={setDraggedCard}
              OnDragOver={handleDragOver}
              OnDrop={handleDrop}
            />
          ))}
        </div>
      )}
      {cardModal && id && (
        <CardModal
          Close={closeCardModal}
          OnSuccess={ async () => {
            const response = await publicInstance.get(`/card/board/${id}`);
            setCards(response.data);
          }}
          boardId={id}
          status={cardStatus}
          card={editingCard ?? undefined}
        />
      )}
    </section>
  );
};
