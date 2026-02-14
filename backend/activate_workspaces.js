import mongoose from 'mongoose';
import Workspace from './models/Workspace.js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const workspaces = await Workspace.find({});
        console.log(`Found ${workspaces.length} workspaces.`);

        for (const w of workspaces) {
            let updates = {};
            if (!w.isActive) updates.isActive = true;
            if (!w.businessType) updates.businessType = 'other';

            if (Object.keys(updates).length > 0) {
                await Workspace.updateOne({ _id: w._id }, { $set: updates });
                console.log(`Updated workspace ${w.businessName}:`, updates);
            } else {
                console.log(`Workspace ${w.businessName} already active and has type.`);
            }
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrate();
