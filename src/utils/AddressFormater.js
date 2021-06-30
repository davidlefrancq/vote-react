class AddressFormater {
    static minimizer(address){
        console.log(address);
        let miniAddress = "";
        if (address && address.length > 10) {
            const start = address.slice(0, 5);
            console.log(start);
            const end = address.slice((address.length - 5), (address.length));
            console.log(end);
            miniAddress = start + "..." + end;
            console.log(miniAddress);
        }
        return miniAddress;
    }
}

export default AddressFormater;
