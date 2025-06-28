import EscPosPrinter, {
  getPrinterSeriesByName,
} from "react-native-esc-pos-printer";
import moment from "moment";
import i18n from "../../translations/i18n";
import { errorHandlerStore } from "../../stores/error-handler";
import { userDetailsStore } from "../../stores/user-details";

export async function testPrint(order: any, printer, isDisablePrinter = false) {
  try {
    if(isDisablePrinter){
      return true;
    }
    if (order) {
      // if(!printer){
      //   await EscPosPrinter.init({
      //     target: "BT:00:01:90:56:EB:70",
      //     seriesName: getPrinterSeriesByName("TM-m30"),
      //     language: "EPOS2_LANG_EN",
      //   });
      // }
      // await EscPosPrinter.init({
      //   target: "BT:00:01:90:56:EB:70",
      //   seriesName: getPrinterSeriesByName("TM-m30"),
      //   language: "EPOS2_LANG_EN",
      // });

      // return new Promise((resolve) => {
      //   setTimeout(() => {
      //     resolve(true);
      //   }, 8000);
      // });

      printer = new EscPosPrinter.printing();

      let status = await printer.initialize();
      let statusx;
      statusx = await printOrder(order, status);
      await statusx.send();
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

const printOrder = async (orders, status) => {
  try {
    return new Promise((resolve) => {
      orders.forEach((order) => {
        status
          .align("center")
          .image(
            { uri: order },
            {
              width: 500,
              height: 3000,
            }
          )
          .newline(1)
          .cut();
      });
      resolve(status);
    });
  } catch (error) {
    errorHandlerStore.sendClientError({
      error: {
        message: error?.message,
        cause: error?.cause,
        name: error?.name,
        source: 'printer',
      },
      customerId: userDetailsStore.userDetails?.customerId,
      createdDate: moment().format(),
    });
    return false;
  }
};
