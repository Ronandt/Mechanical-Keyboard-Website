const dfd = require('danfojs-node');
const chartJsImg = require('chartjs-to-image');
const moment = require('moment');
const User = require('../models/user');
const LoyaltyCard = require('../models/LoyaltyCard');
const Message = require('../models/Message');
const { Order } = require('../models/order');
const dateSpan = (s, e) => {
    for (
        var a = [], d = new Date(s);
        d <= new Date(e);
        d.setDate(d.getDate() + 1)
    ) {
        a.push(new Date(d));
    }
    return a;
};

const dummyData = [
    ['08/07/2022', 0],
    ['09/07/2022', 0],
    ['10/07/2022', 0],
];

class Chart {
    static async lineUserChartDaily(to, from) {
        const usersJoined = await User.findAll();

        let data = dateSpan(to, from);

        data = data.map((v) => {
            const isoDate = v.toISOString().slice(0, 10).split('-');
            return [
                [isoDate[isoDate.length - 1], isoDate[1], isoDate[0]].join('/'),
                0,
            ];
        });

        data.push([
            moment(data[data.length - 1][0], 'DD/MM/YYYY')
                .add(1, 'days')
                .format('DD/MM/YYYY'),
            0,
        ]);

        data.shift();
        const dateCheck = data.map((v) => v[0]);

        dummyData.forEach((e) => {
            if (dateCheck.includes(e[0])) {
                data.push(e);
            }
        });
        console.log(dateCheck);

        usersJoined.forEach((element) => {
            console.log(element.date);
            element.date = moment(moment(element.date, 'MM/DD/YYYY')).format(
                'DD/MM/YYYY'
            );
            if (dateCheck.includes(element.date)) {
                let rawData = [element.date, 1];

                data.push(rawData);
            }
        });

        const df = new dfd.DataFrame(data, {
            columns: ['Dates', 'NoOfUsersJoined'],
        });
        const group_df = df.groupby(['Dates']).sum();

        const df2 = dfd.toJSON(group_df, { format: 'json' });

        return df2;
    }

    static async lineUserChartYearly(to, from) {
        const usersJoined = await User.findAll();

        let data = [];

        data = dateSpan(to, from);
        const dataa = data;
        data = data.map((v) => {
            const isoDate = v.toISOString().slice(0, 10).split('-');
            return [[isoDate[0]].join('/'), 0];
        });

        const dates = dataa.map((v) => {
            const isoDate = v.toISOString().slice(0, 10).split('-');
            return [
                [isoDate[isoDate.length - 1], isoDate[1], isoDate[0]].join('/'),
                0,
            ];
        });

        console.log(
            dates.push([
                moment(dates[dates.length - 1][0], 'DD/MM/YYYY')
                    .add(1, 'days')
                    .format('DD/MM/YYYY'),
                0,
            ])
        );
        data.push([
            moment(data[data.length - 1][0], 'YYYY')
                .add(1, 'days')
                .format('YYYY'),
            0,
        ]);
        const dateCheck = dates.map((v) => v[0]);

        usersJoined.forEach((element) => {
            element.date = moment(moment(element.date, 'MM/DD/YYYY')).format(
                'DD/MM/YYYY'
            );
            console.log(element.date);
            if (dateCheck.includes(element.date)) {
                let rawData = [element.date.split('/')[2], 1];

                data.push(rawData);
            }
        });

        console.log('sjfsoifjiodsjfidsojfieosfjsdiofjsdiofjds');
        dummyData.forEach((e) => {
            if (dateCheck.includes(e[0])) {
                data.push([e[0].split('/')[2], e[1]]);
            }
        });

        console.log(data);
        const df = new dfd.DataFrame(data, {
            columns: ['Dates', 'NoOfUsersJoined'],
        });
        const group_df = df.groupby(['Dates']).sum();

        const df2 = dfd.toJSON(group_df, { format: 'json' });

        return df2;
    }

    static async lineUserChartMonthly(to, from) {
        const usersJoined = await User.findAll();

        let data = [];

        data = dateSpan(to, from);
        const dataa = data;
        data = data.map((v) => {
            const isoDate = v.toISOString().slice(0, 10).split('-');
            return [[isoDate[1], isoDate[0]].join('/'), 0];
        });

        data.push([
            moment(data[data.length - 1][0], 'MM/YYYY')
                .add(1, 'days')
                .format('MM/YYYY'),
            0,
        ]);

        const dates = dataa.map((v) => {
            const isoDate = v.toISOString().slice(0, 10).split('-');
            return [
                [isoDate[isoDate.length - 1], isoDate[1], isoDate[0]].join('/'),
                0,
            ];
        });
        console.log(
            dates.push([
                moment(dates[dates.length - 1][0], 'DD/MM/YYYY')
                    .add(1, 'days')
                    .format('DD/MM/YYYY'),
                0,
            ])
        );
        const dateCheck = dates.map((v) => v[0]);
        dummyData.forEach((e) => {
            if (dateCheck.includes(e[0])) {
                data.push([
                    e[0].split('/')[1] + '/' + e[0].split('/')[2],
                    e[1],
                ]);
            }
        });

        usersJoined.forEach((element) => {
            element.date = moment(moment(element.date, 'MM/DD/YYYY')).format(
                'DD/MM/YYYY'
            );
            if (dateCheck.includes(element.date)) {
                let rawData = [
                    element.date.split('/')[1] +
                        '/' +
                        element.date.split('/')[2],
                    1,
                ];

                data.push(rawData);
            }
        });

        const df = new dfd.DataFrame(data, {
            columns: ['Dates', 'NoOfUsersJoined'],
        });
        const group_df = df.groupby(['Dates']).sum();

        const df2 = dfd.toJSON(group_df, { format: 'json' });
        return df2;
    }

    static async totalStats() {
        const users = await User.count();
        const messages = await Message.count();
        const orders = await Order.count();
        const loyaltyCards = await LoyaltyCard.count();
        return { users, messages, orders, loyaltyCards };
    }

    static async proportionPieChart(to, from) {
        let data = dateSpan(to, from);

        data = data.map((v) => {
            const isoDate = v.toISOString().slice(0, 10).split('-');
            return [isoDate[1], isoDate[isoDate.length - 1], isoDate[0]].join(
                '/'
            );
        });

        data.push(
            moment(data[data.length - 1][0], 'MM/DD/YYYY')
                .add(1, 'days')
                .format('MM/DD/YYYY')
        );

        data.shift();

        const Staff = (await User.findAll({ where: { isStaff: 1 } }))
            .filter((x) => data.includes(x.dataValues.date))
            .map((x) => x.dataValues).length;

        const Customers = (await User.findAll({ where: { isStaff: 0 } }))
            .filter((x) => data.includes(x.dataValues.date))
            .map((x) => x.dataValues).length;

        return JSON.stringify({ Customers, Staff });
    }

    static async authDoughnutChart(to, from) {
        let data = dateSpan(to, from);

        data = data.map((v) => {
            const isoDate = v.toISOString().slice(0, 10).split('-');
            return [isoDate[1], isoDate[isoDate.length - 1], isoDate[0]].join(
                '/'
            );
        });

        data.push(
            moment(data[data.length - 1][0], 'MM/DD/YYYY')
                .add(1, 'days')
                .format('MM/DD/YYYY')
        );

        data.shift();

        const Staff = (await User.findAll({ where: { authMethod: 'local' } }))
            .filter((x) => data.includes(x.dataValues.date))
            .map((x) => x.dataValues).length;

        const Customers = (
            await User.findAll({ where: { authMethod: 'oauth' } })
        )
            .filter((x) => data.includes(x.dataValues.date))
            .map((x) => x.dataValues).length;

        return JSON.stringify({ Customers, Staff });
    }
}

module.exports = Chart;
