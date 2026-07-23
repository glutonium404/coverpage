const inputs = document.querySelectorAll(".sidebar input");
const coverpage = document.querySelector(".coverpage");
const generateBtn = document.querySelector(".generate");
const output = {
    image: true,
    pdf: false
}

if (output.image) generateBtn.textContent += " Image";
if (output.pdf) generateBtn.textContent += " PDF";

inputs.forEach(input => {
    if (input.name === "submission-date") {
        const date = new Date();
        const formatted = date.toLocaleDateString('en-GB');
        input.value = formatted;
    }
    input.addEventListener("input", () => {
        const el = coverpage.querySelector(`.${input.name}`);
        if (el) {
            el.innerText = input.value;
        }
    });
});

generateBtn.addEventListener("click", generate);

function generate() {
    const originalTxtContent = generateBtn.textContent;
    generateBtn.textContent = "Generating...";
    generateBtn.disabled = true;
    coverpage.classList.add("printing");

    setTimeout(() => {
        if (output.image) generateImage();
        if (output.pdf) generatePdf();

        generateBtn.textContent = originalTxtContent;
        generateBtn.disabled = false;
        coverpage.classList.remove("printing");
    }, 300);
}

async function generateImage() {
    try {
        const canvas = await html2canvas(coverpage, {
            allowTaint: true,
            useCORS: true,
        })

        let image = canvas.toDataURL("image/png", 1.0);
        let downloadLink = document.createElement("a");
        downloadLink.href = image;
        downloadLink.download = "cover-page.png";

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    catch (e) {
        console.log("Error capturing image:", e);
    }
}


async function generatePdf() {
    try {
        const canvas = await html2canvas(coverpage, {
            allowTaint: true,
            useCORS: true,
        })

        let imgData = canvas.toDataURL("image/jpeg", 1);

        const { jsPDF } = window.jspdf;

        let pdf = new jsPDF("p", "mm", "a4");

        let pdfWidth = pdf.internal.pageSize.getWidth();
        let pdfHeight = pdf.internal.pageSize.getHeight();

        let imgWidth = pdfWidth;
        let imgHeight = (canvas.height * pdfWidth) / canvas.width;

        if (imgHeight > pdfHeight) {
            imgHeight = pdfHeight;
            imgWidth = (canvas.width * pdfHeight) / canvas.height;
        }

        pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);

        pdf.save("document.pdf");
    }
    catch (e) {
        console.log("Error generating PDF:", e);
    }
}
