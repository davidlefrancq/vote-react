class StringUtils{
    static addressMinimise(string){
        const start = string.slice(0,5);

        const lengthEndStart = (string.length - 5);
        const lengthEndFinal = (string.length);
        const end = string.slice(lengthEndStart,lengthEndFinal);

        return `${start}...${end}`;
    }
}

export default StringUtils;
