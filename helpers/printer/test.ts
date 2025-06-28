import EscPosPrinter, {
    getPrinterSeriesByName,
  } from "react-native-esc-pos-printer";
  
  export async function testPrint2() {
      await EscPosPrinter.init({
        target: 'BT:00:01:90:60:E0:77',
        seriesName: getPrinterSeriesByName("TM-m30"),
        language: "EPOS2_LANG_EN",
      });
      const printing = new EscPosPrinter.printing();
      let status = await printing.initialize();
      let statusx;
        statusx = await printOrder( status);
      statusx.send();
  
  }
  
  const printOrder = async (status) => {
    try {
  

  
      status
        .align("center")
        .size(3, 3)
        .image(require("../../assets/output-onlinepngtools.png"), {
          width: 500,
          halftone: "EPOS2_HALFTONE_THRESHOLD",
        })
        .smooth(false);
      status.align("center")
        .text('ساري قشوع')
      status
        .newline()
        .image(require("../../assets/copyright-logo.png"), {
          width: 250,
          halftone: "EPOS2_HALFTONE_THRESHOLD",
        })
        .newline(3)
        .cut();
  
      console.log("Success:", status);
      return status;
  
    } catch (e) {
      console.log("Error:", e);
    }
  };
  