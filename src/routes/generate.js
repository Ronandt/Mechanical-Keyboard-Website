const generateRouter = require('express').Router();
const { jsPDF } = require('jspdf');

require("jspdf-autotable");
const PDF = require("../models/Pdf")

const chartJsImg = require('chartjs-to-image');
const docs = new jsPDF('p', 'mm', 'a4');
const moment = require('moment');
const GenerateImageCharts = require('./createCharts');
const Chart = require('./pipeline');
const User = require('../models/User');
const bucket = require('../configuration/cloudStorage');

const width = docs.internal.pageSize.getWidth();
const height = docs.internal.pageSize.getHeight();

//yyyy-mm-dd -> mm-dd-yyyy
generateRouter.route('/chart').get(async (req, res) => {
    const stats = await Chart.totalStats();
    if (req.query.from == '') {
        const earliest_user = (
            await User.findAll({
                limit: 1,
            })
        )[0].dataValues.date.split('/');
        req.query.from = [
            earliest_user[2],
            earliest_user[0],
            earliest_user[1],
        ].join('-');
    }

    if (req.query.to == '') {
        req.query.to = moment().format('YYYY-MM-DD');
    }
    let from =
        req.query.from.split('-')[1] +
        '-' +
        req.query.from.split('-')[2] +
        '-' +
        req.query.from.split('-')[0];

    let to =
        req.query.to.split('-')[1] +
        '-' +
        req.query.to.split('-')[2] +
        '-' +
        req.query.to.split('-')[0];

    const generateImageCharts = new GenerateImageCharts(from, to);
    const dailyPath = await generateImageCharts.generateLineUserChartDaily();
    const monthlyPath =
        await generateImageCharts.GenerateLineUserChartMonthly();
    const yearlyPath = await generateImageCharts.GenerateLineUserChartYearly();
    await generateImageCharts.GeneratePieChart();
    await generateImageCharts.GenerateDoughnutChart();
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

    doc.text(
        `__________________TOTAL STATISTICS_________________`,
        43,
        9
    ).setFont(undefined, 'bold');
    doc.text(
        `| Users  |  Messages  |  Orders  |  Loyalty  |\n  ${Object.values(
            stats
        ).join('                 ')}`,
        62,
        17
    ).setFont(undefined, 'bold');
    doc.text(
        `===================================================`,
        43,
        29
    ).setFont(undefined, 'bold');
    var imgData =
        'data:image/png;base64,' +
        require('fs').readFileSync(`${dailyPath}`, 'base64');

    doc.addImage(imgData, 'png', 20, 25, 180, 105);

    doc.addImage(
        'data:image/png;base64,' +
            require('fs').readFileSync(`${monthlyPath}`, 'base64'),
        'png',
        15,
        150,
        180,
        105
    );
    doc.addPage();
    doc.addImage(
        'data:image/png;base64,' +
            require('fs').readFileSync(`${yearlyPath}`, 'base64'),
        'png',
        15,
        10,
        180,
        105
    );

    doc.addImage(
        'data:image/png;base64,' +
            require('fs').readFileSync(`pieChart.png`, 'base64'),
        'png',
        -5,
        130,
        205,
        120
    );
    doc.addPage();

    doc.addImage(
        'data:image/png;base64,' +
            require('fs').readFileSync(`doughnutChart.png`, 'base64'),
        'png',
        -5,
        15,
        205,
        120
    );

    const filename = `KeyHubReports ${from}-${to}.pdf`;

    doc.save(filename);


 
try{
    const upload = await bucket.upload(filename)
    await PDF.create({link: `https://storage.googleapis.com/keyhub-files/KeyHubReports%20${from}-${to}.pdf`, name: filename})

    console.log(upload);


    res.download(`KeyHubReports ${from}-${to}.pdf`);
 
}
catch(e) {
    console.log(e)
    res.download(`KeyHubReports ${from}-${to}.pdf`);
}
   

  
   
});

generateRouter.route("/overview").get(async(req, res) => {
    const pdfs = (await PDF.findAll()).map((x) => x.dataValues)
    res.render("./staff/staff-pdf", {pdfs})
})

module.exports = generateRouter;
