const express = require('express');
const Pevaluation = require('../models/product_evaluation');
const PevaluationRouter = express.Router();
const Product = require('../models/product');
PevaluationRouter.get('/:id', async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id);
        const ProductId = product.id;
        console.log(ProductId);
        res.render('./customers/page-product-evaluation', { ProductId });
    } catch (e) {
        console.log(e);
    }
});

PevaluationRouter.post('/:id', async function (req, res) {
    Pevaluation.create({
        ProductId: req.params.id,
        UserId: req.user.id,
        ProductRating: req.body.ProductRating,
        ProductRemarks: req.body.ProductRemarks,
    });
    req.flash(
        'success',
        'Your Product evaluation sent susscessfully, Thank you'
    );
    res.redirect('/');
});

module.exports = PevaluationRouter;
