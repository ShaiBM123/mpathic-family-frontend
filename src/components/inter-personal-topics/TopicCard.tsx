import React from 'react';
import { Card } from 'react-bootstrap';
import { getSVGURI } from "../../AppUtils";
import * as FASolidIcons from "@fortawesome/free-solid-svg-icons";

interface TopicCardProps {
    topic: string;
    svgIcon: FASolidIcons.IconDefinition;
    onClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, svgIcon, onClick }) => {
    return (
        <Card className="topic-card bg-light text-dark" onClick={onClick}>
            <Card.Header>{topic}</Card.Header>
            {svgIcon &&
                <Card.Body>
                    <Card.Img variant="bottom" src={getSVGURI(svgIcon)} />
                </Card.Body>
            }
        </Card>
    );
};

