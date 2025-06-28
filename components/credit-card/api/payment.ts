import axios from "axios";
import { TOrderSubmitResponse } from "../../../stores/cart";
import { SHIPPING_METHODS } from "../../../consts/shared";
import { shoofiAdminStore } from "../../../stores/shoofi-admin";
type TPayload = {
    TerminalNumber: string;
    Password: string;
    CardNumber: string,
    TransactionSum: number,
    ExtraData: string;
    HolderID: string;
    CustomerEmail?: string;
    CVV: string;
    PhoneNumber: string;
    ZCreditInvoiceReceipt?: any;
}
export type TPaymentProps = {
    token: string;
    totalPrice: number;
    orderId: number;
    id: number;
    email?: string;
    cvv?: string;
    phone: string;
    userName: string;

}

const getCartItems = (cartData: any) => {
    const items = cartData?.order?.items?.map((item)=>{
        return {
            "ItemDescription": item?.nameHE?.toString(),
            "ItemQuantity": item?.qty?.toString(),
            "ItemPrice": item?.price?.toString(),
            "IsTaxFree": "false"
        }
    })
    if(cartData.order.receipt_method == SHIPPING_METHODS.shipping){
        items.push(
         {
                "ItemDescription": 'משלוח',
                "ItemQuantity": 1,
                //TODO
                "ItemPrice": 20,
                "IsTaxFree": "false"
            }
        )
    }
    return items;
}

const chargeCreditCard = ({ token, totalPrice, orderId, id, email, cvv, phone,userName }: TPaymentProps, cartData: any) => {
    const paymentCredentials = shoofiAdminStore.paymentCredentials;

    const itemsList = getCartItems(cartData)

    let body: TPayload = {
        TerminalNumber: paymentCredentials.credentials_terminal_number,
        Password: paymentCredentials.credentials_password,
        CardNumber: token,
        TransactionSum: totalPrice,
        ExtraData: orderId?.toString(),
        HolderID: id?.toString(),
        CVV: cvv,
        PhoneNumber: phone,
        // "ZCreditInvoiceReceipt": {
        //     "Type": "0",
        //     "RecepientName": `${userName} - ${phone}`,
        //     "RecepientCompanyID": "",
        //     "Address": "",
        //     "City": "",
        //     "ZipCode": "",
        //     "PhoneNum": phone,
        //     "FaxNum": "",
        //     "TaxRate": "17",
        //     "Comment": "",
        //     "ReceipientEmail": storeDataStore.storeData.email,
        //     "EmailDocumentToReceipient": true,
        //     "ReturnDocumentInResponse": "",
        //     "Items": itemsList
        // }
    };
    // if (email) {
        body.CustomerEmail = 'shoofi.dev@gmail.com';
    //}
    return axios
        .post(
            'https://pci.zcredit.co.il/ZCreditWS/api/Transaction/CommitFullTransaction',
            body,
        )
        .then(function (res: any) {
            return res.data;
        });
}

export default chargeCreditCard;