const Code = require('../models/Code');
const User = require('../models/User');
const transporter = require('../utils/mailer');
const generateToken = require('../utils/generateTokens');

exports.sendCode = async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(409).json({ error: 'Користувач з таким email вже існує' });
    }
    await Code.create({ email, code, expiresAt });

    await transporter.sendMail({
        from: `PetHealth <${process.env.EMAIL}>`,
        to: email,
        subject: 'Ваш код для реєстрації в PetHealth',
        text: `Ваш код: ${code}. Увага! Код дійсний 5 хвилин!`
    });

    res.status(200).json({ message: 'Code sent' });
};

exports.sendCodeSignIn = async (req, res) => {
    const { email } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const existing = await User.findOne({ email });
    if (existing.isArchived) {
        return res.status(404).json({ error: 'Акаунт цього користувача видалено. Зверніться до адміністрації PetHealth для відновлення.'});
    }
    if (!existing) {
        return res.status(404).json({ error: 'Користувача з таким email не існує' });
    }
    await Code.create({ email, code, expiresAt });
    await transporter.sendMail({
        from: `PetHealth <${process.env.EMAIL}>`,
        to: email,
        subject: 'Ваш код для входу в PetHealth',
        text: `Ваш код: ${code}. Увага! Код дійсний 5 хвилин!`
    });

    res.status(200).json({ message: 'Code sent' });
};

exports.signup = async (req, res) => {
    const { email, phone, code } = req.body;

    const record = await Code.findOne({ email, code });
    console.log("record for email " + email + "and code " + code + " = " + record);
    if (!record) {
        return res.status(401).json({ error: 'Код неправильний або час його дії вичерпаний' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(409).json({ error: 'Користувач з таким email вже існує' });
    }
    await Code.findOneAndDelete({ email, code });
    const user = await User.create({ email, phone, role: 'client' });
    console.log(user);
    const token = generateToken(user);
    res.status(201).json({ token, role: user.role });
};

exports.signin = async (req, res) => {
    const { email, code } = req.body;

    const record = await Code.findOne({ email, code });
    console.log("record for email " + email + " and code " + code + " = " + record);

    if (!record || record.expiresAt < new Date()) {
        return res.status(401).json({ error: 'Код неправильний або час його дії вичерпаний' });
    }
    await Code.findOneAndDelete({ email, code });
    const user = await User.findOne({ email });
    if (user.isArchive) {
        return res.status(404).json({ error: 'Акаунт цього користувача видалено. Зверніться до адміністрації PetHealth для відновлення.'});
    }
    if (!user) {
        return res.status(404).json({ error: 'Користувача не знайдено. Спочатку зареєструйтесь.' });
    }

    const token = generateToken(user);
    res.status(200).json({ token, role: user.role });
};
