import axios from "axios";
import { shoofiAdminStore } from "../../../stores/shoofi-admin";

type TPayload = {
    TerminalNumber: string;
    Password: string;
    TransactionIdToCancelOrRefund: string,
    TransactionSum: number,
}


const refundTransaction = ({TransactionIdToCancelOrRefund, TransactionSum}:any) => {
    const paymentCredentials = shoofiAdminStore.paymentCredentials;
    let body: TPayload = {
        TerminalNumber: paymentCredentials.credentials_terminal_number,
        Password: paymentCredentials.credentials_password,
        TransactionIdToCancelOrRefund,
        TransactionSum,
    };
    return axios
        .post(
            'https://pci.zcredit.co.il/ZCreditWS/api/Transaction/RefundTransaction',
            body,
        )
        .then(function (res: any) {
            return res;
        });
}

export default refundTransaction;