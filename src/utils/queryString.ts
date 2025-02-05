export const queryString = (params: { [key: string]: any }) => {
  return Object.keys(params)
    .map((key) => key + "=" + encodeURIComponent(params[key]))
    .join("&");
};

export const salt = "f!e$2a$1@0$fd%9SYl^qJ*c{,%>U30-t5je}qP9]h_x+</g.?l=;h'o0O";
