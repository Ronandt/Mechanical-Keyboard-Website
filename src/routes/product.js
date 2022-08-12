const express = require('express');
const db = require('../models/database_setup');
const Product = require('../models/product');
const Products = require('../models/product');
const productRouter = express.Router();
const product = require('../models/product');

const fs = require('fs');

//const productIDtest = 0
productRouter.get('/', (req, res) => {
    console.log('Product Render');
    res.render('./staff/staff-productCreate');
});

productRouter.post('/', async function (req, res) {
    let { name, description, category, stock, price, colour, image, brand } = req.body;
    //const imageAsBase64 = "data:image/png;base64, " + fs.readFileSync(`public/uploads/${image}`, 'base64');
    const products = await (
        await product.findAll({
            attributes: ['name', 'id', 'colour', 'category'],
        })
    ).map((x) => x.dataValues);
    productID = 1;

    if (products.length == 0) {
        productID = 1;
    } else {
        //console.log("ID IS HERE",products[products.length-1]["productID"])
        productID = products[products.length - 1]['productID'] + 1;
        //console.log("AFTER",productID)
    }
    flag = true;
    for (let index = 0; index < products.length; index++) {
        const usedName = products[index]['name'].toUpperCase();
        console.log(products[index]['colour']);
        const usedColour = products[index]['colour'].toUpperCase();
        if (
            products[index]['category'] == 'Pre-Built Keyboard' ||
            products[index]['category'] == 'Barebones Kit'
        ) {
            if (
                usedName == name.toUpperCase() &&
                usedColour == colour.toUpperCase()
            ) {
                flag = false;
            }
        } else if (usedName == name.toUpperCase()) {
            flag = false;
        }
    }
    if (flag) {
        console.log(image);
        product.create({
            productID,
            name,
            description,
            category,
            stock,
            price,
            colour,
            image,
            brand

            //list of attributes
        });
        req.flash('success', name, ' has been successfully added!');
        // req.flash("success",name,description,category,stock,price,"ID:",productID)
    } else {
        req.flash('error', name, ' is already a product!');
    }
    res.redirect('/staff/product/check');
});

productRouter.post('/delete', async function (req, res) {
    let { productID } = req.body;
    //console.log("PRODUCT ID:",productID)
    const value = await Products.findOne({ where: { id: productID } });
    const name = value['name'];
    const removeProduct = await Products.destroy({ where: { id: productID } });
    //console.log("I AM HERE",products)
    req.flash('success', name, ' has been successfully removed.');
    res.redirect('/staff/product/check');
});

productRouter.get('/check', async (req, res) => {
    //idk why flashes dont work so this route is used to render the check page with products
    const products = await (await product.findAll()).map((x) => x.dataValues);
    //console.log("I AM HERE",products)
    return res.render('./staff/staff-products', { products });
});

productRouter.post('/updateRoute', async function (req, res) {
    let { productID } = req.body;
    const product = await Products.findOne({ where: { id: productID } });
    //const allproducts = await (await Products.findAll()).map((x) => x.dataValues);
    res.render('./staff/staff-productUpdate', { product });
});

productRouter.post('/update', async function (req, res) {
    let { id, name, description, category, stock, price, colour, image } =
        req.body;
    console.log('I AM HERE', name);
    const products = await (await Products.findAll()).map((x) => x.dataValues);
    Product.update(
        {
            name: name,
            description: description,
            category: category,
            stock: stock,
            price: price,
            colour: colour,
            image: image,
        },
        { where: { id: id } } //change the button value to this.name to use name:id comparison
    );

    //req.flash("success",name," has been updated successfully!")
    //res.render("./staff/staff-productCheck",{ products });
    req.flash('success', name, ' has been successfully updated');
    res.redirect('/staff/product/check');
});
module.exports = productRouter;
