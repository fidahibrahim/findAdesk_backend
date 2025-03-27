export const generateId = () => {
    const prefix = "FIND";
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${randomNumber}`;
  };