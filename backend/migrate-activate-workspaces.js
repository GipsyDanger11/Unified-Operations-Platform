import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Workspace from './models/Workspace.js';

dotenv.config();

const updateWorkspaces = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Update all workspaces to be active
        const result = await Workspace.updateMany(
            { isActive: false },
            { $set: { isActive: true } }
        );

        console.log(`✅ Updated ${result.modifiedCount} workspace(s) to active`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

updateWorkspaces();
