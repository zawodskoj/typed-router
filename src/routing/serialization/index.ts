export type PropType<T> = {
    serialize: (p: T) => string
    deserialize: (p: string) => T
};
export type PropTypes<T> = { [key in keyof T]: PropType<T[key]> };

export const PT = {
    number: {
        serialize: (p: number) => p.toString(),
        deserialize: (p: string) => parseInt(p, 10)
    } as PropType<number>,
    string: {
        serialize: (p: string) => p,
        deserialize: (p: string) => p
    } as PropType<string>
};