const inputs = document.querySelectorAll(".sidebar input");
const coverpage = document.querySelector(".coverpage");
const generateBtn = document.querySelector(".generate");
const facInfoSearchBtn = document.querySelector(".teacher-info-header button");
const searchWin = document.querySelector(".search-window");
const searchInput = document.querySelector("#search-faculty");
const searchResultList = document.querySelector(".search-result");
const closeBtn = document.querySelector("#close");

// const api_base_url = "http://localhost:8080";
const api_base_url = "https://coverpage-backend.onrender.com";

const data = {
    assignmentTitle: "",
    assignmentNumber: "",
    courseTitle: "",
    courseCode: "",
    teacherName: "",
    designation: "",
    teacherDept: "",
    studentName: "",
    studentId: "",
    batch: "",
    section: "",
    studentDept: "",
    date: getDate()
};

let faculties = [];

async function fetchDeptFac() {
    try {
        const res = await fetch(api_base_url + "/fac");
        if (!res.ok) throw new Error("Error fetching faculties");
        const json = await res.json();
        faculties = json.faculties;
    } catch (e) {
        console.log("Error fetching faculties:", e);
    }
}

fetchDeptFac().then(() => {
    facInfoSearchBtn.disabled = false;
})

function renderFacultyList(list) {
    searchResultList.innerHTML = "";

    if (list.length === 0) {
        searchResultList.innerHTML = `<li style="cursor: default; opacity: 0.6;">No faculty found</li>`;
        return;
    }

    list.forEach(faculty => {
        const li = document.createElement("li");

        const cleanDept = faculty.dept.replace(/^Department of\s+/i, '');

        li.innerHTML = `
            <span class="name">${faculty.name}</span>
            <span class="designation">${faculty.desc} — ${cleanDept}</span>
        `;

        li.addEventListener("click", () => selectFaculty(faculty));
        searchResultList.appendChild(li);
    });
}

function selectFaculty(faculty) {
    const cleanDept = faculty.dept.replace(/^Department of\s+/i, '');

    const teacherData = {
        "teacher-name": faculty.name,
        "designation": faculty.desc,
        "teacher-dept": cleanDept
    };

    Object.keys(teacherData).forEach(fieldName => {
        const value = teacherData[fieldName];
        const inputEl = document.querySelector(`input[name="${fieldName}"]`);

        if (inputEl) inputEl.value = value;

        updateData(fieldName, value);

        const previewEl = coverpage.querySelector(`.${fieldName}`);
        if (previewEl) previewEl.innerText = value;
    });

    searchWin.close();
    searchInput.value = "";
}

facInfoSearchBtn.addEventListener("click", () => {
    renderFacultyList(faculties);
    searchWin.showModal();
    searchInput.focus();
});

closeBtn.addEventListener("click", () => {
    searchWin.close();
});

searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = faculties.filter(f =>
        f.name.toLowerCase().includes(query) ||
        f.desc.toLowerCase().includes(query) ||
        f.dept.toLowerCase().includes(query)
    );
    renderFacultyList(filtered);
});

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();

        const firstLi = searchResultList.querySelector("li");

        if (firstLi && firstLi.querySelector(".name")) {
            firstLi.click();
        }
    }
});

inputs.forEach(input => {
    if (input.name === "submission-date") {
        input.value = data.date;
        const el = coverpage.querySelector(`.${input.name}`);
        if (el) el.innerText = input.value;
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
        case "assignment-title": data.assignmentTitle = value; break;
        case "assignment-num": data.assignmentNumber = value; break;
        case "course-title": data.courseTitle = value; break;
        case "course-code": data.courseCode = value; break;
        case "teacher-name": data.teacherName = value; break;
        case "designation": data.designation = value; break;
        case "teacher-dept": data.teacherDept = value; break;
        case "student-name": data.studentName = value; break;
        case "id": data.studentId = value; break;
        case "batch": data.batch = value; break;
        case "section": data.section = value; break;
        case "student-dept": data.studentDept = value; break;
        case "submission-date": data.date = value; break;
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

    const fontScalar = 1.1;
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

    doc.setFontSize(22 * fontScalar);
    doc.setFont("times", "bold");
    doc.text(data.assignmentTitle || '', centerX, 72, { align: 'center' });

    let currentY = 88;
    doc.setFontSize(13 * fontScalar);

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

    currentY = 138;
    doc.setFont("times", "bold");
    doc.setFontSize(14 * fontScalar);
    doc.text("Submitted to", centerX, currentY, { align: 'center' });

    doc.setFont("times", "normal");
    doc.setFontSize(12 * fontScalar);
    doc.text(data.teacherName || '', centerX, currentY + 7, { align: 'center' });
    doc.text(data.designation || '', centerX, currentY + 13, { align: 'center' });
    doc.text(`Dept. of ${data.teacherDept || data.department || ''}`, centerX, currentY + 19, { align: 'center' });
    doc.text("Metropolitan University, Sylhet", centerX, currentY + 25, { align: 'center' });

    currentY = 195;
    doc.setFont("times", "bold");
    doc.setFontSize(14 * fontScalar);
    doc.text("Submitted by", centerX, currentY, { align: 'center' });

    doc.setFont("times", "normal");
    doc.setFontSize(12 * fontScalar);
    doc.text(data.studentName || '', centerX, currentY + 7, { align: 'center' });

    drawKeyValue("Student ID: ", data.studentId || '', currentY + 14);
    drawKeyValue("Batch: ", data.batch || '', currentY + 20);
    drawKeyValue("Section: ", data.section || '', currentY + 26);

    currentY = 250;
    doc.setFont("times", "normal");
    doc.setFontSize(12 * fontScalar);
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
    return `coverpage [${data.courseTitle}] [${data.studentName}] [${data.studentId}].pdf`;
}

function getDate() {
    const date = new Date();
    return date.toLocaleDateString('en-GB');
}
