const Product = require('../models/Product');
const Category = require('../models/Category');
const Species = require('../models/Species');
const Order = require('../models/Order');
const Recipe = require('../models/Recipe');


exports.getProducts = async (req, res) => {
    try {
        const { search, speciesId, categoryId, page = 1, limit = 10 } = req.query;
        const filter = { isArchived: false };

        if (search) filter.name = { $regex: search, $options: 'i' };
        if (speciesId) filter.speciesId = speciesId;
        if (categoryId) filter.categoryId = categoryId;

        const products = await Product.find(filter)
            .populate('categoryId', 'name')
            .populate('speciesId', 'name')
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const count = await Product.countDocuments(filter);

        res.json({
            products,
            totalPages: Math.ceil(count / limit),
        });
    } catch (e) {
        res.status(500).json({ error: 'Помилка при завантаженні товарів' });
    }
};

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (e) {
        res.status(500).json({ error: 'Помилка при завантаженні категорій' });
    }
};

exports.getSpecies = async (req, res) => {
    try {
        const species = await Species.find();
        res.json(species);
    } catch (e) {
        res.status(500).json({ error: 'Помилка при завантаженні видів тварин' });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { userId, items, delivery, paymentMethod, recipes } = req.body;

        if (!userId || !items?.length || !delivery || !paymentMethod) {
            return res.status(400).json({ error: 'Некоректні дані замовлення' });
        }

        // Перевірка доставки
        switch (delivery.method) {
            case 'np_branch':
                if (!delivery.city || !delivery.branch) {
                    return res.status(400).json({ error: 'Місто та № відділення обовʼязкові' });
                }
                break;
            case 'np_postomat':
                if (!delivery.city || !delivery.postomat) {
                    return res.status(400).json({ error: 'Місто та ID поштомату обовʼязкові' });
                }
                break;
            case 'np_courier':
                if (!delivery.city || !delivery.address) {
                    return res.status(400).json({ error: 'Місто та адреса обовʼязкові' });
                }
                break;
            case 'pickup':
                break;
            default:
                return res.status(400).json({ error: 'Невідомий метод доставки' });
        }

        // Валідація оплати
        const validMethods = {
            pickup: ['cash', 'card'],
            np_courier: ['cash', 'card'],
            np_branch: ['cod'],
            np_postomat: ['cod']
        };
        if (!validMethods[delivery.method]?.includes(paymentMethod)) {
            return res.status(400).json({ error: 'Недопустимий спосіб оплати для цього типу доставки' });
        }

        // Перевірка залишків і підрахунок суми
        let total = 0;
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product || product.isArchived) {
                return res.status(400).json({ error: `Товар недоступний: ${item.productId}` });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Недостатньо товару: ${product.name}` });
            }

            total += product.price * item.quantity;

            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        // 🔄 Зменшення кількості в рецептах
        if (recipes && typeof recipes === 'object') {
            for (const [productId, recipeId] of Object.entries(recipes)) {
                const recipe = await Recipe.findById(recipeId);
                if (!recipe) continue;

                const index = recipe.products.findIndex(p => p.productId.toString() === productId);
                if (index !== -1) {
                    const item = recipe.products[index];
                    const orderItem = items.find(i => i.productId === productId);
                    const orderedQty = orderItem?.quantity || 0;

                    if (item.quantity > orderedQty) {
                        item.quantity -= orderedQty;
                    } else {
                        recipe.products.splice(index, 1);
                    }

                    await recipe.save();
                }
            }
        }

        const orderNumber = await generateUniqueOrderNumber();

        const order = await Order.create({
            orderNumber,
            userId,
            items,
            total,
            delivery,
            paymentMethod,
            status: 'pending',
            createdAt: new Date()
        });

        res.status(201).json({ message: 'Замовлення створено', orderId: order._id });
    } catch (e) {
        console.error('❌ ORDER ERROR', e);
        res.status(500).json({ error: 'Помилка при оформленні замовлення' });
    }
};

const generateUniqueOrderNumber = async () => {
    let unique = false;
    let number = '';

    while (!unique) {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(100 + Math.random() * 900); // 3 цифри
        number = `ORD-${timestamp}${random}`;

        const exists = await Order.findOne({ orderNumber: number });
        if (!exists) unique = true;
    }

    return number;
};

exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(userId);
        const orders = await Order.find({ userId })
            .sort({ createdAt: -1 })
            .populate('items.productId', 'name price unit')
            .lean();

        res.json(orders);
    } catch (e) {
        console.error('❌ getUserOrders error:', e);
        res.status(500).json({ error: 'Не вдалося завантажити замовлення' });
    }
};




