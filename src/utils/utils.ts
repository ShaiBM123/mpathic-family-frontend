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

export const salt = "f!e$2a$1@0$fd%9SYl^qJ*c{,%>U30-t5je}qP9]h_x+</g.?l=;h'o0O";