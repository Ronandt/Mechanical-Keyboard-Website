const express = require('express');
const Product = require('../models/product');
const Pevaluation = require('../models/product_evaluation');
const User = require('../models/User');
const PevaluationRouter = express.Router();

PevaluationRouter.get('/productevaluations', async (req, res) => {
    const products = await Product.findAll({});
    return res.render(
        './staff/productevaluation/staff-productevaluation-retrieve',
        { products }
    );
});

PevaluationRouter.get(
    '/deleteproductevaluation/:id',
    async function (req, res) {
        try {
            let pe = await Pevaluation.findByPk(req.params.id);
            if (!pe) {
                flashMessage(res, 'error', 'product evaluation not found');
                res.redirect('/staff/manage-pe/productevaluations');
                return;
            }
            let result = await Pevaluation.destroy({ where: { id: pe.id } });
            req.flash(
                'success',
                'Product Evaluation with ID ' + result + ' is deleted!'
            );
            res.redirect('/staff/manage-pe/productevaluations');
        } catch (err) {
            console.log(err);
        }
    }
);

PevaluationRouter.get('/evaluationdetail/:id', async function (req, res) {
    try {
        const review = await Pevaluation.findAll({
            where: { ProductId: req.params.id },
            include: User,
        });
        const fivestar = [];
        const fourstar = [];
        const threestar = [];
        const twostar = [];
        const onestar = [];
        for (let index = 0; index < review.length; index++) {
            if (review[index]['ProductRating'] == 5) {
                fivestar.push(review[index]);
            } else if (review[index]['ProductRating'] == 4) {
                fourstar.push(review[index]);
            } else if (review[index]['ProductRating'] == 3) {
                threestar.push(review[index]);
            } else if (review[index]['ProductRating'] == 2) {
                twostar.push(review[index]);
            } else if (review[index]['ProductRating'] == 1) {
                onestar.push(review[index]);
            }
        }
        const count5 = fivestar.length;
        const count4 = fourstar.length;
        const count3 = threestar.length;
        const count2 = twostar.length;
        const count1 = onestar.length;

        const count = review.length;

        const average =
            (count5 * 5 + count4 * 4 + count3 * 3 + count2 * 2 + count1 * 1) /
            count;
        res.render('./staff/productevaluation/staff-evaluationdetail', {
            review,
            count,
            count1,
            count2,
            count3,
            count4,
            count5,
            average,
        });
    } catch (e) {
        console.log(e);
    }
});

module.exports = PevaluationRouter;
