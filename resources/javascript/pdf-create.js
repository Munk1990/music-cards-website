
const {PDFDocument, StandardFonts, rgb, degrees} = PDFLib;

async function createPdf(columns, rows) {
    document.getElementById("generatePDF").innerText = "Processing PDF"
    document.getElementById("generatePDF").disabled = true

    cardFronts = document.getElementsByClassName("cardfront");
    cardBacks = document.getElementsByClassName("cardback");

    cardHeight = parseInt(document.getElementById('cardHeight'))
    cardWidth = parseInt(document.getElementById('cardWidth'))


    const pdfDoc = await PDFDocument.create()

    newPage = true

    let frontPage
    let backPage
    let frontImageSrc

    let cardPtr = 0;

    while (cardPtr < cardFronts.length) {
        for (let colPtr = 0; colPtr < columns; colPtr++) {
            for (let rowPtr = 0; rowPtr < rows; rowPtr++) {
                if (cardPtr < cardFronts.length) {
                    console.log("Checking card num:" + cardPtr)

                    frontImageSrc = cardFronts[cardPtr].src
                    backImageSrc = cardBacks[cardPtr].src
                    while (!frontImageSrc & cardPtr < cardFronts.length - 1 ) {
                        console.log("In while loop:" + cardPtr)
                        cardPtr = cardPtr + 1
                        frontImageSrc = cardFronts[cardPtr].src
                        backImageSrc = cardBacks[cardPtr].src
                    }

                    if (frontImageSrc) {
                        console.log("Val" + (cardPtr <= cardFronts.length))
                        console.log("Writing images:" + cardPtr)
                        const frontImageBytes = await fetch(frontImageSrc).then((res) => res.arrayBuffer())
                        const frontImage = await pdfDoc.embedJpg(frontImageBytes)
                        const frontDims = frontImage.scale(1);

                        const backImageBytes = await fetch(backImageSrc).then((res) => res.arrayBuffer())
                        const backImage = await pdfDoc.embedJpg(backImageBytes)
                        const backDims = backImage.scale(1);

                        if (newPage) {
                            frontPage = pdfDoc.addPage();
                            frontPage.setSize(frontDims.width * columns, frontDims.height * rows);

                            backPage = pdfDoc.addPage();
                            backPage.setSize(backDims.width * columns, backDims.height * rows);
                        }
                        newPage = false

                        frontPage.drawImage(frontImage, {
                            x: frontDims.width * colPtr,
                            y: frontDims.height * rowPtr,
                        })
                        backPage.drawImage(backImage, {
                            x: frontPage.getWidth() - frontDims.width * (colPtr + 1),
                            y: frontDims.height * rowPtr,
                        })
                        backPage.setRotation(degrees(180))
                    }
                    cardPtr = cardPtr + 1;
                }
            }
        }
        newPage = true
    }
    const pdfBytes = await pdfDoc.save()
    document.getElementById("generatePDF").innerText = "Generate PDF"
    document.getElementById("generatePDF").disabled = false
    let pdfName = ""
    if (document.getElementById("listTitle").value) {
        pdfName = "music-cards-" + columns + "x" + rows + "-" + document.getElementById("albumCounter").text + "-" + document.getElementById("cardWidth").value + "x" + document.getElementById("cardHeight").value + "mm"
            + "-(" + document.getElementById("listTitle").value + ").pdf"
    } else {
        pdfName = "music-cards-" + columns + "x" + rows + "-" + document.getElementById("albumCounter").text + "-" + document.getElementById("cardWidth").value + "x" + document.getElementById("cardHeight").value + "mm"
            + ".pdf"

    }
    download(pdfBytes, pdfName, "application/pdf");
}
