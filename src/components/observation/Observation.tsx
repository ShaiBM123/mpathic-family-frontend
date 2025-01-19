import React from 'react';
import { Card } from 'react-bootstrap';
import { faCircleCheck, faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

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
            {isCorrect === true ? (
                <FontAwesomeIcon className="is-correct-icon" icon={faCircleCheck} style={{ color: 'green', fontSize: '2rem' }} />

            ) : isCorrect === false ? (
                <FontAwesomeIcon className="is-incorrect-icon" icon={faCircleQuestion} style={{ color: 'red', fontSize: '2rem' }} />

            ) : (
                <div className="observation-icon-group">
                    <FontAwesomeIcon icon={faCircleCheck} style={{ color: 'green', fontSize: '2rem', cursor: 'pointer' }} onClick={onCorrectClick} />
                    <FontAwesomeIcon icon={faCircleQuestion} style={{ color: 'red', fontSize: '2rem', cursor: 'pointer' }} onClick={onNotAccurateClick} />
                </div>
            )}
        </div>
    );
};

export default Observation;