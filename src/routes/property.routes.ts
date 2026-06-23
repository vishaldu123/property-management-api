import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.middleware';
import {
  createProperty,
  deleteProperty,
  getProperty,
  listProperties,
  updateProperty,
} from '../controllers/property.controller';

const router = Router();

router.use(requireAuth);
router.get('/', listProperties);
router.get('/:propertyId', getProperty);
router.post('/', requireRole(['MANAGER', 'ADMIN', 'OWNER']), createProperty);
router.put('/:propertyId', requireRole(['MANAGER', 'ADMIN', 'OWNER']), updateProperty);
router.delete('/:propertyId', requireRole(['ADMIN', 'OWNER']), deleteProperty);

export default router;
