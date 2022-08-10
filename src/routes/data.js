const dataRouter = require('express').Router();
const dfd = require('danfojs-node');
const User = require('../models/user');
const chartJsImg = require('chartjs-to-image');
var getDaysArray = function (s, e) {
    for (
        var a = [], d = new Date(s);
        d <= new Date(e);
        d.setDate(d.getDate() + 1)
    ) {
        a.push(new Date(d));
    }
    return a;
};

dataRouter.get('/chart-info', async (req, res) => {
    const usersJoined = await User.findAll();
    const users = usersJoined.map((x) => x.dataValues);

    let data = getDaysArray(new Date('07-07-2022'), new Date());
    data = data.map((v) => {
        const isoDate = v.toISOString().slice(0, 10).split('-');
        return [
            [isoDate[isoDate.length - 1], isoDate[1], isoDate[0]].join('/'),
            0,
        ];
    });
    console.log(data);
    let cols = ['Dates', 'NoOfUsersJoined'];
    data.push(['08/07/2022', 1]);
    data.push(['08/07/2022', 1]);
    data.push(['09/07/2022', 1]);
    data.push(['10/07/2022', 5]);

    usersJoined.forEach((element) => {
        let rawData = [element.date, 1];

        data.push(rawData);
    });

    const df = new dfd.DataFrame(data, {
        columns: ['Dates', 'NoOfUsersJoined'],
    });
    const group_df = df.groupby(['Dates']).sum();

    const df2 = dfd.toJSON(group_df, { format: 'json' });

    var NoOfUsers = [];
    var dates = [];
    df2.forEach((element) => {
        NoOfUsers.push(element['NoOfUsersJoined_sum']);
        dates.push(element['Dates']);
    });
    console.log(dates);
    console.log(NoOfUsers);

    console.log('hoi');
    console.log(df2);
    console.log('a');
    console.log('a');
    console.log('a');
    console.log('a');
    console.log('a');
    console.log('a');

    const myChart = new chartJsImg();

    myChart.setConfig({
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Number of Users Joined Daily',
                    lineTension: 0.3,
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    borderColor: 'rgba(78, 115, 223, 1)',
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                    pointBorderColor: 'rgba(78, 115, 223, 1)',
                    pointHoverRadius: 3,
                    pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
                    pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    data: NoOfUsers,
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0,
                },
            },
            scales: {
                xAxes: [
                    {
                        time: {
                            unit: 'date',
                        },
                        gridLines: {
                            display: false,
                            drawBorder: false,
                        },
                        ticks: {
                            maxTicksLimit: 7,
                        },
                    },
                ],
                yAxes: [
                    {
                        ticks: {
                            maxTicksLimit: 5,
                            padding: 10,
                            // Include a dollar sign in the ticks
                        },
                        gridLines: {
                            color: 'rgb(234, 236, 244)',
                            zeroLineColor: 'rgb(234, 236, 244)',
                            drawBorder: false,
                            borderDash: [2],
                            zeroLineBorderDash: [2],
                        },
                    },
                ],
            },
        },
    });
    myChart.toFile('dailyLineChart.png');
    res.status(200).json({ data: df2 });
});

dataRouter.get('/chart-info-year', async (req, res) => {
    const usersJoined = await User.findAll();
    const users = usersJoined.map((x) => x.dataValues);

    let data = [];
    let cols = ['Dates', 'NoOfUsersJoined'];
    data = getDaysArray(new Date('07-07-2022'), new Date());
    data = data.map((v) => {
        const isoDate = v.toISOString().slice(0, 10).split('-');
        return [[isoDate[0]].join('/'), 0];
    });

    usersJoined.forEach((element) => {
        let rawData = [element.date.split('/')[2], 1];

        data.push(rawData);
    });
    data.push(['2022', 1]);
    data.push(['2022', 1]);
    data.push(['2022', 1]);
    data.push(['2022', 5]);
    const df = new dfd.DataFrame(data, {
        columns: ['Dates', 'NoOfUsersJoined'],
    });
    const group_df = df.groupby(['Dates']).sum();
    console.log(group_df);
    console.log('F');
    console.log('F');
    console.log('F');
    console.log('F');
    console.log('F');
    console.log('F');

    const df2 = dfd.toJSON(group_df, { format: 'json' });

    var NoOfUsers = [];
    var dates = [];
    df2.forEach((element) => {
        NoOfUsers.push(element['NoOfUsersJoined_sum']);
        dates.push(element['Dates']);
    });
    console.log(dates);
    console.log(NoOfUsers);

    console.log('hoi');
    console.log(df2);
    console.log('a');
    console.log('a');
    console.log('a');
    console.log('a');
    console.log('a');
    console.log('a');

    const myChart = new chartJsImg();

    myChart.setConfig({
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Number of Users Joined Yearly',
                    lineTension: 0.3,
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    borderColor: 'rgba(78, 115, 223, 1)',
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                    pointBorderColor: 'rgba(78, 115, 223, 1)',
                    pointHoverRadius: 3,
                    pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
                    pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    data: NoOfUsers,
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0,
                },
            },
            scales: {
                xAxes: [
                    {
                        time: {
                            unit: 'date',
                        },
                        gridLines: {
                            display: false,
                            drawBorder: false,
                        },
                        ticks: {
                            maxTicksLimit: 7,
                        },
                    },
                ],
                yAxes: [
                    {
                        ticks: {
                            maxTicksLimit: 5,
                            padding: 10,
                            // Include a dollar sign in the ticks
                        },
                        gridLines: {
                            color: 'rgb(234, 236, 244)',
                            zeroLineColor: 'rgb(234, 236, 244)',
                            drawBorder: false,
                            borderDash: [2],
                            zeroLineBorderDash: [2],
                        },
                    },
                ],
            },
        },
    });
    myChart.toFile('yearlyLineChart.png');
    res.status(200).json({ data: df2 });
});

dataRouter.get('/chart-info-month', async (req, res) => {
    const usersJoined = await User.findAll();
    const users = usersJoined.map((x) => x.dataValues);

    let data = [];
    let cols = ['Dates', 'NoOfUsersJoined'];
    data = getDaysArray(new Date('07-07-2022'), new Date());
    data = data.map((v) => {
        const isoDate = v.toISOString().slice(0, 10).split('-');
        return [[isoDate[1], isoDate[0]].join('/'), 0];
    });
    data.push(['07/2022', 1]);
    data.push(['07/2022', 1]);
    data.push(['07/2022', 1]);
    data.push(['07/2022', 5]);

    usersJoined.forEach((element) => {
        let rawData = [
            element.date.split('/')[0] + '/' + element.date.split('/')[2],
            1,
        ];

        data.push(rawData);
    });

    const df = new dfd.DataFrame(data, {
        columns: ['Dates', 'NoOfUsersJoined'],
    });
    const group_df = df.groupby(['Dates']).sum();
    console.log(group_df);
    const df2 = dfd.toJSON(group_df, { format: 'json' });

    var NoOfUsers = [];
    var dates = [];
    df2.forEach((element) => {
        NoOfUsers.push(element['NoOfUsersJoined_sum']);
        dates.push(element['Dates']);
    });
    console.log(dates);
    console.log(NoOfUsers);

    console.log('hoi');
    console.log(df2);
    console.log('a');
    console.log('a');
    console.log('a');
    console.log('a');
    console.log('a');
    console.log('a');

    const myChart = new chartJsImg();

    myChart.setConfig({
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Number of Users Joined Monthly',
                    lineTension: 0.3,
                    backgroundColor: 'rgba(78, 115, 223, 0.05)',
                    borderColor: 'rgba(78, 115, 223, 1)',
                    pointRadius: 3,
                    pointBackgroundColor: 'rgba(78, 115, 223, 1)',
                    pointBorderColor: 'rgba(78, 115, 223, 1)',
                    pointHoverRadius: 3,
                    pointHoverBackgroundColor: 'rgba(78, 115, 223, 1)',
                    pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
                    pointHitRadius: 10,
                    pointBorderWidth: 2,
                    data: NoOfUsers,
                },
            ],
        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0,
                },
            },
            scales: {
                xAxes: [
                    {
                        time: {
                            unit: 'date',
                        },
                        gridLines: {
                            display: false,
                            drawBorder: false,
                        },
                        ticks: {
                            maxTicksLimit: 7,
                        },
                    },
                ],
                yAxes: [
                    {
                        ticks: {
                            maxTicksLimit: 5,
                            padding: 10,
                            // Include a dollar sign in the ticks
                        },
                        gridLines: {
                            color: 'rgb(234, 236, 244)',
                            zeroLineColor: 'rgb(234, 236, 244)',
                            drawBorder: false,
                            borderDash: [2],
                            zeroLineBorderDash: [2],
                        },
                    },
                ],
            },
        },
    });
    myChart.toFile('monthlyLineChart.png');

    res.status(200).json({ data: df2 });
});

module.exports = dataRouter;
