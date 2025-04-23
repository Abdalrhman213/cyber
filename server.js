const express = require('express');
const bodyParser = require('body-parser');
const CryptoJS = require('crypto-js');
const app = express();
const port = 3000;

// إعدادات التطبيق
app.use(bodyParser.json());
app.use(express.static('public'));

// دالة لاكتشاف نوع التشفير
function detectEncoding(data) {
    if (data.match(/^[A-Za-z0-9+/=]+$/) && data.length % 4 === 0) {
        return 'base64';
    } else if (data.match(/^[0-9a-fA-F]+$/)) {
        return 'hex';
    } else if (data.match(/^[01\s]+$/)) {
        return 'binary';
    } else if (data.match(/^[\x20-\x7E]+$/)) {
        return 'ascii';
    } else {
        return 'unknown';
    }
}

// نقطة النهاية لفك التشفير
app.post('/decode', (req, res) => {
    const input = req.body.data;
    const types = req.body.types || [detectEncoding(input)];
    let currentData = input;

    try {
        // تنفيذ فك التشفير لكل نوع تم اختياره
        types.forEach(type => {
            switch (type) {
                case 'base64':
                    currentData = Buffer.from(currentData, 'base64').toString('utf-8');
                    break;
                case 'hex':
                    currentData = Buffer.from(currentData, 'hex').toString('utf-8');
                    break;
                case 'url':
                    currentData = decodeURIComponent(currentData);
                    break;
                case 'ascii':
                    currentData = currentData.split(' ').map(num => String.fromCharCode(num)).join('');
                    break;
                case 'rot13':
                    currentData = currentData.replace(/[a-zA-Z]/g, (char) => {
                        const code = char.charCodeAt(0);
                        return String.fromCharCode((code >= 65 && code <= 90) ? ((code - 65 + 13) % 26) + 65 : ((code - 97 + 13) % 26) + 97);
                    });
                    break;
                case 'caesar':
                    const shift = 3; // يمكنك تغيير قيمة الإزاحة
                    currentData = currentData.replace(/[a-zA-Z]/g, (char) => {
                        const code = char.charCodeAt(0);
                        const base = (code >= 65 && code <= 90) ? 65 : 97;
                        return String.fromCharCode(((code - base - shift + 26) % 26) + base);
                    });
                    break;
                case 'binary':
                    currentData = currentData.split(' ').map(bin => String.fromCharCode(parseInt(bin, 2))).join('');
                    break;
                case 'md5':
                    currentData = CryptoJS.MD5(currentData).toString();
                    break;
                case 'sha1':
                    currentData = CryptoJS.SHA1(currentData).toString();
                    break;
                case 'sha256':
                    currentData = CryptoJS.SHA256(currentData).toString();
                    break;
                case 'aes':
                    const key = 'your-secret-key'; // يجب أن يكون لديك مفتاح سري
                    currentData = CryptoJS.AES.decrypt(currentData, key).toString(CryptoJS.enc.Utf8);
                    break;
                default:
                    throw new Error('نوع التشفير غير مدعوم');
            }
        });
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }

    // إرجاع النتيجة
    res.json({ result: currentData });
});

// بدء الخادم
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
