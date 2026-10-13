// Hanya URL berskema http/https yang dianggap valid (sama dengan aturan backend)
export const isHttpUrl = (value: string) => /^https?:\/\/\S+$/i.test(value.trim());
