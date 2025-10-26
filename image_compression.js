// image_compression.js - Utility for compressing images before upload

/**
 * CarTrace Pro - Image Compression Utility
 * Optimizes photos before upload to save bandwidth and improve performance
 */

export class ImageCompressor {
    constructor(options = {}) {
        this.maxWidth = options.maxWidth || 1920;
        this.maxHeight = options.maxHeight || 1080;
        this.quality = options.quality || 0.8;
        this.targetSizeKB = options.targetSizeKB || 500;
    }

    /**
     * Compress a single image file
     * @param {File} file - Image file to compress
     * @returns {Promise<Blob>} - Compressed image blob
     */
    async compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    // Calculate new dimensions
                    let { width, height } = this.calculateDimensions(img.width, img.height);
                    
                    // Create canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    
                    // Enable image smoothing for better quality
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    
                    // Draw and compress
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to blob with progressive quality reduction if needed
                    this.convertToBlob(canvas, file.type).then(resolve).catch(reject);
                };
                
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * Compress multiple images
     * @param {FileList|Array<File>} files - Array of image files
     * @returns {Promise<Array<Blob>>} - Array of compressed image blobs
     */
    async compressMultiple(files) {
        const compressionPromises = Array.from(files).map(file => 
            this.compressImage(file)
        );
        return Promise.all(compressionPromises);
    }

    /**
     * Calculate new dimensions while maintaining aspect ratio
     * @private
     */
    calculateDimensions(width, height) {
        let newWidth = width;
        let newHeight = height;

        // Scale down if larger than max dimensions
        if (width > this.maxWidth || height > this.maxHeight) {
            const ratio = Math.min(
                this.maxWidth / width,
                this.maxHeight / height
            );
            newWidth = Math.round(width * ratio);
            newHeight = Math.round(height * ratio);
        }

        return { width: newWidth, height: newHeight };
    }

    /**
     * Convert canvas to blob with quality adjustment
     * @private
     */
    async convertToBlob(canvas, mimeType = 'image/jpeg') {
        return new Promise((resolve) => {
            let quality = this.quality;
            
            const tryCompress = () => {
                canvas.toBlob((blob) => {
                    const sizeKB = blob.size / 1024;
                    
                    // If size is good or quality is already low, return
                    if (sizeKB <= this.targetSizeKB || quality <= 0.3) {
                        resolve(blob);
                        return;
                    }
                    
                    // Reduce quality and try again
                    quality -= 0.1;
                    tryCompress();
                }, mimeType, quality);
            };
            
            tryCompress();
        });
    }

    /**
     * Get compression stats
     * @param {File} originalFile
     * @param {Blob} compressedBlob
     * @returns {Object} - Compression statistics
     */
    getCompressionStats(originalFile, compressedBlob) {
        const originalSizeKB = originalFile.size / 1024;
        const compressedSizeKB = compressedBlob.size / 1024;
        const reduction = ((originalSizeKB - compressedSizeKB) / originalSizeKB * 100).toFixed(2);

        return {
            originalSize: `${originalSizeKB.toFixed(2)} KB`,
            compressedSize: `${compressedSizeKB.toFixed(2)} KB`,
            reduction: `${reduction}%`,
            saved: `${(originalSizeKB - compressedSizeKB).toFixed(2)} KB`
        };
    }

    /**
     * Create thumbnail from image
     * @param {File} file - Image file
     * @param {number} size - Thumbnail size (square)
     * @returns {Promise<Blob>} - Thumbnail blob
     */
    async createThumbnail(file, size = 200) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    
                    const ctx = canvas.getContext('2d');
                    
                    // Calculate crop dimensions
                    const minDim = Math.min(img.width, img.height);
                    const sx = (img.width - minDim) / 2;
                    const sy = (img.height - minDim) / 2;
                    
                    // Draw cropped and scaled image
                    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
                    
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', 0.8);
                };
                
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
}

// Usage example:
/*
const compressor = new ImageCompressor({
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    targetSizeKB: 500
});

// Compress single image
const compressedBlob = await compressor.compressImage(file);

// Compress multiple images
const compressedImages = await compressor.compressMultiple(files);

// Get compression stats
const stats = compressor.getCompressionStats(originalFile, compressedBlob);
console.log(`Saved ${stats.reduction} (${stats.saved})`);

// Create thumbnail
const thumbnail = await compressor.createThumbnail(file, 200);
*/

export default ImageCompressor;
