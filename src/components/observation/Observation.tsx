import React from 'react';
import { Card, Button, ButtonGroup } from 'react-bootstrap';

export interface ObservationProps {
    text: string;
    onCorrectClick: () => void;
    onNotAccurateClick: () => void;
    active: boolean;
    isCorrect: boolean | null;
}

export const Observation: React.FC<ObservationProps> = ({ text, onCorrectClick, onNotAccurateClick, active, isCorrect }) => {
    return (
        <div className={"observation-container " + (!active ? "disabled" : "enabled")}>
            <Card className="observation-text-display">
                <Card.Body>
                    <Card.Text>{text}</Card.Text>
                </Card.Body>
            </Card>
            <ButtonGroup className="observation-button-group">
                {isCorrect !== false &&
                    <Button variant="success" className="observation-button" onClick={onCorrectClick}>נכון</Button>}
                {isCorrect !== true &&
                    <Button variant="secondary" className="observation-button" onClick={onNotAccurateClick}>לא מדוייק</Button>}
            </ButtonGroup>
        </div>
    );
};

export default Observation;