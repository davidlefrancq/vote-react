class AddressFormater {
    static minimizer(address) {
        let mini = "";
        if (address && address.length > 10) {
            const start = address.slice(0, 5);
            const end = address.slice((address.length - 5), (address.length));
            mini = start + "..." + end;
        }
        return mini;
    }
}

export default AddressFormater;
