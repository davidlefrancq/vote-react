class AddressFormater {
    static minimizer(address){
        let miniAddress = "";
        if (address && address.length > 10) {
            const start = address.slice(0, 5);
            const end = address.slice((address.length - 5), (address.length));
            miniAddress = start + "..." + end;
        }
        return miniAddress;
    }
}

export default AddressFormater;
