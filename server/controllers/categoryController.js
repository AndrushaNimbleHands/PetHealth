const Category = require('../models/Category');
const Product = require('../models/Product');

exports.getAll = async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        const category = await Category.create({ name: req.body.name });
        res.status(201).json(category);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

exports.update = async (req, res) => {
    try {
        const updated = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
        if (!updated) return res.status(404).json({ error: 'Category not found' });
        res.json(updated);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ error: 'Category not found' });

        await Product.updateMany({ category: category.name }, { category: 'Загальні' });

        res.json({ message: 'Категорія видалена, товари оновлено' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
