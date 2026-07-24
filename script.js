const inputs = document.querySelectorAll(".sidebar input");
const coverpage = document.querySelector(".coverpage");
const generateBtn = document.querySelector(".generate");
const data = {
    assignmentTitle: "Class Work 2",
    assignmentNumber: "02",
    courseTitle: "ADA",
    courseCode: "CSE-232",
    teacherName: "Anas pir",
    designation: "Lecturer",
    teacherDept: "CSE",
    studentName: "Tahzib Ebad Chowdhury",
    studentId: "251-115-084",
    batch: "CSE 62",
    section: "B",
    studentDept: "Computer Science & Engineering",
    date: "01/02/2026"
};

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
            updateData(input.name, input.value);
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
        generateCoverPage();

        generateBtn.textContent = originalTxtContent;
        generateBtn.disabled = false;
        coverpage.classList.remove("printing");
    }, 300);
}

function updateData(name, value) {
    switch (name) {
        case "assignment-title":
            data.assignmentTitle = value;
            break;
        case "assignment-num":
            data.assignmentNumber = value;
            break;
        case "course-title":
            data.courseTitle = value;
            break;
        case "course-code":
            data.courseCode = value;
            break;
        case "teacher-name":
            data.teacherName = value;
            break;
        case "designation":
            data.designation = value;
            break;
        case "teacher-dept":
            data.teacherDept = value;
            break;
        case "student-name":
            data.studentName = value;
            break;
        case "id":
            data.studentId = value;
            break;
        case "batch":
            data.batch = value;
            break;
        case "section":
            data.section = value;
            break;
        case "student-dept":
            data.studentDept = value;
            break;
        case "submission-date":
            data.date = value;
            break;
    }
}

function loadImageAsBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = (error) => reject(error);
        img.src = url;
    });
}

async function generateCoverPage() {
    const { jsPDF } = window.jspdf;

    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    });

    const pageWidth = 210;
    const centerX = pageWidth / 2;

    doc.setFont("times");

    try {
        const logoData = await loadImageAsBase64('./asset/img/logo.png');

        const logoWidth = 130;
        const logoHeight = 25;
        const logoX = centerX - (logoWidth / 2);
        const logoY = 25;

        doc.addImage(logoData, 'PNG', logoX, logoY, logoWidth, logoHeight, undefined, 'FAST');
    } catch (err) {
        console.warn("Could not load logo from standard path, proceeding without image.", err);
    }

    // assignment Title
    doc.setFontSize(22);
    doc.setFont("times", "bold");
    doc.text(data.assignmentTitle || '', centerX, 72, { align: 'center' });

    // assignment Number & Course Details
    let currentY = 88;
    doc.setFontSize(13);

    function drawKeyValue(boldLabel, normalVal, y) {
        doc.setFont("times", "bold");
        const labelWidth = doc.getTextWidth(boldLabel);

        doc.setFont("times", "normal");
        const valWidth = doc.getTextWidth(normalVal);

        const totalWidth = labelWidth + valWidth;
        let startX = centerX - (totalWidth / 2);

        doc.setFont("times", "bold");
        doc.text(boldLabel, startX, y);

        doc.setFont("times", "normal");
        doc.text(normalVal, startX + labelWidth, y);
    }

    drawKeyValue("Assignment Number: ", data.assignmentNumber || '', currentY);
    drawKeyValue("Course Title: ", data.courseTitle || '', currentY + 7);
    drawKeyValue("Course Code: ", data.courseCode || '', currentY + 14);

    // submitted To Section
    currentY = 138;
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("Submitted to", centerX, currentY, { align: 'center' });

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(data.teacherName || '', centerX, currentY + 7, { align: 'center' });
    doc.text(data.designation || '', centerX, currentY + 13, { align: 'center' });
    doc.text(`Dept. of ${data.teacherDept || data.department || ''}`, centerX, currentY + 19, { align: 'center' });
    doc.text("Metropolitan University, Sylhet", centerX, currentY + 25, { align: 'center' });

    // submitted By Section
    currentY = 195;
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("Submitted by", centerX, currentY, { align: 'center' });

    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(data.studentName || '', centerX, currentY + 7, { align: 'center' });

    drawKeyValue("Student ID: ", data.studentId || '', currentY + 14);
    drawKeyValue("Batch: ", data.batch || '', currentY + 20);
    drawKeyValue("Section: ", data.section || '', currentY + 26);

    // footer Details (Department, University, Submission Date)
    currentY = 250;
    doc.setFont("times", "normal");
    doc.setFontSize(12);
    doc.text(`Dept. of ${data.studentDept || data.department || ''}`, centerX, currentY, { align: 'center' });
    doc.text("Metropolitan University, Sylhet", centerX, currentY + 6, { align: 'center' });

    drawKeyValue("Submission date: ", data.date || '', currentY + 12);

    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    download(blobUrl);
}

function download(blobUrl) {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = getFileName();
    document.body.appendChild(link);
    link.click();
    link.remove();
}

function getFileName() {
    return `coverpage [${data.courseTitle}] [${data.studentName}] [${data.studentId}].pdf`
}
