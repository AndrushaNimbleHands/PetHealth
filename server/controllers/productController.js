const Product = require('../models/Product');

exports.getAll = async (req, res) => {
    try {
        const { archived, species, categoryId, search, prescription } = req.query;
        const filter = {};

        if (archived !== undefined) {
            filter.isArchived = archived === 'true';
        }

        if (species) {
            filter.speciesId = species;
        }

        if (categoryId) {
            filter.categoryId = categoryId;
        }

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        if (prescription === 'true') {
            filter.isPrescriptionFree = false;
        }

        const products = await Product.find(filter)
            .populate('speciesId', 'name')
            .populate('categoryId', 'name');

        res.json(products);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};



exports.getById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('speciesId', 'name');
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.create = async (req, res) => {
    try {
        console.log('BODY:', req.body); // <— подивись, що реально приходить

        const newProduct = new Product(req.body);
        const saved = await newProduct.save();
        res.status(201).json(saved);
    } catch (e) {
        console.error('❌ Error saving product:', e.message, e.errors);
        res.status(400).json({ error: e.message, details: e.errors });
    }
};


exports.update = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updated) return res.status(404).json({ error: 'Product not found' });
        res.json(updated);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

exports.archive = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { isArchived: true, archivedAt: new Date() },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Product not found' });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.restore = async (req, res) => {
    try {
        const updated = await Product.findByIdAndUpdate(
            req.params.id,
            { isArchived: false, archivedAt: null },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: 'Product not found' });
        res.json(updated);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

exports.remove = async (req, res) => {
    try {
        const deleted = await Product.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};
