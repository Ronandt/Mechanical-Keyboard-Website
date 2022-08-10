const express = require('express');
const Product = require('../models/product');
const Pevaluation = require('../models/product_evaluation');
const User = require('../models/User');
const PevaluationRouter = express.Router();

PevaluationRouter.get('/productevaluations', async (req, res) => {
    const product_evaluation = await Pevaluation.findAll({
        include: [
            {
                model: Product,
            },
            {
                model: User,
            },
        ],
    });
    return res.render(
        './staff/productevaluation/staff-productevaluation-retrieve',
        { product_evaluation }
    );
});
// const orders = await Order.findAll({
//     include: [
//         {
//             model: OrderItem,
//             include: {
//                 model: Product
//             }
//         },
//         {
//             model: User
//         },
//     ],
// });

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
module.exports = PevaluationRouter;
