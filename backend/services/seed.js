const User = require('../models/User');
const MenuItem = require('../models/MenuItem');
const Inventory = require('../models/Inventory');

const seedData = async () => {
    try {
        // Seed Super Admin (always check separately)
        const superAdminExists = await User.findOne({ email: 'superadmin@petpooja.com' });
        if (!superAdminExists) {
            await User.create({
                name: 'Super Admin',
                email: 'superadmin@petpooja.com',
                password: 'superadmin123',
                role: 'SuperAdmin'
            });
            console.log('🔑 Super Admin seeded: superadmin@petpooja.com / superadmin123');
        }

        const adminExists = await User.findOne({ email: 'admin@test.com' });
        if (adminExists) {
            console.log('📦 Seed data already exists, skipping...');
            return;
        }

        console.log('🌱 Seeding demo data...');

        // Create Admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@test.com',
            password: 'admin123',
            role: 'Admin'
        });

        const adminId = admin._id;

        // Create additional staff users
        await User.create([
            { name: 'Kitchen Staff', email: 'kitchen@test.com', password: 'kitchen123', role: 'Kitchen Staff' },
            { name: 'Cashier User', email: 'cashier@test.com', password: 'cashier123', role: 'Cashier' },
            { name: 'Manager User', email: 'manager@test.com', password: 'manager123', role: 'Manager' }
        ]);

        // Create Inventory Items (owned by admin)
        const inventoryItems = await Inventory.create([
            { owner: adminId, name: 'Tomatoes', category: 'Vegetables', quantity: 50, unit: 'kg', costPerUnit: 40, lowStockThreshold: 10 },
            { owner: adminId, name: 'Onions', category: 'Vegetables', quantity: 40, unit: 'kg', costPerUnit: 30, lowStockThreshold: 10 },
            { owner: adminId, name: 'Chicken', category: 'Meat', quantity: 30, unit: 'kg', costPerUnit: 200, lowStockThreshold: 5 },
            { owner: adminId, name: 'Rice', category: 'Grains', quantity: 100, unit: 'kg', costPerUnit: 60, lowStockThreshold: 15 },
            { owner: adminId, name: 'Milk', category: 'Dairy', quantity: 20, unit: 'l', costPerUnit: 55, lowStockThreshold: 5 },
            { owner: adminId, name: 'Cheese', category: 'Dairy', quantity: 8, unit: 'kg', costPerUnit: 400, lowStockThreshold: 3 },
            { owner: adminId, name: 'Coffee Beans', category: 'Beverages', quantity: 5, unit: 'kg', costPerUnit: 800, lowStockThreshold: 2 },
            { owner: adminId, name: 'Tea Leaves', category: 'Beverages', quantity: 3, unit: 'kg', costPerUnit: 500, lowStockThreshold: 1 },
            { owner: adminId, name: 'Paneer', category: 'Dairy', quantity: 15, unit: 'kg', costPerUnit: 300, lowStockThreshold: 5 },
            { owner: adminId, name: 'Flour', category: 'Grains', quantity: 60, unit: 'kg', costPerUnit: 35, lowStockThreshold: 10 }
        ]);

        // Create Menu Items (owned by admin)
        await MenuItem.create([
            {
                owner: adminId,
                name: 'Margherita Pizza',
                description: 'Classic pizza with fresh mozzarella, tomatoes, and basil',
                category: 'Main Course',
                price: 299,
                isVeg: true,
                preparationTime: 20,
                variants: [
                    { name: 'Small', price: 199 },
                    { name: 'Medium', price: 299 },
                    { name: 'Large', price: 449 }
                ],
                toppings: [
                    { name: 'Extra Cheese', price: 50 },
                    { name: 'Olives', price: 30 },
                    { name: 'Jalapenos', price: 25 }
                ],
                ingredients: [
                    { inventoryItem: inventoryItems[0]._id, quantityUsed: 0.2 },
                    { inventoryItem: inventoryItems[5]._id, quantityUsed: 0.15 },
                    { inventoryItem: inventoryItems[9]._id, quantityUsed: 0.3 }
                ]
            },
            {
                owner: adminId,
                name: 'Butter Chicken',
                description: 'Creamy tomato-based chicken curry with butter and spices',
                category: 'Main Course',
                price: 349,
                isVeg: false,
                preparationTime: 25,
                variants: [
                    { name: 'Half', price: 199 },
                    { name: 'Full', price: 349 }
                ],
                ingredients: [
                    { inventoryItem: inventoryItems[2]._id, quantityUsed: 0.25 },
                    { inventoryItem: inventoryItems[0]._id, quantityUsed: 0.15 },
                    { inventoryItem: inventoryItems[1]._id, quantityUsed: 0.1 }
                ]
            },
            {
                owner: adminId,
                name: 'Paneer Tikka',
                description: 'Grilled cottage cheese marinated in spices and yogurt',
                category: 'Starters',
                price: 249,
                isVeg: true,
                preparationTime: 15,
                ingredients: [
                    { inventoryItem: inventoryItems[8]._id, quantityUsed: 0.2 },
                    { inventoryItem: inventoryItems[1]._id, quantityUsed: 0.1 }
                ]
            },
            {
                owner: adminId,
                name: 'Chicken Biryani',
                description: 'Fragrant basmati rice cooked with tender chicken and aromatic spices',
                category: 'Rice',
                price: 299,
                isVeg: false,
                preparationTime: 30,
                variants: [
                    { name: 'Half', price: 179 },
                    { name: 'Full', price: 299 }
                ],
                ingredients: [
                    { inventoryItem: inventoryItems[2]._id, quantityUsed: 0.2 },
                    { inventoryItem: inventoryItems[3]._id, quantityUsed: 0.3 },
                    { inventoryItem: inventoryItems[1]._id, quantityUsed: 0.1 }
                ]
            },
            {
                owner: adminId,
                name: 'Masala Dosa',
                description: 'Crispy rice crepe filled with spiced potato filling',
                category: 'Snacks',
                price: 149,
                isVeg: true,
                preparationTime: 12,
                ingredients: [
                    { inventoryItem: inventoryItems[3]._id, quantityUsed: 0.15 },
                    { inventoryItem: inventoryItems[0]._id, quantityUsed: 0.1 }
                ]
            },
            {
                owner: adminId,
                name: 'Cold Coffee',
                description: 'Refreshing blended coffee with milk and ice cream',
                category: 'Beverages',
                price: 149,
                isVeg: true,
                preparationTime: 5,
                variants: [
                    { name: 'Regular', price: 149 },
                    { name: 'Large', price: 199 }
                ],
                ingredients: [
                    { inventoryItem: inventoryItems[6]._id, quantityUsed: 0.02 },
                    { inventoryItem: inventoryItems[4]._id, quantityUsed: 0.2 }
                ]
            },
            {
                owner: adminId,
                name: 'Gulab Jamun',
                description: 'Deep fried dumplings soaked in rose-flavored sugar syrup',
                category: 'Desserts',
                price: 99,
                isVeg: true,
                preparationTime: 5,
                ingredients: [
                    { inventoryItem: inventoryItems[4]._id, quantityUsed: 0.1 },
                    { inventoryItem: inventoryItems[9]._id, quantityUsed: 0.1 }
                ]
            },
            {
                owner: adminId,
                name: 'Veg Spring Rolls',
                description: 'Crispy rolls filled with mixed vegetables',
                category: 'Starters',
                price: 179,
                isVeg: true,
                preparationTime: 10,
                ingredients: [
                    { inventoryItem: inventoryItems[0]._id, quantityUsed: 0.1 },
                    { inventoryItem: inventoryItems[1]._id, quantityUsed: 0.1 },
                    { inventoryItem: inventoryItems[9]._id, quantityUsed: 0.15 }
                ]
            },
            {
                owner: adminId,
                name: 'Masala Chai',
                description: 'Traditional Indian tea brewed with spices and milk',
                category: 'Beverages',
                price: 49,
                isVeg: true,
                preparationTime: 5,
                ingredients: [
                    { inventoryItem: inventoryItems[7]._id, quantityUsed: 0.01 },
                    { inventoryItem: inventoryItems[4]._id, quantityUsed: 0.15 }
                ]
            },
            {
                owner: adminId,
                name: 'Naan Bread',
                description: 'Freshly baked tandoori bread',
                category: 'Breads',
                price: 49,
                isVeg: true,
                preparationTime: 8,
                variants: [
                    { name: 'Plain', price: 49 },
                    { name: 'Butter', price: 59 },
                    { name: 'Garlic', price: 69 },
                    { name: 'Cheese', price: 89 }
                ],
                ingredients: [
                    { inventoryItem: inventoryItems[9]._id, quantityUsed: 0.15 }
                ]
            }
        ]);

        console.log('✅ Demo data seeded successfully!');
        console.log('   Admin: admin@test.com / admin123');
        console.log('   Kitchen: kitchen@test.com / kitchen123');
        console.log('   Cashier: cashier@test.com / cashier123');
        console.log('   Manager: manager@test.com / manager123');
    } catch (error) {
        console.error('❌ Error seeding data:', error.message);
    }
};

module.exports = seedData;
