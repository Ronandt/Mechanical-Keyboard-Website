const { addDocumentToKnowledgeBase } = require('./util');

async function exportFAQDocument(path) {
    const FAQs = require('../models/FAQs');
    const fs = require('fs');
    const faqs = await FAQs.findAll();
    console.log(faqs);
    if (fs.existsSync(path)) {
        fs.unlinkSync(path);
    }
    var dir = path.split('/');
    dir.pop();
    dir = dir.join('/');
    console.log('DIR', dir);
    if (!fs.existsSync(path)) {
        console.log('Bruh crash');
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path, '');
    faqs.forEach((faq) => {
        var data = `${faq.Question},${faq.Answer}`;
        fs.appendFileSync(path, data);
    });
}

async function syncFAQDialogflow(
    projectId,
    knowledgeBaseFullName,
    documentPath,
    credentials
) {
    const mimeType = 'text/csv';
    const knowledgeTypes = 'FAQ';
    const documentName = 'FAQDocument';
    await addDocumentToKnowledgeBase(
        projectId,
        knowledgeBaseFullName,
        documentPath,
        documentName,
        knowledgeTypes,
        mimeType,
        credentials
    );
}

module.exports = { syncFAQDialogflow, exportFAQDocument };
