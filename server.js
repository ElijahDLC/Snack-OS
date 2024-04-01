const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

let data = {};
try {
    data = JSON.parse(fs.readFileSync('balances.json', 'utf8'));
} catch (err) {
    console.error('Error reading balances.json:', err);
}

let balances = data.balances || [];

app.post('/update-balances', (req, res) => {
    const { name, totalPrice } = req.body;
    const index = balances.findIndex(account => account.name === name);
    if (index !== -1) {
        balances[index].balance += totalPrice;
        saveDataToFile();
        res.sendStatus(200);
    } else {
        res.status(404).send('Name not found');
    }
});

app.post('/create-account', (req, res) => {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
        res.status(400).send('Invalid name');
        return;
    }

    if (balances.some(account => account.name === name)) {
        res.status(409).send('Name already exists');
        return;
    }

    balances.push({ name: name, balance: 0 });
    saveDataToFile();
    res.sendStatus(200);
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/balances.json');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

function saveDataToFile() {
    const newData = { balances: balances, products: data.products };
    fs.writeFileSync('balances.json', JSON.stringify(newData, null, 2));
}

app.post('/delete-account', (req, res) => {
    const { name } = req.body;
    const index = balances.findIndex(account => account.name === name);
    if (index !== -1) {
        balances.splice(index, 1);
        saveDataToFile(); // Call saveDataToFile after removing the account
        res.sendStatus(200);
    } else {
        res.status(404).send('Name not found');
    }
});

app.post('/reset-balance', (req, res) => {
    const { name, confirmReset } = req.body;
    const index = balances.findIndex(account => account.name === name);
    if (index !== -1 && confirmReset) {
        balances[index].balance = 0;
        saveDataToFile(); // Call saveDataToFile after resetting the balance
        res.sendStatus(200);
    } else {
        res.status(400).send('Reset not confirmed or name not found');
    }
});

app.post('/subtract-balance', (req, res) => {
    const { name, amount } = req.body;
    const index = balances.findIndex(account => account.name === name);
    if (index !== -1) {
        balances[index].balance -= parseFloat(amount);
        saveDataToFile(); // Call saveDataToFile after subtracting the balance
        res.sendStatus(200);
    } else {
        res.status(404).send('Name not found');
    }
});

