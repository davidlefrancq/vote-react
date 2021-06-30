const IN_PROGRESS = "IN_PROGRESS";
const SUCCESS = "SUCCESS";
const CANCELED = "CANCELED";

class Transaction {
    status;
    from;
    response;

    constructor(from, value) {
        this.status = IN_PROGRESS;
        this.from = from;
        this.response = value;
    }
}

export {Transaction, IN_PROGRESS, SUCCESS, CANCELED};
