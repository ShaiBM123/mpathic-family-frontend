import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useRef, useEffect } from "react";

export const useFirstRender = () => {
    const firstRender = useRef(true);

    useEffect(() => {
        firstRender.current = false;
    }, []);

    return firstRender.current;
};

export function convertUnixTimeStamp(unix_timestamp: number) {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds
    var date = new Date(unix_timestamp * 1000);

    // Hours part from the timestamp
    var hours = date.getHours();

    // Minutes part from the timestamp
    var minutes = "0" + date.getMinutes();

    // Seconds part from the timestamp
    var seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

    return formattedTime;
}

function isClassComponent(component: any) {
    return (
        typeof component === 'function' &&
        !!component.prototype.isReactComponent
    )
}

function isFunctionComponent(component: any) {
    return (
        typeof component === 'function' &&
        String(component).includes('return React.createElement')
    )
}

export function isReactComponent(component: any) {
    return (
        isClassComponent(component) ||
        isFunctionComponent(component)
    )
}

export function getSVGURI({ prefix, iconName, icon }: IconDefinition, color: string = 'black') {
    return (
        `data:image/svg+xml;base64,${btoa(`<svg data-prefix="${prefix}" data-icon="${iconName}"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${icon[0]} ${icon[1]}">
            <path fill="${color || "currentColor"}" d="${icon[4]}"></path>
            </svg>`)}`
    );
}

export function ageCategory(age: number): 0 | 1 | 2 {
    return age <= 12 ? 0 : age > 12 && age < 18 ? 1 : 2;
}


// Function to replace placeholders in the message template
export const formatMessage = (template: string, variables: { [key: string]: string }): string => {
    return template.replace(/\${(.*?)}/g, (_, key) => variables[key] || '');
};

export const enumKeyStartsWith = (enumObj: object, value: any, prefix: string): boolean => {
    const keys = Object.keys(enumObj).filter(key => enumObj[key as keyof typeof enumObj] === value);
    return keys.some(key => key.startsWith(prefix));
};

export const queryString = (params: { [key: string]: any }) => {
    return Object.keys(params)
        .map((key) => key + "=" + encodeURIComponent(params[key]))
        .join("&");
};


export const range = (start: number, stop: number, step = 1) =>
    Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)

export const salt = "f!e$2a$1@0$fd%9SYl^qJ*c{,%>U30-t5je}qP9]h_x+</g.?l=;h'o0O";


