import "./card.css";

export type Card = {
	id: string;
	title: string;
	description?: string;
	status?: string;
	position?: number;
}

type Props = {
	card: Card;
	index: number;
	status: string;
	OnEdit: (card: Card, status: string) => void;
	OnDelete: (card: Card) => void;
	OnDragStart: (card: Card) => void;
	OnDragOver: (event: React.DragEvent<HTMLElement>) => void;
	OnDrop: (status: string, index: number) => void;
}

export const CardItem = ({ card, index, status, OnEdit, OnDelete, OnDragStart, OnDragOver, OnDrop }: Props) => {
	return (
		<article
			className="kanban-card"
			draggable
			onDragStart={() => OnDragStart(card)}
			onDragOver={OnDragOver}
			onDrop={(event) => {
				event.stopPropagation();
				OnDrop(status, index);
			}}
		>
			<h3 className="kanban-card__title">{card.title}</h3>
			<hr className="kanban-card__divider" />
			{card.description && <p className="kanban-card__description">{card.description}</p>}
			<div className="kanban-card__controls">
				<button className="kanban-card__control" type="button" onClick={() => OnEdit(card, status)}>
					Edit
				</button>
				<button className="kanban-card__control kanban-card__control--delete" type="button" onClick={() => OnDelete(card)}>
					Delete
				</button>
			</div>
		</article>
	);
};
