const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const Recipe = require('../models/Recipe');
const mailer = require('../utils/mailer');

const sendRecipeEmail = async ({ recipe }) => {
    try {
        await recipe.populate({
            path: 'products.productId',
            select: 'name unit price'
        });

        const subject = `Створено новий рецепт №${recipe._id}`;

        const html = `
            <h2>Інформація про рецепт №${recipe._id}</h2>
            <table border="1" cellpadding="5" cellspacing="0">
                <thead>
                    <tr>
                        <th>Назва медикаменту</th>
                        <th>Одиниця виміру</th>
                        <th>Кількість</th>
                        <th>Ціна за одиницю</th>
                        <th>Вартість</th>
                    </tr>
                </thead>
                <tbody>
                    ${recipe.products.map(prod => `
                        <tr>
                            <td>${prod.productId?.name || '—'}</td>
                            <td>${prod.productId?.unit || '—'}</td>
                            <td>${prod.quantity}</td>
                            <td>${prod.productId?.price || '—'} грн</td>
                            <td>${prod.quantity * (prod.productId?.price || 0)} грн</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        await mailer.sendMail({
            from: `"PetHealth" <${process.env.EMAIL}>`,
            to: recipe.userId.email,
            subject,
            html
        });
    } catch (e) {
        console.error('Помилка при надсиланні email для рецепта:', e.message);
    }
};

router.post('/', auth, async (req, res) => {
    try {
        const { userId, petId, doctorId, products, validUntil, comment } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'Список медикаментів порожній або некоректний' });
        }

        const recipe = new Recipe({
            userId,
            petId,
            doctorId,
            products,
            validUntil,
            comment: comment || ''
        });

        await recipe.save();


        sendRecipeEmail({ recipe }).catch(err => {
            console.error('Помилка при надсиланні email рецепта:', err.message);
        });

        res.status(201).json(recipe);
    } catch (err) {
        console.error('Create recipe error:', err);
        res.status(500).json({
            message: 'Помилка при створенні рецепта',
            error: err.message
        });
    }
});

router.patch('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { products, comment, validUntil } = req.body;

        const updated = await Recipe.findByIdAndUpdate(
            id,
            {
                ...(products && { products }),
                ...(comment !== undefined && { comment }),
                ...(validUntil && { validUntil })
            },
            { new: true }
        ).populate([
            'products.productId',
            { path: 'userId', select: 'email firstName lastName' }
        ]);

        if (!updated) return res.status(404).json({ message: 'Recipe not found' });

        sendRecipeEmail({ recipe: updated }).catch(err => {
            console.error('Помилка при надсиланні email рецепта:', err.message);
        });

        res.json(updated);
    } catch (e) {
        res.status(500).json({ message: 'Error updating recipe', error: e.message });
    }
});


router.get('/client', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        const recipes = await Recipe.find({
            userId,
            validUntil: { $gte: now },
            products: { $exists: true, $not: { $size: 0 } }
        }).populate([
            {
                path: 'products.productId',
                select: 'name unit price'
            },
            {
                path: 'userId',
                select: 'email firstName lastName'
            }
        ]);

        res.json(recipes);
    } catch (e) {
        res.status(500).json({
            message: 'Помилка при завантаженні рецептів',
            error: e.message
        });
    }
});

module.exports = router;
