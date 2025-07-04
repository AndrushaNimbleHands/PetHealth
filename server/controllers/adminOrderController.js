const Order = require('../models/Order');
const sendOrderEmail = require('../utils/sendOrderEmail');


exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'firstName lastName email')
            .populate('items.productId', 'name price')
            .populate('userId', 'firstName lastName email phone');

        res.json(orders);
    } catch (e) {
        res.status(500).json({ message: 'Помилка при отриманні замовлень', error: e.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, paymentMethod, delivery } = req.body;

        const order = await Order.findById(id);
        if (!order) return res.status(404).json({ message: 'Замовлення не знайдено' });

        if (status) order.status = status;
        if (paymentMethod) order.paymentMethod = paymentMethod;

        if (delivery) {
            if (!order.delivery) order.delivery = {};
            if (delivery.city !== undefined) order.delivery.city = delivery.city;
            if (delivery.type !== undefined) order.delivery.type = delivery.type;
            if (delivery.address !== undefined) order.delivery.address = delivery.address;
        }

        await order.save();

        const populated = await Order.findById(order._id)
            .populate('userId', 'firstName lastName email')
            .populate('items.productId', 'name price unit');

        await sendOrderEmail({ order: populated, type: 'updated' });
        res.json(populated);
    } catch (e) {
        console.error('❌ updateOrder error:', e.message);
        res.status(500).json({ message: 'Помилка при оновленні замовлення', error: e.message });
    }
};


