import React from 'react';

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
            <div className="observation-text-display">
                <p>{text}</p>
            </div>
            <div className="observation-button-group">
                {isCorrect !== false &&
                    <button className="observation-button observation-correct-button" onClick={onCorrectClick}>נכון</button>}
                {isCorrect !== true &&
                    <button className="observation-button observation-not-accurate-button" onClick={onNotAccurateClick}>לא מדוייק</button>}
            </div>
        </div>
    );
};

export default Observation;