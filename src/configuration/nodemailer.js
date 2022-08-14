const { info } = require('flash-messenger/Alert');
const nodemailer = require('nodemailer');
const nodemailerHbs = require('nodemailer-express-handlebars');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const users = {
    keyhub1: { user: 'keyhub1@gmail.com', pass: 'jjbsogehekusztmk' },
    keyhuborg: { user: 'keyhuborg@gmail.com', pass: 'vitdskhmqubwqxsj' },
};
const transporter = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth: {
        user: users.keyhuborg.user,
        pass: users.keyhuborg.pass,
    },
    secure: true,
});

//KeyHub Org: hBR0I06PlC%9
//Keyhub Org: PASS (vitdskhmqubwqxsj)
//KeyHub Org: USER(keyhuborg@gmail.com)

/*transporter.use("compile", nodemailerHbs({
    viewPath: path.join(__dirname, "../../views"),
    extName: ".hbs",
    defaultLayout: false
}))*/

//"ebioweqbivouqfww" is the user password
class Mail {
    static readHTMLFile(path, callback) {
        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
            if (err) {
                callback(err);
                throw err;
            } else {
                callback(null, html);
            }
        });
    }

    static Send({ subject, email_recipient, template_path, context } = {}) {
        const file = fs.readFile(
            path.join(__dirname, template_path),
            { encoding: 'utf-8' },
            (err, html) => {
                if (err) {
                    console.log(err);
                } else {
                    const template = handlebars.compile(html);
                    const contexts = template(context);
                    const mailOptions = {
                        from: users.keyhuborg.user,
                        to: email_recipient,
                        subject,
                        html: contexts,
                    };

                    transporter.sendMail(mailOptions, (error, response) => {
                        if (error) {
                            console.log(error);
                        }
                    });
                }
            }
        );
    }
}

module.exports = { Mail, transporter };
