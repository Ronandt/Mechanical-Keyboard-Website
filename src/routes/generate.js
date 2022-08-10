const generateRouter = require('express').Router();
const { jsPDF } = require('jspdf');
const chartJsImg = require('chartjs-to-image');
const docs = new jsPDF('p', 'mm', 'a4');
const moment = require('moment');

const width = docs.internal.pageSize.getWidth();
const height = docs.internal.pageSize.getHeight();

generateRouter.route('/chart').get((req, res) => {
    const doc = new jsPDF();

    doc.setFont('Helvetica');
    doc.setFontSize(13);

    doc.addImage(
        'data:image/png;base64,' +
            require('fs').readFileSync('cover.png', 'base64'),
        'png',
        0,
        0,
        width,
        height
    );
    doc.text(moment().format('L'), 180, 7);
    doc.addPage();

    var imgData =
        'data:image/png;base64,' +
        require('fs').readFileSync('dailyLineChart.png', 'base64');

    doc.addImage(imgData, 'png', 15, 25, 180, 105);

    doc.addImage(
        'data:image/png;base64,' +
            require('fs').readFileSync('monthlyLineChart.png', 'base64'),
        'png',
        15,
        150,
        180,
        105
    );
    doc.addPage();
    doc.addImage(
        'data:image/png;base64,' +
            require('fs').readFileSync('yearlyLineChart.png', 'base64'),
        'png',
        15,
        10,
        180,
        105
    );
    doc.save(`KeyHubReport.pdf`);
    console.log('hi');
    res.download(`KeyHubReport.pdf`);
});

module.exports = generateRouter;
