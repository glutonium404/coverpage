const inputs = document.querySelectorAll(".sidebar input");
const coverpage = document.querySelector(".coverpage");
const generateBtn = document.querySelector(".generate");

inputs.forEach(input => {
    input.addEventListener("input", () => {
        const el = coverpage.querySelector(`.${input.name}`);
        if (el) {
            el.innerText = input.value;
        }
    });
});

const options = {
    margin: 0,
    filename: 'Assignment_Coverpage.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: 'avoid-all' }
};

const waitForPaint = () =>
    new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

generateBtn.addEventListener("click", async () => {
    coverpage.classList.add("printing");

    try {
        await waitForPaint();

        await html2pdf()
            .set(options)
            .from(coverpage)
            .save();
    } catch (err) {
        console.error(err);
        window.alert("Sorry, something went wrong :'(");
    } finally {
        coverpage.classList.remove("printing");
    }
});

// generateBtn.addEventListener('click', async () => {
//     generateBtn.textContent = 'Generating...';
//     generateBtn.disabled = true;
//
//     try {
//         const pdfBlob = await html2pdf()
//             .set(options)
//             .from(coverpage)
//             .output('blob');
//
//         const url = URL.createObjectURL(pdfBlob);
//         window.open(url, '_blank');
//         setTimeout(() => URL.revokeObjectURL(url), 30000);
//     } catch (e) {
//         alert('PDF generation failed. Please try again.');
//         console.error(e);
//     } finally {
//         btn.innerText = "Generate PDF";
//         btn.disabled = false;
//     }
// });
