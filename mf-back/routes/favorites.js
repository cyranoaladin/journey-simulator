const express = require('express');
const router = express.Router();
const FavoriteResource = require('../models/FavoriteResource');

/**
 * GET /api/favorites
 * Retrieves all user favorites
 */
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId || 'anonymous';
        const favorites = await FavoriteResource.find({ userId }).sort({ savedAt: -1 });
        res.json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites' });
    }
});

/**
 * POST /api/favorites
 * Ajoute une ressource aux favoris
 */
router.post('/', async (req, res) => {
    try {
        const { userId = 'anonymous', journeyId, resource, tags, notes } = req.body;

        if (!resource || !resource.id || !resource.label) {
            return res.status(400).json({ error: 'Invalid resource data' });
        }

        const favorite = new FavoriteResource({
            userId,
            journeyId,
            resource,
            tags,
            notes
        });

        await favorite.save();
        res.status(201).json(favorite);
    } catch (error) {
        if (error.code === 11000) {
            // Duplicate key error
            return res.status(409).json({ error: 'Resource already in favorites' });
        }
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Failed to add favorite' });
    }
});

/**
 * DELETE /api/favorites/:id
 * Supprime un favori
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId || 'anonymous';

        const result = await FavoriteResource.findOneAndDelete({
            _id: id,
            userId
        });

        if (!result) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.json({ message: 'Favorite removed successfully' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

/**
 * DELETE /api/favorites/resource/:resourceId
 * Supprime un favori par resource.id
 */
router.delete('/resource/:resourceId', async (req, res) => {
    try {
        const { resourceId } = req.params;
        const userId = req.query.userId || 'anonymous';

        const result = await FavoriteResource.findOneAndDelete({
            'resource.id': resourceId,
            userId
        });

        if (!result) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.json({ message: 'Favorite removed successfully' });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ error: 'Failed to remove favorite' });
    }
});

/**
 * PATCH /api/favorites/:id
 * Met à jour les notes/tags d'un favori
 */
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId || 'anonymous';
        const { tags, notes } = req.body;

        const favorite = await FavoriteResource.findOneAndUpdate(
            { _id: id, userId },
            { $set: { tags, notes } },
            { new: true }
        );

        if (!favorite) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.json(favorite);
    } catch (error) {
        console.error('Error updating favorite:', error);
        res.status(500).json({ error: 'Failed to update favorite' });
    }
});

module.exports = router;
