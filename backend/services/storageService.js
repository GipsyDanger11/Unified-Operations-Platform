import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Integration from '../models/Integration.js';
import crypto from 'crypto';

// File Storage Integration (AWS S3 / Compatible)
export const uploadFile = async (workspaceId, file, folder = 'general') => {
    try {
        const integration = await Integration.findOne({ workspace: workspaceId });

        if (!integration?.storage?.isConfigured || !integration?.storage?.isActive) {
            console.warn('File storage not configured for workspace:', workspaceId);
            return {
                success: false,
                error: 'File storage not configured',
                gracefulFail: true,
            };
        }

        // Initialize S3 client
        const s3Client = new S3Client({
            region: integration.storage.region,
            credentials: {
                accessKeyId: integration.storage.accessKeyId,
                secretAccessKey: integration.storage.secretAccessKey,
            },
            endpoint: integration.storage.endpoint, // For S3-compatible services
        });

        // Generate unique filename
        const fileExtension = file.originalname.split('.').pop();
        const uniqueFilename = `${crypto.randomUUID()}.${fileExtension}`;
        const key = `${workspaceId}/${folder}/${uniqueFilename}`;

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: integration.storage.bucketName,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            Metadata: {
                originalName: file.originalname,
                uploadedAt: new Date().toISOString(),
            },
        });

        await s3Client.send(command);

        console.log('✅ File uploaded:', key);

        return {
            success: true,
            fileUrl: `https://${integration.storage.bucketName}.s3.${integration.storage.region}.amazonaws.com/${key}`,
            key: key,
            filename: uniqueFilename,
            originalName: file.originalname,
            size: file.size,
        };

    } catch (error) {
        console.error('❌ File upload error:', error.message);
        // Graceful failure - don't break the core flow
        return {
            success: false,
            error: error.message,
            gracefulFail: true,
        };
    }
};

export const getFileUrl = async (workspaceId, key, expiresIn = 3600) => {
    try {
        const integration = await Integration.findOne({ workspace: workspaceId });

        if (!integration?.storage?.isConfigured) {
            return { success: false, error: 'Storage not configured', gracefulFail: true };
        }

        const s3Client = new S3Client({
            region: integration.storage.region,
            credentials: {
                accessKeyId: integration.storage.accessKeyId,
                secretAccessKey: integration.storage.secretAccessKey,
            },
            endpoint: integration.storage.endpoint,
        });

        const command = new GetObjectCommand({
            Bucket: integration.storage.bucketName,
            Key: key,
        });

        const url = await getSignedUrl(s3Client, command, { expiresIn });

        return { success: true, url };

    } catch (error) {
        console.error('❌ Get file URL error:', error.message);
        return { success: false, error: error.message, gracefulFail: true };
    }
};

export const deleteFile = async (workspaceId, key) => {
    try {
        const integration = await Integration.findOne({ workspace: workspaceId });

        if (!integration?.storage?.isConfigured) {
            return { success: false, error: 'Storage not configured', gracefulFail: true };
        }

        const s3Client = new S3Client({
            region: integration.storage.region,
            credentials: {
                accessKeyId: integration.storage.accessKeyId,
                secretAccessKey: integration.storage.secretAccessKey,
            },
            endpoint: integration.storage.endpoint,
        });

        const command = new DeleteObjectCommand({
            Bucket: integration.storage.bucketName,
            Key: key,
        });

        await s3Client.send(command);

        console.log('✅ File deleted:', key);
        return { success: true };

    } catch (error) {
        console.error('❌ File delete error:', error.message);
        return { success: false, error: error.message, gracefulFail: true };
    }
};

export const testStorageConnection = async (config) => {
    try {
        const s3Client = new S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
            endpoint: config.endpoint,
        });

        // Test by uploading a small test file
        const testKey = 'test-connection.txt';
        const uploadCommand = new PutObjectCommand({
            Bucket: config.bucketName,
            Key: testKey,
            Body: Buffer.from('Test connection'),
        });

        await s3Client.send(uploadCommand);

        // Clean up test file
        const deleteCommand = new DeleteObjectCommand({
            Bucket: config.bucketName,
            Key: testKey,
        });

        await s3Client.send(deleteCommand);

        return { success: true, message: 'Storage connection successful' };

    } catch (error) {
        console.error('Storage test failed:', error);
        return { success: false, error: error.message };
    }
};
