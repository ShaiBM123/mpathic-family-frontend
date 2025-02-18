import React from "react";
import RoundBtn from "../legacy/RoundBtn";

interface ButtonData {
    id: string;
    text: string;
    bold?: boolean;
    iconSrc?: string;
}

interface OptionButtonsListProps {
    buttonsData: ButtonData[];
    onButtonClick: (id: string) => void;
}

export const OptionButtonsInRow: React.FC<OptionButtonsListProps> = ({ buttonsData, onButtonClick }) => {
    return (
        <div className="option_buttons_row">
            {buttonsData.map((btnData, idx) => (
                <RoundBtn
                    extraClass={`${btnData.bold !== false ? 'text-bold' : 'text-regular'} bg-primary-button option_button_in_row`}
                    key={idx}
                    text={btnData.text}
                    onClick={() => onButtonClick(btnData.id)}
                />
            ))}
        </div>
    );
}

export const OptionButtonsInColumn: React.FC<OptionButtonsListProps> = ({ buttonsData, onButtonClick }) => {
    return (
        <div className="option_buttons_column">
            {buttonsData.map((btnData, idx) => (
                <RoundBtn
                    extraClass={`${btnData.bold !== false ? 'text-bold' : 'text-regular'} bg-primary-button option_button_in_column center_content`}
                    key={idx}
                    text={btnData.text}
                    iconSrc={btnData.iconSrc}
                    onClick={() => onButtonClick(btnData.id)}
                />
            ))}
        </div>
    );
}